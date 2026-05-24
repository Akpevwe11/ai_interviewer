# AI Interviewer

A Next.js web app that generates tailored interview questions for any job title using GitHub Copilot's AI models.

## Overview

Enter a job title and the app calls the GitHub Copilot SDK on the server to produce a curated mix of technical and behavioral interview questions. The UI displays the results instantly — no page reload required.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** [GitHub Copilot SDK](https://www.npmjs.com/package/@github/copilot-sdk) (`@github/copilot-sdk`)
- **Deployment:** Netlify (via `@netlify/plugin-nextjs`)

## Project Structure

```
ai_interviewer/
├── app/
│   ├── api/interview/route.ts   # POST endpoint — validates input, calls Copilot SDK
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (client component, handles state)
├── components/
│   ├── InterviewForm.tsx        # Job title input + submit button
│   ├── QuestionList.tsx         # Renders the generated questions
│   └── LoadingSpinner.tsx       # Loading indicator
├── lib/
│   └── copilot.ts               # Copilot SDK wrapper — builds prompt, parses response
├── types/
│   └── interview.ts             # Shared TypeScript interfaces
└── netlify.toml                 # Netlify build config
```

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub account with [Copilot access](https://github.com/features/copilot)
- A GitHub personal access token with the `copilot` scope

### Installation

```bash
git clone https://github.com/your-username/ai_interviewer.git
cd ai_interviewer
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
COPILOT_GITHUB_TOKEN=your_github_token_here

# Optional overrides
MODEL_NAME=gpt-4.1        # Copilot model to use (default: gpt-4.1)
QUESTION_COUNT=3          # Number of questions to generate (default: 3)
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The user enters a job title (up to 100 characters) and submits the form.
2. The client POSTs `{ jobTitle }` to `/api/interview`.
3. The API route validates the input and calls `generateInterviewQuestions` in `lib/copilot.ts`.
4. The Copilot SDK creates a session with the configured model, sends a prompt requesting a numbered list of mixed technical and behavioral questions, and returns the raw text.
5. The response is parsed into a clean `string[]` and returned as JSON.
6. The UI renders each question in a numbered list below the form.

## API Reference

### `POST /api/interview`

**Request body:**

```json
{ "jobTitle": "Frontend Developer" }
```

**Success response `200`:**

```json
{
  "questions": [
    "Describe your experience with React's reconciliation algorithm.",
    "Tell me about a time you resolved a conflict within a team.",
    "How do you approach performance optimisation in a large web application?"
  ]
}
```

**Error responses:**

| Status | Reason |
|--------|--------|
| `400`  | Missing or invalid `jobTitle`, or exceeds 100 characters |
| `500`  | Copilot SDK failure |

## Deployment

The project is pre-configured for [Netlify](https://www.netlify.com/).

1. Push the repository to GitHub.
2. Connect the repo to a new Netlify site.
3. Add `COPILOT_GITHUB_TOKEN` (and any optional variables) to the Netlify environment variable settings.
4. Deploy — Netlify will run `npm run build` automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## License

MIT
