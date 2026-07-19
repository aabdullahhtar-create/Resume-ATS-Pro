# Google Login Setup

This version keeps the login UI clean with:

- Email/password login
- Google login

The Apple login button has been removed from the UI.

## Google Cloud Console

1. Open Google Cloud Console.
2. Go to **Google Auth Platform** or **APIs & Services**.
3. Configure the OAuth consent screen / branding.
4. Create an OAuth client.
5. Choose **Web application**.

## Local redirect URL

Add this to **Authorized redirect URIs**:

```txt
http://localhost:3000/api/auth/oauth/google/callback
```

Add this to **Authorized JavaScript origins**:

```txt
http://localhost:3000
```

## Netlify redirect URL

After deployment, add your live URL too:

```txt
https://your-site.netlify.app/api/auth/oauth/google/callback
```

Authorized JavaScript origin:

```txt
https://your-site.netlify.app
```

## Environment variables

Add these to `.env` and `.env.local`:

```env
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Then restart:

```bash
npm run dev
```

## Netlify variables

Add the same values in Netlify:

```txt
Site configuration → Environment variables
```

Then redeploy.
