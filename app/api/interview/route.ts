import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/copilot";
import type { InterviewRequest, InterviewResponse, InterviewErrorResponse } from "@/types/interview";

const MAX_JOB_TITLE_LENGTH = 100;

export async function POST(
  request: NextRequest
): Promise<NextResponse<InterviewResponse | InterviewErrorResponse>> {
  let body: Partial<InterviewRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const jobTitle = body.jobTitle?.trim();

  if (!jobTitle) {
    return NextResponse.json(
      { error: "jobTitle is required" },
      { status: 400 }
    );
  }

  if (jobTitle.length > MAX_JOB_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `jobTitle must be ${MAX_JOB_TITLE_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  try {
    const questions = await generateInterviewQuestions(jobTitle);
    return NextResponse.json({ questions }, { status: 200 });
  } catch (err) {
   
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
