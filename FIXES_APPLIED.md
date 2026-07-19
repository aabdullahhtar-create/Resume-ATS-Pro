# Fixes Applied

This version includes code changes for the requested ResumeATS Pro issues:

1. PNG/JPG export now clones the real resume preview into a clean A4 export area before rendering, so the downloaded image keeps the same selected template and formatting.
2. Google OAuth startup now avoids Next.js link prefetch problems by using a normal anchor for OAuth, sends no-store headers, and uses the active request origin for callback URLs so the state cookie matches on first login.
3. Skills, Certifications, and Projects now use editable multi-line inputs with comma, semicolon, and newline support. Users can type multiple items without the comma disappearing.
4. Long resumes can now extend beyond one A4 page. The preview scrolls instead of shrinking into unreadable size, print/export allows overflow, and sections avoid breaking where possible.
5. The logged-in navbar no longer shows the duplicate Dashboard pill next to Generate with AI. Spacing is tighter and switches to mobile layout earlier to avoid button merging.
6. User-facing “Gemini” wording in the AI generator has been replaced with “Our AI assistant,” “AI assistant,” or neutral AI wording.
7. The Generate with AI page now has Download PDF buttons that export the currently shown AI preview directly.
8. Added two Europass-style templates: Europass Classic and Europass Modern.

Validation performed:
- `npx tsc --noEmit` passed.
- Full `npm run build` could not complete inside this Linux sandbox because the uploaded project only included Windows Next.js SWC binaries and the sandbox cannot download the Linux SWC package. Run `npm install` on your machine/deployment, then `npm run build`.

Private `.env` and `.env.local` files are not included in this fixed zip. Copy your own environment variables back into a new `.env.local` before running.
