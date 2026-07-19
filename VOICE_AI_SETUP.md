# Generate with AI / Voice Resume Generator Setup

This version separates AI resume editing from the manual builder.

## New route

```txt
/generate-ai
```

Users can open it from the top navigation button: **Generate with AI**.

## What changed

- The old AI box was removed from the manual Builder page.
- A new dedicated AI Generator page was added.
- Left side: voice input, typed command box, and built-in command buttons.
- Right side: live resume preview that updates with the AI draft.
- Users can review the AI draft, then click **Apply changes**.
- Gemini is used for stronger natural-language understanding.
- If `GEMINI_API_KEY` is missing, the app still uses a basic safe fallback editor.

## Required environment variables

Add these to both `.env` and `.env.local`:

```env
GEMINI_API_KEY="your_new_gemini_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```

Do not share your real key publicly. If you pasted it into a chat or screenshot, revoke it and create a new one.

## Commands the AI now understands better

Examples:

```txt
Improve my summary for a frontend developer role.
Add React, Next.js, Tailwind CSS, Prisma, and PostgreSQL to my skills.
Remove Excel from my skills.
Replace Java with Python everywhere.
Change my title to Software Engineer Intern.
Add a project called ResumeATS Pro using Next.js, Gemini API, Prisma, and Neon.
Add my internship at ABC Company as Frontend Developer from June 2025 to August 2025.
Rewrite my first experience bullets with stronger action verbs and numbers.
Tailor my resume for a remote React developer job.
```

## Restart after adding keys

```bash
Ctrl + C
npm run dev
```

## Deployment

In Netlify, add these variables under:

```txt
Site configuration → Environment variables
```

```env
GEMINI_API_KEY="your_new_gemini_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```

Then redeploy.
