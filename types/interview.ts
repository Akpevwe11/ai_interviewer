export interface InterviewRequest {
  jobTitle: string;
}

export interface InterviewResponse {
  questions: string[];
}

export interface InterviewErrorResponse {
  error: string;
}
