interface QuestionListProps {
  jobTitle: string;
  questions: string[];
}

export default function QuestionList({ jobTitle, questions }: QuestionListProps) {
  if (questions.length === 0) return null;

  return (
    <section aria-labelledby="questions-heading" className="mt-8">
      <h2
        id="questions-heading"
        className="mb-4 text-lg font-semibold text-slate-800"
      >
        Interview Questions for{" "}
        <span className="text-indigo-600">{jobTitle}</span>
      </h2>

      <ol className="flex flex-col gap-3">
        {questions.map((question, index) => (
          <li
            key={index}
            className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {index + 1}
            </span>
            <p className="text-slate-700 leading-relaxed">{question}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
