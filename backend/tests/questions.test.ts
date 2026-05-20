import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { llmState, resetLlmBehavior, setLlmBehavior } from './helpers/llmMock';

vi.mock('groq-sdk', () => {
  const create = vi.fn(async () => {
    const b = llmState.behavior;
    if (b.kind === 'error') throw b.error;
    return { choices: [{ message: { content: b.text } }] };
  });

  class Groq {
    chat = { completions: { create } };
  }

  return { default: Groq };
});

// Imported after vi.mock so the service picks up the mocked SDK.
const { createApp } = await import('../src/app');
const app = createApp();

beforeEach(() => {
  resetLlmBehavior();
});

describe('POST /api/questions', () => {
  it('returns 3 questions on success', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({ jobTitle: 'Customer Success Manager' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      questions: ['Question 1?', 'Question 2?', 'Question 3?'],
    });
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions).toHaveLength(3);
  });

  it('strips numbering and bullets from LLM output', async () => {
    setLlmBehavior({
      kind: 'success',
      text: '1. First?\n2) Second?\n- Third?',
    });

    const res = await request(app).post('/api/questions').send({ jobTitle: 'Software Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.questions).toEqual(['First?', 'Second?', 'Third?']);
  });

  it('trims whitespace from jobTitle before validation', async () => {
    const res = await request(app).post('/api/questions').send({ jobTitle: '   Designer   ' });

    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(3);
  });

  describe('validation', () => {
    it('rejects missing jobTitle with 400', async () => {
      const res = await request(app).post('/api/questions').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/required/i);
    });

    it('rejects empty jobTitle with 400', async () => {
      const res = await request(app).post('/api/questions').send({ jobTitle: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 2/i);
    });

    it('rejects whitespace-only jobTitle with 400', async () => {
      const res = await request(app).post('/api/questions').send({ jobTitle: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 2/i);
    });

    it('rejects single-character jobTitle with 400', async () => {
      const res = await request(app).post('/api/questions').send({ jobTitle: 'a' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at least 2/i);
    });

    it.each([
      ['number', 42],
      ['boolean', true],
      ['array', ['Engineer']],
      ['object', { title: 'Engineer' }],
      ['null', null],
    ])('rejects non-string jobTitle (%s) with 400', async (_label, value) => {
      const res = await request(app).post('/api/questions').send({ jobTitle: value });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('LLM failure handling', () => {
    it('returns 502 when the LLM throws', async () => {
      setLlmBehavior({ kind: 'error', error: new Error('upstream down') });

      const res = await request(app).post('/api/questions').send({ jobTitle: 'Data Analyst' });

      expect(res.status).toBe(502);
      expect(res.body.error).toMatch(/failed to generate/i);
    });

    it('returns 502 when the LLM returns fewer than 3 parseable lines', async () => {
      setLlmBehavior({ kind: 'success', text: 'Only one question?' });

      const res = await request(app).post('/api/questions').send({ jobTitle: 'PM' });

      expect(res.status).toBe(502);
      expect(res.body.error).toMatch(/unexpected/i);
    });

    it('returns 429 when the LLM signals quota exceeded', async () => {
      const err = Object.assign(new Error('rate limited'), { status: 429 });
      setLlmBehavior({ kind: 'error', error: err });

      const res = await request(app).post('/api/questions').send({ jobTitle: 'PM' });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/quota/i);
    });
  });

  describe('malformed input', () => {
    it('returns 400 for invalid JSON body', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Content-Type', 'application/json')
        .send('{ this is not json');

      expect(res.status).toBe(400);
    });
  });
});

describe('unknown routes', () => {
  it('returns 404 for unmatched route', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });

  it('returns 404 for wrong method on existing path', async () => {
    const res = await request(app).get('/api/questions');

    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
