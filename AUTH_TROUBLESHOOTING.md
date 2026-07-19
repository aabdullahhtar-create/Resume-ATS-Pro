# Auth Troubleshooting for ResumeATS Pro

This update fixes the rough login experience by disabling unconfigured OAuth buttons and showing clear errors instead of sending users to broken Google/Apple pages.

## 1. Email signup says it cannot create account

Email/password signup needs a real PostgreSQL database.

Check these items:

```bash
cp .env.example .env.local
```

In `.env.local`, replace `DATABASE_URL` with your real hosted PostgreSQL connection string.

Then run:

```bash
npm install
npx prisma generate
npm run db:push
npm run dev
```

Open:

```text
http://localhost:3000/signup
```

If the database is missing or tables are not created, the app now shows a clear message like:

```text
Database tables are missing. Run npm run db:push locally, or npm run db:migrate for production.
```

## 2. Google says authorization blocked

That normally means Google OAuth is not configured correctly. Do not use fake or placeholder Google keys.

In Google Cloud Console, create an OAuth Client for a Web Application and add these redirect URLs:

```text
http://localhost:3000/api/auth/oauth/google/callback
https://YOUR-NETLIFY-DOMAIN.netlify.app/api/auth/oauth/google/callback
```

Then add these values to `.env.local` locally and Netlify environment variables in production:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_APP_URL="https://YOUR-NETLIFY-DOMAIN.netlify.app"
APP_URL="https://YOUR-NETLIFY-DOMAIN.netlify.app"
```

For local testing, use:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

## 3. Apple says invalid user

Apple login requires a paid Apple Developer account and a correctly configured Service ID, Team ID, Key ID, private key, and return URL.

Add this return URL in Apple Developer settings:

```text
https://YOUR-NETLIFY-DOMAIN.netlify.app/api/auth/oauth/apple/callback
```

Then add these values in `.env.local` and Netlify:

```env
APPLE_CLIENT_ID="your.apple.service.id"
APPLE_TEAM_ID="YOUR_TEAM_ID"
APPLE_KEY_ID="YOUR_KEY_ID"
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_REAL_KEY\n-----END PRIVATE KEY-----"
```

Important: Apple usually requires HTTPS for web login. Test Apple on the deployed Netlify URL, not normal `http://localhost:3000`.

## 4. Mobile app note for iOS/Android

If you wrap the website in Capacitor, Google/Apple may block login inside an embedded WebView. For store apps, use either:

- the hosted website in a normal browser for OAuth, or
- a native Capacitor OAuth plugin / browser-based OAuth flow.

Email/password login works normally inside the WebView.

## 5. What changed in this package

- Added `/api/auth/config` so the UI knows whether Google/Apple are configured.
- Disabled Google/Apple buttons when keys are missing.
- Added clearer database setup errors for email signup.
- Improved Google/Apple callback error messages.
- Fixed Apple state-cookie handling for production form-post callbacks.
- Improved Apple email handling for returning Apple users.

## Quick auth configuration check

After editing `.env.local`, run:

```bash
npm run check:auth
```

This shows whether database, Google, and Apple environment variables are present.
