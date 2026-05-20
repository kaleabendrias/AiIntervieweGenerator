import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Express requires the four-argument signature to recognize this as an error handler,
// even though `next` is unused here.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Honor `status`/`statusCode` set by upstream middleware (e.g. express.json()
  // sets status=400 on malformed JSON).
  const upstreamStatus =
    (err as { status?: number; statusCode?: number }).status ??
    (err as { status?: number; statusCode?: number }).statusCode;
  if (upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 500) {
    res.status(upstreamStatus).json({ error: err.message || 'Bad Request' });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not Found' });
};
