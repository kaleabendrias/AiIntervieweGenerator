import Groq from 'groq-sdk';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

const client = new Groq({ apiKey: env.groqApiKey });

const SYSTEM_PROMPT =
  'You are an expert technical recruiter. When asked, you generate concise, ' +
  'realistic, role-specific interview questions and return ONLY the questions ' +
  'with no preamble, numbering, or commentary.';

const buildUserPrompt = (jobTitle: string): string =>
  `Generate exactly 3 professional interview questions for the position of "${jobTitle}".

Rules:
- Each question is one sentence.
- Questions must be tailored to the responsibilities and skills of the role.
- Return ONLY the three questions, one per line. No numbering, bullets, or extra text.`;

const parseQuestions = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 3);

const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new HttpError(504, 'LLM request timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const generateInterviewQuestions = async (jobTitle: string): Promise<string[]> => {
  let text: string;
  try {
    const completion = await withTimeout(
      client.chat.completions.create({
        model: env.groqModel,
        temperature: 0.7,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(jobTitle) },
        ],
      }),
      env.groqTimeoutMs,
    );
    text = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.error('[llm] request failed:', err);

    const upstreamStatus = (err as { status?: number }).status;
    if (upstreamStatus === 429) {
      throw new HttpError(
        429,
        'LLM provider quota exceeded. Please try again in a moment.',
      );
    }
    if (upstreamStatus === 401 || upstreamStatus === 403) {
      throw new HttpError(502, 'LLM authentication failed. Check GROQ_API_KEY.');
    }
    throw new HttpError(502, 'Failed to generate interview questions');
  }

  const questions = parseQuestions(text);
  if (questions.length < 3) {
    throw new HttpError(502, 'LLM returned an unexpected response');
  }
  return questions;
};
