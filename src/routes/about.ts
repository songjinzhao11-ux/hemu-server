import { Router } from 'express';
import { getAboutController, updateAboutController } from '../controllers/about';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', async (req, res) => getAboutController(req, res));
router.put('/', authMiddleware, async (req, res) => updateAboutController(req, res));
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imageUrl: `/storage/uploads/${req.file.filename}` });
});

export default router;
