import { Router, Request, Response, NextFunction } from 'express';
import { getHeroController, updateHeroController } from '../controllers/hero';
import { authMiddleware } from '../middleware/auth';
import { upload, compressImage } from '../middleware/upload';
import multer from 'multer';

const router = Router();

router.get('/', async (req, res) => getHeroController(req, res));
router.put('/', authMiddleware, async (req, res) => updateHeroController(req, res));
router.post('/image', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
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
