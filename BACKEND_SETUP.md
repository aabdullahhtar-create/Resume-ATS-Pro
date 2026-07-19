# ResumeATS Pro Backend Setup

This version adds a production-style backend to your existing Next.js app.

## What is included

- Email/password signup and login
- Secure password hashing with Node.js `scrypt`
- HTTP-only session cookie authentication
- PostgreSQL database using Prisma ORM
- Cloud resume saving/loading/updating/deleting
- Dashboard page for saved resumes
- Protected resume API routes
- Netlify-ready configuration
- Works for the web app and for iOS/Android wrappers that load the hosted Netlify URL

## Backend routes

| Route | Method | Purpose |
|---|---:|---|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Get logged-in user |
| `/api/resumes` | GET | List current user's resumes |
| `/api/resumes` | POST | Save a new resume |
| `/api/resumes/[id]` | GET | Load one resume |
| `/api/resumes/[id]` | PATCH | Update one resume |
| `/api/resumes/[id]` | DELETE | Delete one resume |

## Local setup

1. Install packages:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

3. Add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
SESSION_COOKIE_NAME="resume_ats_session"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Create database tables:

```bash
npm run db:push
```

5. Run the app:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000/signup
```

Create an account, open `/builder`, and use **Save Cloud**.

## Netlify deployment

1. Push this project to GitHub.
2. Connect the GitHub repo to Netlify.
3. In Netlify, add environment variables:

```env
DATABASE_URL="your production PostgreSQL connection string"
SESSION_COOKIE_NAME="resume_ats_session"
NEXT_PUBLIC_APP_URL="https://your-site.netlify.app"
```

4. Build command:

```bash
npm run build
```

5. Publish directory:

```text
.next
```

6. After first deploy, run one of these from your machine:

```bash
npm run db:push
```

or, if you prefer migrations:

```bash
npm run db:migrate
```

## Database recommendation

Use a hosted PostgreSQL database. Easy choices:

- Prisma Postgres
- Supabase Postgres
- Neon Postgres
- Railway Postgres

For Netlify, Prisma Postgres is usually the simplest because it can connect directly from the Netlify dashboard.

## iOS and Android hosting approach

For mobile stores, keep this Next.js app hosted on Netlify and wrap the hosted URL using Capacitor.

Recommended flow:

```text
Next.js app + backend APIs -> Netlify
PostgreSQL database -> Prisma Postgres/Supabase/Neon/Railway
Mobile wrapper -> Capacitor Android/iOS loading the Netlify URL
```

That means your mobile apps and your website will use the same backend, same user accounts, and same saved resumes.

## Important security notes

- Do not commit `.env.local`.
- Use a strong production `DATABASE_URL`.
- Do not expose `passwordHash` in API responses.
- This project already uses HTTP-only cookies for sessions.
- Add email verification and password reset before a serious public launch.
- Add rate limiting before a serious public launch to protect login/signup endpoints.

## Auth gate and Google/Apple login

This updated version requires users to sign up or log in before they can use app features. Main app pages and APIs are protected by `src/middleware.ts`, and the sensitive API routes also verify the authenticated user server-side.

New OAuth routes:

```text
/api/auth/oauth/google
/api/auth/oauth/google/callback
/api/auth/oauth/apple
/api/auth/oauth/apple/callback
```

Read `AUTH_OAUTH_SETUP.md` for the required Google and Apple environment variables and redirect URLs.

## Quick auth configuration check

After editing `.env.local`, run:

```bash
npm run check:auth
```

This shows whether database, Google, and Apple environment variables are present.
