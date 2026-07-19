"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  mode: "login" | "signup";
};

type ProviderConfig = {
  enabled: boolean;
  missing: string[];
};

type AuthConfig = {
  google: ProviderConfig;
};

type HealthStatus = {
  ok: boolean;
  database: {
    ok: boolean;
    message: string;
  };
  auth: AuthConfig;
};

const defaultConfig: AuthConfig = {
  google: { enabled: false, missing: [] },
};

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/api/")) return "/dashboard";
  if (value === "/login" || value === "/signup") return "/dashboard";
  return value;
}

function providerDisabledText(_provider: "google", config: ProviderConfig) {
  if (!config.missing.length) return "Google login is not configured yet.";
  return `Google login needs ${config.missing.join(", ")}.`;
}

function ProviderButton({
  provider,
  href,
  config,
  nextPath,
  inAppBlocked = false
}: {
  provider: "google";
  href: string;
  config: ProviderConfig;
  nextPath: string;
  inAppBlocked?: boolean;
}) {
  const providerName = "Google";
  const icon = <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-800">G</span>;

  if (inAppBlocked) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-950">
        <div className="flex items-center gap-3">
          {icon}
          <span>Open in Chrome, Safari, or Edge</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-sky-800">Google blocks sign-in inside LinkedIn's in-app browser. Tap LinkedIn's three-dot menu, choose <b>Open in browser</b>, then use Google login.</p>
      </div>
    );
  }

  if (!config.enabled) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
        <div className="flex items-center gap-3">
          {icon}
          <span>{providerName} login unavailable</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-amber-800">{providerDisabledText(provider, config)}</p>
      </div>
    );
  }

  return (
    <a href={`${href}?next=${encodeURIComponent(nextPath)}`} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow">
      <span className="flex items-center gap-3">{icon} Continue with {providerName}</span>
      <ArrowRight className="transition group-hover:translate-x-1" size={18} />
    </a>
  );
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/dashboard");
  const [authConfig, setAuthConfig] = useState<AuthConfig>(defaultConfig);
  const [databaseOk, setDatabaseOk] = useState(false);
  const [databaseMessage, setDatabaseMessage] = useState("Checking database connection...");
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isLinkedInBrowser, setIsLinkedInBrowser] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(safeNextPath(params.get("next")));
    setError(params.get("error") || "");
    const userAgent = window.navigator.userAgent || "";
    setIsLinkedInBrowser(/LinkedInApp|LinkedIn|com\.linkedin/i.test(userAgent));
  }, []);

  useEffect(() => {
    fetch("/api/health", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: HealthStatus) => {
        setAuthConfig(data.auth ?? defaultConfig);
        setDatabaseOk(Boolean(data.database?.ok));
        setDatabaseMessage(data.database?.message || "Database status could not be checked.");
      })
      .catch(() => {
        setDatabaseOk(false);
        setDatabaseMessage("Could not check backend health. Make sure the Next.js server is running.");
      })
      .finally(() => setConfigLoaded(true));
  }, []);

  const providerLinks = useMemo(() => ({
    google: "/api/auth/oauth/google"
  }), []);

  const displayedAuthConfig = databaseOk
    ? authConfig
    : {
        google: { enabled: false, missing: ["database connection"] },
      };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(isSignup ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Authentication failed");

      setSuccess(isSignup ? "Account created successfully. Opening your dashboard..." : "Logged in successfully. Opening your dashboard...");
      await refreshUser();
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative isolate grid min-h-[calc(100vh-78px)] overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 animated-grid opacity-70" />
      <div className="pointer-events-none absolute -left-20 top-14 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl floating-orb" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-mint/50 blur-3xl floating-orb-reverse" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden rounded-[2.5rem] border border-white/60 bg-white/55 p-8 shadow-soft backdrop-blur-xl lg:block fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-black text-brand-600">
            <ShieldCheck size={17} /> Protected workspace
          </div>
          <h1 className="mt-6 max-w-xl text-5xl font-black tracking-tight text-ink">
            Sign in first, then build resumes across web, Android, and iOS.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
            Every builder, upload, ATS checker, template, and cloud-save feature is behind a secure account gate, so each user keeps their own resume data private.
          </p>
          <div className="mt-8 grid gap-4">
            {["Google or email login", "Private cloud dashboard", "Resume data linked to the signed-in user"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-3xl bg-white/75 p-4 font-bold text-slate-700 shadow-sm lift-card">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-600"><LockKeyhole size={18} /></span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2.25rem] border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur-xl fade-in-up">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 font-black text-brand-600"><Sparkles size={17} /> ResumeATS Pro</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-ink">
                {isSignup ? "Create account" : "Welcome back"}
              </h2>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-glow">
              <LockKeyhole />
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            {isSignup
              ? "Sign up once to unlock the builder, uploads, ATS checking, templates, and cloud dashboard."
              : "Log in to unlock every feature and continue editing your saved resumes."}
          </p>

          {isLinkedInBrowser && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
              <ExternalLink className="mt-0.5 shrink-0" size={18} />
              <p><b>LinkedIn browser detected.</b> Email login still works here, but Google login must be opened in your phone's normal browser.</p>
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {!configLoaded ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">Checking Google login...</div>
            ) : (
              <>
                <ProviderButton provider="google" href={providerLinks.google} config={displayedAuthConfig.google} nextPath={nextPath} inAppBlocked={isLinkedInBrowser} />
              </>
            )}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or use email <span className="h-px flex-1 bg-slate-200" />
          </div>

          {configLoaded && !databaseOk && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
              <p className="font-black">Database setup required</p>
              <p className="mt-1">{databaseMessage}</p>
              <p className="mt-2 text-xs text-red-700">Email and Google login need the database because user accounts are saved there.</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {isSignup && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" placeholder="Your name" required />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" placeholder="you@example.com" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" placeholder="Minimum 8 characters" minLength={8} required />
            </label>

            {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            {success && <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> {success}</div>}

            <button disabled={loading || !databaseOk} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
              {loading && <Loader2 className="animate-spin" size={18} />}
              {!databaseOk ? "Connect database first" : isSignup ? "Create account and continue" : "Log in and continue"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            {isSignup ? "Already have an account?" : "No account yet?"}{" "}
            <Link href={`${isSignup ? "/login" : "/signup"}?next=${encodeURIComponent(nextPath)}`} className="font-black text-brand-600">
              {isSignup ? "Log in" : "Create one"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
