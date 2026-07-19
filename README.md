# ResumeATS Pro — Free ATS Resume Builder

A modern Next.js + Tailwind resume builder for creating ATS-compatible resumes, checking resume strength, and exporting resumes for free.

## What was improved

- Redesigned the landing page with a more modern hero, stronger CTAs, feature cards, and trust badges.
- Removed the payment/download lock so users can export for free.
- Added a library of 22 free resume templates, including 17 ATS-safe layouts, 6 designs that remain balanced without a headline, international CV styles, and optional photo layouts.
- Added five new ATS-safe templates: Essential, Ledger, Vertex, Chronicle, and Signal.
- Improved the builder interface with:
  - Live ATS score card
  - ATS Boost button for editable keyword and achievement examples
  - Starter resume presets for Business Analyst, Software Engineer, Healthcare, and Marketing
  - One-click skill chips based on the target role
  - Modern template selector pills
  - Optional professional headline
  - Hide/show controls for every major resume section
  - Custom section heading names
  - Compact/comfortable spacing and three resume text sizes
- Added free export options:
  - ATS PDF via browser print/save PDF, preserving selectable text
  - Plain TXT export for parser-friendly resume text
  - PNG and JPG preview exports
- Improved template gallery cards with ATS-safe badges, headline-optional labels, filters, tone labels, and best-use guidance.
- Added LinkedIn in-app browser detection so users are told to open Chrome, Safari, or Edge before starting Google OAuth.

## Tech stack

- Next.js 15
- React 19
- Tailwind CSS
- Framer Motion
- html2canvas for PNG/JPG previews
- Mammoth and pdf-parse for upload parsing

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal.

## Recommended ATS export workflow

1. Build the resume in `/builder`.
2. Watch the live ATS score and fix missing sections.
3. Click **ATS PDF** and choose **Save as PDF** in the browser print dialog.
4. Use **TXT** when you need a parser-friendly plain text copy.

Note: PNG/JPG exports are useful for previews and sharing images, but they are not the best format for ATS systems because they are image-based.


## Backend version added

This package now includes a proper backend for user accounts and cloud resume storage.

New features:

- Signup and login pages: `/signup`, `/login`
- User dashboard: `/dashboard`
- Cloud save from the builder using **Save Cloud**
- Auth API routes under `/api/auth/*`
- Resume CRUD API routes under `/api/resumes/*`
- Prisma PostgreSQL schema and migration
- Netlify config for deployment

See `BACKEND_SETUP.md` for full setup and deployment steps.

## Authentication gate added

Users must now sign up or log in before using builder features, templates, ATS checking, uploading, cloud saving, or the dashboard.

Supported login methods:

- Email + password
- Google Sign-In
- Apple ID Sign-In

See `AUTH_OAUTH_SETUP.md` for Google/Apple setup and redirect URLs.

## Auth troubleshooting

If signup/login shows an error, read `AUTH_TROUBLESHOOTING.md`. The Google and Apple buttons stay disabled until the required OAuth environment variables are added, so users will not be sent to broken authorization pages.

## Important backend setup

If signup shows a database connection message, read:

- `DATABASE_FIX_FOR_YOUR_ERROR.md`
- `AUTH_TROUBLESHOOTING.md`

Email, Google, and Apple login need a real hosted PostgreSQL database before accounts can be created.

Update README.md
