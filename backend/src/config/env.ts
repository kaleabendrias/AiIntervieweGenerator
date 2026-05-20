import dotenv from 'dotenv';

dotenv.config();

interface Env {
  port: number;
  corsOrigin: string;
  groqApiKey: string;
  groqModel: string;
  groqTimeoutMs: number;
  rateLimitWindowMs: number;
  rateLimitAnonMax: number;
  rateLimitAuthMax: number;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const num = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number for env var ${key}: ${raw}`);
  }
  return parsed;
};

export const env: Env = {
  port: num('PORT', 5000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  groqApiKey: requireEnv('GROQ_API_KEY'),
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  groqTimeoutMs: num('GROQ_TIMEOUT_MS', 15_000),
  rateLimitWindowMs: num('RATE_LIMIT_WINDOW_MS', 60_000),
  rateLimitAnonMax: num('RATE_LIMIT_ANON_MAX', 10),
  rateLimitAuthMax: num('RATE_LIMIT_AUTH_MAX', 60),
};
