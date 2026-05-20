const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

interface GenerateResponse {
  questions: string[];
}

interface ErrorResponse {
  error?: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

export const generateQuestions = async (
  jobTitle: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError('Network error. Please check your connection.');
  }

  let data: GenerateResponse & ErrorResponse;
  try {
    data = (await res.json()) as GenerateResponse & ErrorResponse;
  } catch {
    throw new ApiError('Invalid response from server.', res.status);
  }

  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status);
  }

  return data.questions ?? [];
};
