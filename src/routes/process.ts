import { Router } from 'express';
import { getAllProcessSteps, getProcessStepById, createProcessStep, updateProcessStep, deleteProcessStep, reorderProcessSteps } from '../models/process';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const steps = await getAllProcessSteps();
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch process steps' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const step = await getProcessStepById(parseInt(req.params.id));
    if (!step) {
      return res.status(404).json({ error: 'Process step not found' });
    }
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch process step' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const step = await createProcessStep(req.body);
    res.status(201).json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create process step' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const step = await updateProcessStep(parseInt(req.params.id), req.body);
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update process step' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteProcessStep(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Process step not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete process step' });
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    await reorderProcessSteps(req.body.orders);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder process steps' });
  }
});

export default router;
