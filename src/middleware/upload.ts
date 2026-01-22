import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const uploadPath = path.resolve(__dirname, '../..', process.env.UPLOAD_PATH || './storage/uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
  }
});

export const compressImage = async (filePath: string): Promise<void> => {
  try {
    await sharp(filePath)
      .jpeg({ quality: 85 })
      .png({ quality: 85 })
      .toFile(filePath + '.tmp');

    fs.unlinkSync(filePath);
    fs.renameSync(filePath + '.tmp', filePath);
  } catch (error) {
    console.error('Error compressing image:', error);
  }
};
