import { Response } from 'express';
import { getHero, updateHero } from '../models/hero';
import { AuthRequest } from '../middleware/auth';

export const getHeroController = async (req: AuthRequest, res: Response) => {
  try {
    const hero = await getHero();
    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hero section' });
  }
};

export const updateHeroController = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateHero(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hero section' });
  }
};
