import { Response } from 'express';
import { getAbout, updateAbout } from '../models/about';
import { AuthRequest } from '../middleware/auth';

export const getAboutController = async (req: AuthRequest, res: Response) => {
  try {
    const about = await getAbout();
    res.json(about);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about section' });
  }
};

export const updateAboutController = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateAbout(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update about section' });
  }
};
