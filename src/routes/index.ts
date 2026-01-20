import { Router } from 'express';
import heroRouter from './hero';
import aboutRouter from './about';
import servicesRouter from './services';
import processRouter from './process';
import casesRouter from './cases';
import authRouter from './auth';

const router = Router();

router.use('/hero', heroRouter);
router.use('/about', aboutRouter);
router.use('/services', servicesRouter);
router.use('/process', processRouter);
router.use('/cases', casesRouter);
router.use('/auth', authRouter);

export default router;
