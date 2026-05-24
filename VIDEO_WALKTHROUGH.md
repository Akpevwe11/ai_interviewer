# AI Interviewer — Video Walkthrough Script

Use this document as your guide while recording. Each section includes **what to show on screen**, **what to say**, and **why it matters**.

---

## 1. Introduction (30–60 seconds)

**Show:** The running app at `http://localhost:3000`

**Say something like:**

> This is **AI Interviewer** — a Next.js web app that generates tailored interview questions for any job title. You type something like "Frontend Developer," click Generate, and the app returns a mix of technical and behavioral questions powered by the **GitHub Copilot SDK**.
>
> Under the hood it's a classic full-stack flow: React UI on the client, a Next.js API route on the server, and Copilot doing the AI work. Let me walk through how each piece connects.

---

## 2. High-Level Architecture (1–2 minutes)

**Show:** Project folder in your editor, or this diagram:

```
User (browser)
    │
    ▼
app/page.tsx          ← React UI, manages state
    │
    │  POST /api/interview  { jobTitle: "..." }
    ▼
app/api/interview/route.ts   ← Validates input
    │
    ▼
lib/copilot.ts        ← Talks to GitHub Copilot SDK
    │
    ▼
GitHub Copilot API    ← Generates questions
    │
    ▼
Response flows back:  string[] → JSON → UI renders list
```

**Key points to mention:**

- **Next.js 14 App Router** — pages live in `app/`, API routes live in `app/api/`.
- **Client vs server** — the UI runs in the browser; AI calls happen on the server so the GitHub token stays secret.
- **TypeScript everywhere** — shared types in `types/interview.ts` keep the frontend and API in sync.

---

## 3. Project Structure (1 minute)

**Show:** File tree in the sidebar

```
ai_interviewer/
├── app/
│   ├── page.tsx                 # Main page (client component)
│   ├── layout.tsx               # Root HTML shell + fonts
│   └── api/interview/route.ts   # POST endpoint
├── components/
│   ├── InterviewForm.tsx        # Input form
│   ├── QuestionList.tsx         # Displays results
│   └── LoadingSpinner.tsx       # Loading state
├── lib/
│   └── copilot.ts               # Copilot SDK integration
├── types/
│   └── interview.ts             # Shared TypeScript types
└── scripts/                     # Dev utilities (optional mention)
```

**Say:**

> The app is intentionally small and layered. `app/page.tsx` owns the state and orchestration. Components are dumb and reusable. `lib/copilot.ts` is the only place that knows about the Copilot SDK. And `types/interview.ts` defines the contract between client and server.

---

## 4. Shared Types — `types/interview.ts` (30 seconds)

**Show:** `types/interview.ts`

**Explain:**

Three interfaces define the API contract:

| Type | Purpose |
|------|---------|
| `InterviewRequest` | What the client sends: `{ jobTitle: string }` |
| `InterviewResponse` | Success: `{ questions: string[] }` |
| `InterviewErrorResponse` | Failure: `{ error: string }` |

> This is the shape of data moving between the browser and the API. Both sides import these types so TypeScript catches mismatches at compile time.

---

## 5. The UI Layer — `app/page.tsx` (2–3 minutes)

**Show:** `app/page.tsx`

**Walk through the state:**

```tsx
const [jobTitle, setJobTitle] = useState("");       // Current input
const [submittedTitle, setSubmittedTitle] = useState("");  // Title used for results heading
const [questions, setQuestions] = useState<string[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Explain each piece:**

1. **`"use client"`** at the top — this page uses React hooks (`useState`), so it must be a Client Component in Next.js App Router.
2. **`handleSubmit`** — the core flow:
   - Prevent default form reload
   - Trim and validate the job title
   - Set loading state, clear previous errors/questions
   - `fetch("/api/interview", { method: "POST", body: JSON.stringify({ jobTitle }) })`
   - Parse JSON response
   - If `"error"` is in the response → show error banner
   - Otherwise → save questions and display them
3. **Conditional rendering:**
   - Form always visible
   - Spinner while loading
   - Error alert on failure
   - `QuestionList` only when questions exist and not loading

**Demo tip:** Submit an empty form (nothing happens), then submit a real title while narrating the state changes.

---

## 6. Components (1–2 minutes)

### `components/InterviewForm.tsx`

**Show:** The form component

**Explain:**

> This is a **controlled component**. The parent (`page.tsx`) owns `jobTitle` state and passes it down as a prop. The form doesn't fetch data — it just collects input and calls `onSubmit`.

Notable details:
- `maxLength={100}` matches server validation
- Button disabled when loading or input is empty
- Accessible `<label>` tied to the input via `htmlFor`

### `components/LoadingSpinner.tsx`

> Simple presentational component. Shows a CSS spinner and `role="status"` for screen readers.

### `components/QuestionList.tsx`

> Receives `jobTitle` and `questions` as props. Renders a numbered list. Returns `null` if empty — the parent decides when to mount it.

**Say:**

> Splitting UI into small components keeps `page.tsx` focused on data flow, not markup details.

---

## 7. The API Route — `app/api/interview/route.ts` (2 minutes)

**Show:** `app/api/interview/route.ts`

**Walk through step by step:**

1. **Parse the body** — `request.json()` inside try/catch. Bad JSON → `400 Invalid JSON body`.

2. **Validate `jobTitle`:**
   - Must exist and be non-empty after `.trim()`
   - Must be ≤ 100 characters (`MAX_JOB_TITLE_LENGTH`)
   - Missing/empty → `400 jobTitle is required`
   - Too long → `400 jobTitle must be 100 characters or fewer`

3. **Call the AI layer:**
   ```ts
   const questions = await generateInterviewQuestions(jobTitle);
   return NextResponse.json({ questions }, { status: 200 });
   ```

4. **Error handling** — any Copilot failure → `500 Failed to generate questions`

**Important point:**

> Validation happens on the server even though the form also validates on the client. Never trust the client — someone could call this API directly with curl or Postman.

**Optional demo:** Show a curl request:
```bash
curl -X POST http://localhost:3000/api/interview \
  -H "Content-Type: application/json" \
  -d '{"jobTitle": "Backend Developer"}'
```

---

## 8. The AI Layer — `lib/copilot.ts` (3–4 minutes)

**Show:** `lib/copilot.ts` — this is the heart of the app

### Configuration

```ts
const MODEL_NAME = process.env.MODEL_NAME ?? "gpt-4.1";
const QUESTION_COUNT = Number(process.env.QUESTION_COUNT ?? 3);
```

> Model and question count are configurable via environment variables, with sensible defaults.

### Building the prompt — `buildPrompt()`

```ts
`Generate ${QUESTION_COUNT} thoughtful interview questions for a ${jobTitle} role.
 Include a mix of technical and behavioral questions.
 Return only the questions as a numbered list, one per line, with no additional commentary.`
```

> We give Copilot clear instructions: how many questions, what mix, and exactly what format to return. Prompt engineering matters — vague prompts give vague results.

### Parsing the response — `parseQuestions()`

```ts
text
  .split("\n")
  .map((line) => line.replace(/^\d+\.\s*/, "").trim())  // strip "1. ", "2. ", etc.
  .filter((line) => line.length > 0);
```

> Copilot returns plain text. We split by newlines, strip numbering, and filter blanks to get a clean `string[]`.

### The main function — `generateInterviewQuestions()`

Walk through the lifecycle:

1. **Check the token:**
   ```ts
   const githubToken = process.env.COPILOT_GITHUB_TOKEN;
   if (!githubToken || githubToken === "your_github_token_here") {
     throw new Error("Please set a valid COPILOT_GITHUB_TOKEN in .env.local");
   }
   ```

2. **Create and start the client:**
   ```ts
   const client = new CopilotClient({
     gitHubToken: githubToken,
     useLoggedInUser: false,
   });
   await client.start();
   ```

3. **Create a session:**
   ```ts
   const session = await client.createSession({
     model: MODEL_NAME,
     gitHubToken: githubToken,
     onPermissionRequest: approveAll,
   });
   ```
   > `approveAll` auto-approves permission requests so the session doesn't hang waiting for user input.

4. **Send the prompt and wait:**
   ```ts
   const finalMessage = await session.sendAndWait({ prompt: buildPrompt(jobTitle) });
   const fullText = finalMessage?.data.content ?? "";
   ```

5. **Clean up:**
   ```ts
   await session.disconnect();
   // in finally block:
   await client.stop();
   ```
   > The `try/finally` ensures the client always stops, even if something throws.

6. **Return parsed questions:**
   ```ts
   return parseQuestions(fullText);
   ```

**Security note to mention:**

> `COPILOT_GITHUB_TOKEN` lives in `.env.local` and is only read server-side. The browser never sees it. That's why AI calls go through the API route, not directly from React.

---

## 9. Root Layout — `app/layout.tsx` (30 seconds)

**Show:** `app/layout.tsx`

**Briefly mention:**

> Every page in Next.js App Router is wrapped by `layout.tsx`. This one sets up Geist fonts, global CSS, and page metadata (title/description). It's mostly boilerplate — the real app logic is in `page.tsx`.

---

## 10. Environment Variables (1 minute)

**Show:** `.env.local` (blur or redact the actual token!)

```env
COPILOT_GITHUB_TOKEN=ghp_...your_token...

# Optional
MODEL_NAME=gpt-4.1
QUESTION_COUNT=3
```

**Explain:**

| Variable | Required | Purpose |
|----------|----------|---------|
| `COPILOT_GITHUB_TOKEN` | Yes | GitHub PAT with `copilot` scope |
| `MODEL_NAME` | No | Which Copilot model to use (default: `gpt-4.1`) |
| `QUESTION_COUNT` | No | How many questions to generate (default: `3`) |

> Without a valid token, the app throws an error and the API returns a 500.

---

## 11. End-to-End Demo Flow (1–2 minutes)

**Show:** Live demo in the browser with DevTools Network tab open

**Narrate step by step:**

1. User types **"Software Developer"** in the input
2. Clicks **Generate Questions**
3. UI shows spinner (`isLoading = true`)
4. Network tab shows `POST /api/interview` with body `{ "jobTitle": "Software Developer" }`
5. Server validates → calls Copilot → parses response
6. Response arrives: `{ "questions": ["...", "...", "..."] }`
7. Spinner disappears, questions render in `QuestionList`

**Optional:** Trigger an error (stop the server or use an invalid token) to show the red error banner.

---

## 12. Dev Scripts (optional, 30 seconds)

**Show:** `scripts/` folder

| Script | Purpose |
|--------|---------|
| `scripts/list_models.ts` | Lists available Copilot models — useful when picking `MODEL_NAME` |
| `scripts/explore_sdk.ts` | Prints `CopilotClient` methods — handy for SDK exploration |

> These aren't part of the app runtime — they're developer utilities for exploring the Copilot SDK.

---

## 13. Tech Stack Summary (30 seconds)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18 + Tailwind CSS |
| AI | GitHub Copilot SDK (`@github/copilot-sdk`) |
| Validation | Manual (API route) + HTML5 form validation |
| Deployment | Netlify (`@netlify/plugin-nextjs`) |

---

## 14. Closing / What You Could Build Next (30 seconds)

**Wrap up with ideas:**

- Add difficulty level (junior / senior)
- Let users pick question categories (technical, behavioral, system design)
- Save question sets to a database
- Add a "copy all" or "export PDF" button
- Stream questions as they're generated instead of waiting for all of them

---

## Quick Reference — File Responsibilities

| File | One-line summary |
|------|------------------|
| `app/page.tsx` | State management, API call, conditional UI |
| `app/layout.tsx` | HTML shell, fonts, metadata |
| `app/api/interview/route.ts` | Input validation, calls Copilot, returns JSON |
| `lib/copilot.ts` | Copilot SDK client, prompt, parse response |
| `types/interview.ts` | Request/response TypeScript interfaces |
| `components/InterviewForm.tsx` | Job title input + submit button |
| `components/QuestionList.tsx` | Numbered list of generated questions |
| `components/LoadingSpinner.tsx` | Loading indicator |

---

## Suggested Video Structure

| Timestamp | Section |
|-----------|---------|
| 0:00 | Intro + live demo |
| 0:45 | Architecture diagram |
| 1:30 | Project structure tour |
| 2:30 | `page.tsx` — client state & fetch |
| 4:30 | Components walkthrough |
| 5:30 | API route — validation & error handling |
| 7:30 | `copilot.ts` — SDK integration deep dive |
| 10:30 | Environment variables & security |
| 11:30 | Live demo with Network tab |
| 12:30 | Wrap-up |

**Estimated total length:** 12–15 minutes (adjust pacing to your style)
