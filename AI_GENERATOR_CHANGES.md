# AI Generator Changes

## User request implemented

1. Improved Gemini command understanding for explicit natural-language resume edits.
2. Removed the AI editor from the manual resume builder section.
3. Added a separate navigation button and page called **Generate with AI**.
4. Built a two-panel AI editing experience:
   - Left panel: voice input, command input, built-in command buttons.
   - Right panel: live resume preview showing the AI draft before applying.
5. Added dedicated route protection for `/generate-ai` and `/api/voice-resume`.

## Important files changed

```txt
src/app/api/voice-resume/route.ts
src/app/generate-ai/page.tsx
src/components/AIResumeGenerator.tsx
src/components/Header.tsx
src/components/ResumeBuilder.tsx
src/middleware.ts
.env.example
VOICE_AI_SETUP.md
```

## How to use

1. Log in.
2. Click **Generate with AI** in the navbar.
3. Speak or type a command.
4. Click **Generate update**.
5. Review the live preview on the right.
6. Click **Apply changes** or discard the draft.
7. Save to cloud or continue manually.
