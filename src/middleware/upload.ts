import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

const uploadPath = path.join(process.cwd(), process.env.UPLOAD_PATH || './storage/uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    let ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      ext = '.jpg';
    }
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // 检查 MIME 类型
  if (!allowedTypes.includes(file.mimetype)) {
    const error: any = new Error(`不支持的文件类型: ${file.mimetype}。仅支持 JPEG、PNG 和 WebP 格式`);
    error.code = 'INVALID_MIME_TYPE';
    return cb(error);
  }
  
  // 检查文件扩展名
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    const error: any = new Error(`不支持的文件扩展名: ${ext}。仅支持 .jpg、.jpeg、.png 和 .webp`);
    error.code = 'INVALID_EXTENSION';
    return cb(error);
  }
  
  // 检查原始文件名
  if (!file.originalname || file.originalname.length === 0) {
    const error: any = new Error('文件名无效或为空');
    error.code = 'INVALID_FILENAME';
    return cb(error);
  }
  
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
  }
});

export const compressImage = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  const tempPath = filePath + '.tmp';
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return { success: false, error: '上传的文件不存在或已被删除' };
    }

    // 检查文件大小
    const stats = fs.statSync(filePath);
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880');
    if (stats.size > maxSize) {
      fs.unlinkSync(filePath);
      return { success: false, error: `文件过大 (${(stats.size / 1024 / 1024).toFixed(2)}MB)，最大允许 ${(maxSize / 1024 / 1024).toFixed(2)}MB` };
    }

    // 检查文件是否是有效的图像
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.format) {
      fs.unlinkSync(filePath);
      return { success: false, error: '无法识别文件格式，可能文件已损坏' };
    }

    if (!['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      fs.unlinkSync(filePath);
      return { success: false, error: `不支持的图像格式: ${metadata.format}` };
    }

    // 根据原格式选择压缩参数
    try {
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        await image.jpeg({ quality: 85 }).toFile(tempPath);
      } else if (metadata.format === 'png') {
        await image.png({ quality: 85 }).toFile(tempPath);
      } else if (metadata.format === 'webp') {
        await image.webp({ quality: 85 }).toFile(tempPath);
      }

      // 验证临时文件是否存在且有效
      if (!fs.existsSync(tempPath)) {
        return { success: false, error: '图像压缩失败：无法创建压缩文件' };
      }

      const tempStats = fs.statSync(tempPath);
      if (tempStats.size === 0) {
        fs.unlinkSync(tempPath);
        return { success: false, error: '图像压缩失败：输出文件为空' };
      }

      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      return { success: true };
    } catch (compressError: any) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      const errorMsg = compressError.message || '图像压缩处理失败';
      return { success: false, error: `图像处理错误: ${errorMsg}` };
    }
  } catch (error: any) {
    // 清理临时文件
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const errorMsg = error.message || '未知错误';
    console.error('图像压缩失败:', error);
    
    // 返回用户友好的错误信息
    if (errorMsg.includes('EISDIR')) {
      return { success: false, error: '上传的不是文件，请检查您的操作' };
    } else if (errorMsg.includes('EACCES')) {
      return { success: false, error: '服务器无权限访问文件' };
    } else if (errorMsg.includes('ENOENT')) {
      return { success: false, error: '文件路径无效或不存在' };
    }
    
    return { success: false, error: `处理失败: ${errorMsg}` };
  }
};
