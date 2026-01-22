import { Router } from 'express';
import { getAllCases, getCaseById, createCase, updateCase, deleteCase, reorderCases } from '../models/cases';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

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

router.post('/:id/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imageUrl: `/storage/uploads/${req.file.filename}` });
});

export default router;
