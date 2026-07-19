# Changes Made

- Upgraded the landing page and header to a more modern interface.
- Removed payment-gated downloads from the main workflow.
- Added free ATS PDF print/save export, TXT export, PNG export, and JPG export.
- Expanded templates from 6 to 10 ATS-safe layouts.
- Added live ATS score summary to the builder.
- Added ATS Boost helper for editable keyword and achievement examples.
- Added role starter presets: Business Analyst, Software Engineer, Healthcare, and Marketing.
- Added skill chips based on the target role.
- Updated the template gallery with badges, tone labels, and best-use guidance.
- Updated README and environment example for the free version.

Validation performed:
- TypeScript checked key project files with local mock declarations because dependencies were not installed in the sandbox.
- Full Next.js build was not run because npm install timed out in the sandbox environment.
## Responsive live preview fix
- Changed the builder to a true two-column responsive layout on desktop and laptop screens.
- Added automatic resume preview scaling so the full A4 page fits inside the right-side preview panel.
- Added a preview zoom indicator and removed the fixed Tailwind scale that caused the resume to overflow or crop.
- Preserved print/PDF export at full A4 size while keeping the on-screen preview scaled only for viewing.

## Parallel scrolling and polish fix
- Removed the sticky behavior from the right-side live preview so the editor and preview move together naturally while the page scrolls.
- Changed the desktop split layout breakpoint from `lg` to `xl` so medium laptop widths do not feel cramped.
- Improved preview panel spacing and minimum height for smaller screens.
- Updated the sample template identity to Abdullah Akhtar, including a localStorage migration for users who already opened the older version.
- Kept the auto-fit A4 preview and full-size ATS PDF export behavior intact.

## Latest patch: Upload modal scrolling + template card fit

- Fixed the upload/rebuild modal so its own content scrolls correctly instead of scrolling the background page.
- Locked body scrolling while the upload modal is open for a cleaner rebuild flow.
- Reworked template gallery cards so every A4 template preview is centered and fully visible inside its box.
- Changed template gallery from cramped three-column layout on smaller laptops to a cleaner responsive two/three-column grid.
- Removed duplicate `resume-preview` IDs from gallery previews while keeping the builder export target stable.

## Backend implementation added

- Added Prisma PostgreSQL backend schema with User, Session, Resume, and Payment models.
- Added secure email/password authentication using Node.js scrypt password hashing.
- Added HTTP-only session cookie login/logout flow.
- Added auth API routes: register, login, logout, and current user.
- Added resume CRUD API routes for cloud saving, loading, updating, and deleting.
- Added signup, login, and dashboard pages.
- Updated the header to show account links when logged in.
- Updated the resume builder with Save Cloud and cloud resume loading via `/builder?resumeId=...`.
- Added Netlify deployment configuration and backend setup guide.
- Added mobile store guide for wrapping the hosted app with Capacitor for iOS and Android.

## 2026-06-25 auth gate + social login update

- Added middleware to require login before using builder, templates, ATS checker, pricing, dashboard, upload API, ATS API, and resume API.
- Added Google OAuth route: `/api/auth/oauth/google`.
- Added Apple OAuth route: `/api/auth/oauth/apple`.
- Added OAuth callback handling with secure state cookie verification.
- Added `OAuthAccount` Prisma model.
- Made `User.passwordHash` optional for Google/Apple accounts.
- Added social login buttons on login and signup pages.
- Added animated grid background, floating gradient effects, hover lift cards, shimmer buttons, and cleaner auth UI.
- Updated header to send unauthenticated users to login before feature access.

## 2026-06-25 Auth error smoothing update

- Added `/api/auth/config` to detect whether Google and Apple login are configured.
- Login/signup page now disables unconfigured Google/Apple buttons instead of redirecting users to broken provider pages.
- Email signup/login now returns readable database setup errors instead of generic "Could not create account" messages.
- OAuth redirects now use the current request origin when `APP_URL`/`NEXT_PUBLIC_APP_URL` are blank or placeholder values.
- Google and Apple token callback errors now explain what needs to be fixed.
- Apple login now supports production cross-site `form_post` state cookies.
- Apple login can link returning users by Apple provider ID even if Apple does not resend the email.
- Added `AUTH_TROUBLESHOOTING.md`.


## 2026-07-18 Template flexibility and LinkedIn OAuth update

- Expanded the free template library to 22 total templates, including 17 ATS-safe layouts.
- Added Essential, Ledger, Vertex, Chronicle, and Signal as new ATS-safe designs.
- Added headline-optional template labels and removed forced headline placeholders from resume output.
- Added a Customize step with headline/photo/section visibility controls.
- Added editable section names, compact or comfortable spacing, and small/medium/large resume text.
- Empty summary, experience, education, projects, skills, and certification sections no longer produce forced placeholder content.
- Updated homepage, template gallery, and free-plan copy to use live template counts.
- Preserved customization settings in local storage, cloud resumes, uploads, and AI editing.
- Added LinkedIn in-app browser detection and disabled Google OAuth there with clear Open in browser instructions. Email login remains available.
- Validation: `npm run typecheck` passed and `next build --experimental-build-mode compile` completed successfully.
