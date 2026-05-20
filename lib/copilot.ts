import { CopilotClient, approveAll } from "@github/copilot-sdk";

const MODEL_NAME = "gpt-4.1";
const QUESTION_COUNT = 3;

function buildPrompt(jobTitle: string): string {
  return (
    `Generate ${QUESTION_COUNT} thoughtful interview questions for a ${jobTitle} role. ` +
    `Include a mix of technical and behavioral questions. ` +
    `Return only the questions as a numbered list, one per line, with no additional commentary.`
  );
}

function parseQuestions(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0);
}

export async function generateInterviewQuestions(
  jobTitle: string
): Promise<string[]> {
  const githubToken = process.env.COPILOT_GITHUB_TOKEN;
  if (!githubToken || githubToken === "your_github_token_here") {
    throw new Error("Please set a valid COPILOT_GITHUB_TOKEN in .env.local");
  }

  const client = new CopilotClient({
    gitHubToken: githubToken,
    useLoggedInUser: false,
  });

  try {
    await client.start();

    const session = await client.createSession({
      model: MODEL_NAME,
      gitHubToken: githubToken,
      onPermissionRequest: approveAll,
    });

    const finalMessage = await session.sendAndWait({
      prompt: buildPrompt(jobTitle),
    });

    const fullText = finalMessage?.data.content ?? "";

    await session.disconnect();
    return parseQuestions(fullText);
  } finally {
    await client.stop();
  }
}
