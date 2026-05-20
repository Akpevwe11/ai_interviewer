export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-8" role="status" aria-label="Loading interview questions">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-sm text-slate-500">Generating questions…</p>
    </div>
  );
}
