import { useState, type FormEvent } from 'react';
import Button from './components/Button';
import TextField from './components/TextField';
import ErrorAlert from './components/ErrorAlert';
import QuestionList from './components/QuestionList';
import { useGenerateQuestions } from './hooks/useGenerateQuestions';

const MIN_JOB_TITLE_LENGTH = 2;

const App = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { questions, loading, error, submit } = useGenerateQuestions();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = jobTitle.trim();
    if (trimmed.length < MIN_JOB_TITLE_LENGTH) {
      setValidationError('Please enter a job title (at least 2 characters).');
      return;
    }
    setValidationError(null);
    await submit(trimmed);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold sm:text-3xl">Interview Question Generator</h1>
            <p className="mt-1 text-sm text-slate-600">
              Enter a job title to generate three tailored interview questions.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <TextField
              label="Job title"
              placeholder="e.g. Customer Success Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              autoComplete="off"
              disabled={loading}
              error={validationError ?? undefined}
              hint="Be specific — e.g. 'Senior Backend Engineer' works better than 'Engineer'."
            />
            <Button type="submit" loading={loading} className="self-start">
              {loading ? 'Generating...' : 'Generate questions'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            {error && <ErrorAlert message={error} />}
            <QuestionList questions={questions} />
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500">Powered by Groq + Llama 3.3</footer>
    </div>
  );
};

export default App;
