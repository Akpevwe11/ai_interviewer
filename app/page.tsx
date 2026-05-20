"use client";

import { useState } from "react";
import InterviewForm from "@/components/InterviewForm";
import QuestionList from "@/components/QuestionList";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { InterviewResponse, InterviewErrorResponse } from "@/types/interview";

export default function HomePage() {
  const [jobTitle, setJobTitle] = useState("");
  const [submittedTitle, setSubmittedTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const title = jobTitle.trim();
    if (!title) return;

    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: title }),
      });

      const data: InterviewResponse | InterviewErrorResponse = await response.json();

      if (!response.ok || "error" in data) {
        const message = "error" in data ? data.error : "Something went wrong.";
        setError(message);
        return;
      }

      setSubmittedTitle(title);
      setQuestions(data.questions);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Interviewer
          </h1>
          <p className="mt-2 text-slate-500">
            Enter a job title to generate tailored interview questions
          </p>
        </header>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <InterviewForm
            jobTitle={jobTitle}
            isLoading={isLoading}
            onJobTitleChange={setJobTitle}
            onSubmit={handleSubmit}
          />

          {isLoading && <LoadingSpinner />}

          {error && !isLoading && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        {!isLoading && questions.length > 0 && (
          <QuestionList jobTitle={submittedTitle} questions={questions} />
        )}
      </div>
    </main>
  );
}
