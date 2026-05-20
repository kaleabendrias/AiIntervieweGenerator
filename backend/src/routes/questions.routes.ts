import { Router } from 'express';
import { postGenerateQuestions } from '../controllers/questions.controller';
import { validateGenerateQuestions } from '../middleware/validateGenerateQuestions';

const router = Router();

router.post('/', validateGenerateQuestions, postGenerateQuestions);

export default router;
