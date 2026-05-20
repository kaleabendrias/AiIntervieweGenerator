import rateLimit, { type Options } from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env';

const isAuthenticated = (req: Request): boolean => {
  // Simple bearer-token presence check. Replace with real auth verification when added.
  const header = req.header('authorization');
  return typeof header === 'string' && header.toLowerCase().startsWith('bearer ');
};

const keyGenerator = (req: Request): string => {
  if (isAuthenticated(req)) {
    return `auth:${req.header('authorization')}`;
  }
  return `anon:${req.ip ?? 'unknown'}`;
};

const baseOptions: Partial<Options> = {
  windowMs: env.rateLimitWindowMs,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
};

export const apiRateLimiter = rateLimit({
  ...baseOptions,
  max: (req) => (isAuthenticated(req) ? env.rateLimitAuthMax : env.rateLimitAnonMax),
});
