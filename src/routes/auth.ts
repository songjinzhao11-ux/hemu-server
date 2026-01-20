import { Router } from 'express';
import { getAdminByUsername, createAdmin, verifyPassword } from '../models/admin';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await getAdminByUsername(username);

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin.id!, username: admin.username });

    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingAdmin = await getAdminByUsername(username);
    if (existingAdmin) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const admin = await createAdmin(username, password);

    const token = generateToken({ id: admin.id!, username: admin.username });

    res.status(201).json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
