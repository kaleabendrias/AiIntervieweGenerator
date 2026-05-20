type Behavior =
  | { kind: 'success'; text: string }
  | { kind: 'error'; error: Error };

const DEFAULT_TEXT = 'Question 1?\nQuestion 2?\nQuestion 3?';

const state: { behavior: Behavior } = {
  behavior: { kind: 'success', text: DEFAULT_TEXT },
};

export const llmState = state;

export const setLlmBehavior = (b: Behavior): void => {
  state.behavior = b;
};

export const resetLlmBehavior = (): void => {
  state.behavior = { kind: 'success', text: DEFAULT_TEXT };
};
