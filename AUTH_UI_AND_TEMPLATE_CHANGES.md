# UI, Auth, Voice AI, and Template Changes

## Auth UI

- Removed the Apple login button from login and signup pages.
- Kept Google login and email/password login.
- Cleaned the authentication copy so it only mentions Google or email login.

## Voice AI Resume Editor

- Added a new Voice AI Resume Editor panel on the builder page.
- Users can speak in English or type their requested resume changes.
- The backend prepares suggested changes and asks the user to apply them.
- The route is protected by login/session authentication.
- Uses `GEMINI_API_KEY` when configured.
- Falls back to a basic local editor when `GEMINI_API_KEY` is not configured.

## Templates

- Increased templates from 10 to 15.
- Added five user-friendly profile-picture templates:
  - Portrait Pro
  - Sidebar Focus
  - Metro Card
  - Halo
  - Compact Photo
- Added optional profile-picture upload in the Basics step.
- All sample resumes use the name Abdullah Akhtar.

## Notes

For strict ATS applications, use a non-photo template. Photo templates are useful for modern CVs, portfolio roles, and client-facing roles where a picture is acceptable.
