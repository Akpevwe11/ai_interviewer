"use client";

interface InterviewFormProps {
  jobTitle: string;
  isLoading: boolean;
  onJobTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function InterviewForm({
  jobTitle,
  isLoading,
  onJobTitleChange,
  onSubmit,
}: InterviewFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="jobTitle" className="text-sm font-medium text-slate-700">
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          placeholder="e.g. Customer Success Manager, Software Engineer, Data Analyst"
          maxLength={100}
          required
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || jobTitle.trim().length === 0}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Generating…" : "Generate Questions"}
      </button>
    </form>
  );
}
