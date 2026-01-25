import { Router, Request, Response, NextFunction } from 'express';
import { getAllCases, getCaseById, createCase, updateCase, deleteCase, reorderCases } from '../models/cases';
import { authMiddleware } from '../middleware/auth';
import { upload, compressImage } from '../middleware/upload';
import multer from 'multer';
import fs from 'fs';

const router = Router();

// 诊断端点 - 测试路由是否正常
router.get('/:id/gallery/test', (req, res) => {
  res.json({ message: 'Gallery upload route is reachable', caseId: req.params.id });
});

router.get('/', async (req, res) => {
  try {
    const cases = await getAllCases();
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const caseItem = await getCaseById(parseInt(req.params.id));
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const caseItem = await createCase(req.body);
    res.status(201).json(caseItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create case' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const caseItem = await updateCase(parseInt(req.params.id), req.body);
    res.json(caseItem);
  } catch (error: any) {
    console.error('Failed to update case:', error);
    res.status(500).json({ error: 'Failed to update case', details: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteCase(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    await reorderCases(req.body.orders);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder cases' });
  }
});

// Upload single image (main image)
router.post('/:id/image', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '未检测到上传的文件，请重新选择' });
  }
  try {
    // 压缩图片
    const compressResult = await compressImage(req.file.path);
    if (!compressResult.success) {
      return res.status(400).json({ error: compressResult.error });
    }
  } catch (error: any) {
    const errorMsg = error.message || '文件处理失败';
    console.error('图片压缩失败:', error);
    return res.status(500).json({ error: `文件处理失败: ${errorMsg}` });
  }
  res.json({ imageUrl: `/storage/uploads/${req.file.filename}` });
}, (error: any, req: Request, res: Response, next: NextFunction) => {
  // Multer 错误处理
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
      return res.status(400).json({ error: `文件过大，最大允许 ${(maxSize / 1024 / 1024).toFixed(2)}MB` });
    } else if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({ error: '上传的字段过多' });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '一次只能上传一个文件' });
    }
    return res.status(400).json({ error: `上传失败: ${error.message}` });
  }
  
  // 自定义错误（文件类型等）
  if (error && error.code) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: error?.message || '上传失败，请稍后重试' });
});

// Upload multiple gallery images
router.post('/:id/gallery', 
  authMiddleware, 
  (req: Request, res: Response, next: NextFunction) => {
    // 使用 multer 中间件处理文件上传
    const uploadHandler = upload.array('images', 10);
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('[Gallery Upload] Multer 错误:', err);
        
        // 处理 Multer 错误
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
            return res.status(400).json({ error: `文件过大，最大允许 ${(maxSize / 1024 / 1024).toFixed(2)}MB` });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: '一次最多只能上传10张图片' });
          }
          return res.status(400).json({ error: `上传失败: ${err.message}` });
        }
        
        // 处理自定义验证错误
        if (err && (err as any).code) {
          return res.status(400).json({ error: err.message });
        }
        
        return res.status(500).json({ error: err?.message || '上传失败，请稍后重试' });
      }
      
      // 没有错误，继续到下一个处理器
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '未检测到上传的文件，请重新选择' });
    }

    const uploadedUrls: string[] = [];
    const files = req.files as Express.Multer.File[];
    const filesToCleanup: string[] = [];

    try {
      console.log(`[Gallery Upload] 开始处理 ${files.length} 张图片`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        filesToCleanup.push(file.path);
        
        console.log(`[Gallery Upload] 处理第 ${i + 1}/${files.length} 张图片: ${file.filename}`);
        
        // 压缩图片
        const compressResult = await compressImage(file.path);
        if (!compressResult.success) {
          console.error(`[Gallery Upload] 第 ${i + 1} 张图片压缩失败:`, compressResult.error);
          
          // 清理所有已上传的文件
          for (const path of filesToCleanup) {
            try {
              if (fs.existsSync(path)) {
                fs.unlinkSync(path);
                console.log(`[Gallery Upload] 已清理文件: ${path}`);
              }
            } catch (cleanupError) {
              console.error(`[Gallery Upload] 清理文件失败: ${path}`, cleanupError);
            }
          }
          
          return res.status(400).json({ 
            error: `第 ${i + 1} 张图片处理失败: ${compressResult.error}` 
          });
        }
        
        uploadedUrls.push(`/storage/uploads/${file.filename}`);
        console.log(`[Gallery Upload] 第 ${i + 1} 张图片处理成功`);
      }

      console.log(`[Gallery Upload] 全部 ${files.length} 张图片处理成功`);
      console.log(`[Gallery Upload] 返回数据:`, { imageUrls: uploadedUrls });
      res.json({ imageUrls: uploadedUrls });
    } catch (error: any) {
      console.error('[Gallery Upload] 处理过程发生异常:', error);
      
      // 清理所有已上传的文件
      for (const path of filesToCleanup) {
        try {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log(`[Gallery Upload] 已清理文件: ${path}`);
          }
        } catch (cleanupError) {
          console.error(`[Gallery Upload] 清理文件失败: ${path}`, cleanupError);
        }
      }
      
      const errorMsg = error.message || '文件处理失败';
      return res.status(500).json({ error: `文件处理失败: ${errorMsg}` });
    }
  }
);

export default router;
