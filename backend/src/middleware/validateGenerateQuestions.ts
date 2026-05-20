import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandler';

const MIN_LENGTH = 2;
const MAX_LENGTH = 200;
const HAS_LETTER_REGEX = /[A-Za-z]/;

export const validateGenerateQuestions = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const body = req.body as { jobTitle?: unknown } | undefined;
  const raw = body?.jobTitle;

  if (raw === undefined || raw === null) {
    return next(new HttpError(400, 'jobTitle is required'));
  }
  if (typeof raw !== 'string') {
    return next(new HttpError(400, 'jobTitle must be a string'));
  }

  const jobTitle = raw.trim();
  if (jobTitle.length < MIN_LENGTH) {
    return next(new HttpError(400, `jobTitle must be at least ${MIN_LENGTH} characters`));
  }
  if (jobTitle.length > MAX_LENGTH) {
    return next(new HttpError(400, `jobTitle must be at most ${MAX_LENGTH} characters`));
  }
  if (!HAS_LETTER_REGEX.test(jobTitle)) {
    return next(new HttpError(400, 'Numbers-only job titles are not allowed'));
  }

  req.body.jobTitle = jobTitle;
  next();
};
