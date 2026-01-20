import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import initDb from './utils/initDb';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const uploadPath = path.join(__dirname, '..', process.env.UPLOAD_PATH || './uploads');
const assetsPath = path.join(__dirname, '..', '..', 'assets', 'images');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadPath));
app.use('/assets/images', express.static(assetsPath));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
