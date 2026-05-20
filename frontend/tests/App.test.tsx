import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { deferredFetch, mockFetchOnce, mockFetchReject } from './helpers/fetchMock';

const QUESTIONS = [
  'How do you measure customer success?',
  'Describe handling an at-risk account.',
  'How do you collaborate with product teams?',
];

describe('Interview Question Generator app', () => {
  it('renders the form with accessible labels', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /interview question generator/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate questions/i })).toBeEnabled();
  });

  it('updates the input as the user types', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/job title/i) as HTMLInputElement;
    await user.type(input, 'Product Manager');

    expect(input.value).toBe('Product Manager');
  });

  it('shows a validation error when submitting an empty input', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('shows a validation error for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/job title/i), '   ');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('shows loading state and disables submit while the request is pending', async () => {
    const user = userEvent.setup();
    const { resolve } = deferredFetch({ body: { questions: QUESTIONS } });

    render(<App />);
    await user.type(screen.getByLabelText(/job title/i), 'Customer Success Manager');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    const submitBtn = screen.getByRole('button', { name: /generating/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();

    resolve();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate questions/i })).toBeEnabled();
    });
  });

  it('renders the 3 returned questions on success', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ body: { questions: QUESTIONS } });

    render(<App />);
    await user.type(screen.getByLabelText(/job title/i), 'Customer Success Manager');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    const list = await screen.findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    QUESTIONS.forEach((q) => {
      expect(within(list).getByText(q)).toBeInTheDocument();
    });
  });

  it('sends the trimmed jobTitle to the API', async () => {
    const user = userEvent.setup();
    const fetchFn = mockFetchOnce({ body: { questions: QUESTIONS } });

    render(<App />);
    await user.type(screen.getByLabelText(/job title/i), '   Data Analyst   ');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    await screen.findByRole('list');

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ jobTitle: 'Data Analyst' });
  });

  it('displays the server error message when the API returns an error', async () => {
    const user = userEvent.setup();
    mockFetchOnce({
      status: 502,
      body: { error: 'Failed to generate interview questions' },
    });

    render(<App />);
    await user.type(screen.getByLabelText(/job title/i), 'Engineer');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to generate/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('displays a friendly message on network failure', async () => {
    const user = userEvent.setup();
    mockFetchReject(new TypeError('Failed to fetch'));

    render(<App />);
    await user.type(screen.getByLabelText(/job title/i), 'Engineer');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/network error/i);
  });

  it('clears previous results when a new request starts', async () => {
    const user = userEvent.setup();
    mockFetchOnce({ body: { questions: QUESTIONS } });

    render(<App />);
    const input = screen.getByLabelText(/job title/i);
    await user.type(input, 'Engineer');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));
    await screen.findByRole('list');

    const { resolve } = deferredFetch({ body: { questions: QUESTIONS } });
    await user.clear(input);
    await user.type(input, 'Designer');
    await user.click(screen.getByRole('button', { name: /generate questions/i }));

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    resolve();
    await screen.findByRole('list');
  });
});
