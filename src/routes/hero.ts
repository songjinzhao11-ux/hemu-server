import { Router } from 'express';
import { getHeroController, updateHeroController } from '../controllers/hero';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', async (req, res) => getHeroController(req, res));
router.put('/', authMiddleware, async (req, res) => updateHeroController(req, res));
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imageUrl: `/storage/uploads/${req.file.filename}` });
});

export default router;
