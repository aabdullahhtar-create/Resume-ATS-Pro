# Fix: "Cannot reach the database server"

Your screenshot shows this error:

> Cannot reach the database server. Check your PostgreSQL URL, password, network access, and SSL settings.

This is not a frontend problem. The app is trying to create the user account, but it cannot connect to PostgreSQL. Email signup, Google login, and Apple login all need the database because the app saves users, sessions, and resumes there.

## Fast fix using Supabase PostgreSQL

1. Create a Supabase project.
2. Open **Project Settings → Database**.
3. Copy the PostgreSQL connection string. Prefer a pooled/session connection string for serverless hosting.
4. Replace the placeholder values with your real database password.
5. Put it in `.env.local`:

```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true"
```

Your exact URL may look different depending on Supabase region. The important part is that it must be the real URL from your Supabase dashboard, not the placeholder from `.env.example`.

## Alternative fix using Neon PostgreSQL

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Put it in `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require"
```

## Then run these commands

```bash
npm install
npm run db:push
npm run check:auth
npm run dev
```

Open this page to verify backend health:

```text
http://localhost:3000/api/health
```

You want to see:

```json
{
  "ok": true,
  "database": {
    "ok": true,
    "message": "Database connected."
  }
}
```

After this, email signup will work.

## Netlify deployment

In Netlify, add the same variables in:

**Site settings → Environment variables**

Required:

```env
DATABASE_URL="your real PostgreSQL URL"
SESSION_COOKIE_NAME="resume_ats_session"
NEXT_PUBLIC_APP_URL="https://your-netlify-site.netlify.app"
APP_URL="https://your-netlify-site.netlify.app"
```

Then redeploy the site.

## Google login fix

Google login only works after you create a real OAuth Client in Google Cloud Console.

Add this exact callback URL in Google OAuth:

```text
http://localhost:3000/api/auth/oauth/google/callback
```

For production, add:

```text
https://your-netlify-site.netlify.app/api/auth/oauth/google/callback
```

Then add these variables:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

If these are blank, the app will keep the Google button unavailable instead of sending users to a broken authorization page.

## Apple login fix

Apple login requires a paid Apple Developer account and proper **Sign in with Apple** Service ID setup. Add this callback URL in Apple Developer settings:

```text
https://your-netlify-site.netlify.app/api/auth/oauth/apple/callback
```

Then add:

```env
APPLE_CLIENT_ID="your-apple-service-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
```

If Apple is not configured, the app will keep Apple login unavailable. This avoids the invalid-user error.

## Do not share secrets

Do not send your `DATABASE_URL`, OAuth client secret, or Apple private key to anyone. Add them only in `.env.local` and Netlify environment variables.
