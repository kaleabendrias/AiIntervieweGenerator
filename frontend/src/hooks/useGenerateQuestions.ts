import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, generateQuestions } from '../services/api';

interface State {
  questions: string[];
  loading: boolean;
  error: string | null;
}

export const useGenerateQuestions = () => {
  const [state, setState] = useState<State>({
    questions: [],
    loading: false,
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const submit = useCallback(async (jobTitle: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ questions: [], loading: true, error: null });

    try {
      const questions = await generateQuestions(jobTitle, controller.signal);
      if (controller.signal.aborted) return;
      setState({ questions, loading: false, error: null });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setState({ questions: [], loading: false, error: message });
    }
  }, []);

  return { ...state, submit };
};
