process.env.GROQ_API_KEY = process.env.GROQ_API_KEY ?? 'test-key';
process.env.PORT = process.env.PORT ?? '0';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
process.env.GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
process.env.GROQ_TIMEOUT_MS = process.env.GROQ_TIMEOUT_MS ?? '5000';

// Generous limits so functional tests don't trip the limiter.
process.env.RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS ?? '60000';
process.env.RATE_LIMIT_ANON_MAX = process.env.RATE_LIMIT_ANON_MAX ?? '1000';
process.env.RATE_LIMIT_AUTH_MAX = process.env.RATE_LIMIT_AUTH_MAX ?? '1000';
