import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import initDb from './utils/initDb';
import migrateCasesTable from './utils/migrateCases';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const uploadPath = path.join(process.cwd(), process.env.UPLOAD_PATH || './storage/uploads');
const assetsPath = process.env.ASSETS_PATH || path.join(process.cwd(), 'assets', 'images');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/storage/uploads', express.static(uploadPath));
app.use('/assets/images', express.static(assetsPath));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 初始化数据库并运行迁移
initDb()
  .then(() => {
    console.log('✓ 数据库初始化完成');
    return migrateCasesTable();
  })
  .then(() => {
    console.log('✓ 数据库迁移完成');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize:', err);
    process.exit(1);
  });
