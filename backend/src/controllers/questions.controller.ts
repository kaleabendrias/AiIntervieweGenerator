import type { Request, Response, NextFunction } from 'express';
import { generateInterviewQuestions } from '../services/llm.service';
import type { GenerateQuestionsRequest, GenerateQuestionsResponse } from '../types';

export const postGenerateQuestions = async (
  req: Request<unknown, GenerateQuestionsResponse, GenerateQuestionsRequest>,
  res: Response<GenerateQuestionsResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { jobTitle } = req.body;
    const questions = await generateInterviewQuestions(jobTitle);
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
};
