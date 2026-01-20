import { Router } from 'express';
import { getAllServices, getServiceById, createService, updateService, deleteService, reorderServices } from '../models/services';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const services = await getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await getServiceById(parseInt(req.params.id));
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const service = await createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await updateService(parseInt(req.params.id), req.body);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await deleteService(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    await reorderServices(req.body.orders);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder services' });
  }
});

export default router;
