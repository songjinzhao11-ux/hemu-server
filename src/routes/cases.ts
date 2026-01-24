import { Router, Request, Response, NextFunction } from 'express';
import { getAllCases, getCaseById, createCase, updateCase, deleteCase, reorderCases } from '../models/cases';
import { authMiddleware } from '../middleware/auth';
import { upload, compressImage } from '../middleware/upload';
import multer from 'multer';

const router = Router();

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
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case' });
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

export default router;
