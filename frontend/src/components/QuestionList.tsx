interface QuestionListProps {
  questions: string[];
}

const QuestionList = ({ questions }: QuestionListProps) => {
  if (questions.length === 0) return null;

  return (
    <section aria-label="Generated interview questions" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Interview questions
      </h2>
      <ol className="flex flex-col gap-3">
        {questions.map((q, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
              >
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-800">{q}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default QuestionList;
