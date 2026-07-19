# iOS and Android Store Guide

This backend is designed so the same Netlify site can serve:

- Normal web users
- Android app users
- iOS app users

## Recommended mobile architecture

```text
Netlify hosted Next.js app
  ├─ UI pages
  ├─ API routes: /api/auth/* and /api/resumes/*
  └─ HTTP-only login session cookie

PostgreSQL database
  ├─ User accounts
  ├─ Sessions
  └─ Saved resumes

Capacitor mobile apps
  ├─ Android WebView app
  └─ iOS WebView app
```

## Why this is best for your app

Your ResumeATS Pro app already works as a web app. The backend APIs are inside the same Next.js app, so your mobile app only needs to load your Netlify URL. Users can log in and access the same saved resumes on every device.

## Capacitor setup after Netlify deployment

After your Netlify URL is live, run:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
```

Use values like:

```text
App name: ResumeATS Pro
App ID: com.yourname.resumeatspro
```

Create a small fallback folder:

```bash
mkdir -p mobile-fallback
echo '<!doctype html><html><body>ResumeATS Pro</body></html>' > mobile-fallback/index.html
```

Then create `capacitor.config.ts` like this:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.resumeatspro',
  appName: 'ResumeATS Pro',
  webDir: 'mobile-fallback',
  server: {
    url: 'https://your-site.netlify.app',
    cleartext: false
  }
};

export default config;
```

The mobile app will load your hosted Netlify app. The fallback folder is only there so Capacitor has a local web directory during native project setup.

Then add platforms:

```bash
npx cap add android
npx cap add ios
npx cap sync
```

Open Android Studio:

```bash
npx cap open android
```

Open Xcode on macOS:

```bash
npx cap open ios
```

## Important note

For App Store approval, your app should feel like a real mobile app, not just a basic website wrapper. Before submission, improve mobile UX, app icon, splash screen, privacy policy, and any native features you want to add later.

## Login note for Android/iOS wrappers

Email/password login works normally inside the app WebView.

Google and Apple login can be blocked by the provider if the OAuth page opens inside an embedded WebView. For production mobile apps, use an external browser / native OAuth flow through Capacitor, then return to the app with a deep link. Until you add native OAuth, keep email/password enabled as the reliable mobile login method.

The web app now disables Google/Apple buttons when OAuth keys are missing, so users will not see broken "authorization blocked" or "invalid user" screens just because the provider is not configured.
