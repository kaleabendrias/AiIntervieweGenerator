import { vi } from 'vitest';

type JsonBody = Record<string, unknown>;

interface MockResponse {
  status?: number;
  body: JsonBody;
  delayMs?: number;
}

export const mockFetchOnce = (response: MockResponse) => {
  const fn = vi.fn(async () => {
    if (response.delayMs) {
      await new Promise((r) => setTimeout(r, response.delayMs));
    }
    return new Response(JSON.stringify(response.body), {
      status: response.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

export const mockFetchReject = (error: Error) => {
  const fn = vi.fn(async () => {
    throw error;
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

export const deferredFetch = (response: MockResponse) => {
  let resolveFn: (value: Response) => void = () => {};
  const promise = new Promise<Response>((resolve) => {
    resolveFn = resolve;
  });
  const fn = vi.fn(() => promise);
  vi.stubGlobal('fetch', fn);

  return {
    fetchFn: fn,
    resolve: () => {
      resolveFn(
        new Response(JSON.stringify(response.body), {
          status: response.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    },
  };
};
