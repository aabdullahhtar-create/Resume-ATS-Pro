"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, LogOut, Menu, Sparkles, UploadCloud, UserCircle, X } from "lucide-react";
import UploadResumeModal from "./UploadResumeModal";
import { useAuth } from "@/components/AuthProvider";

const nav = [
  { href: "/builder", label: "Builder" },
  { href: "/templates", label: "Templates" },
  { href: "/ats-checker", label: "ATS Checker" },
  { href: "/pricing", label: "Free Plan" }
];

function loginHref(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function guardedHref(path: string) {
    return user ? path : loginHref(path);
  }

  function openUpload() {
    if (!user) {
      router.push(loginHref(pathname || "/builder"));
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-3 font-black text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-white shadow-sm transition group-hover:rotate-6 group-hover:shadow-glow"><FileText size={20} /></span>
            <span className="text-xl">ResumeATS Pro</span>
          </Link>
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 text-sm font-bold text-slate-600 lg:flex xl:gap-7">
            {nav.map((item) => <Link key={item.href} href={guardedHref(item.href)} className="relative whitespace-nowrap transition hover:text-ink after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-all hover:after:w-full">{item.label}</Link>)}
            {user && <Link href="/dashboard" className="relative whitespace-nowrap transition hover:text-ink after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand-500 after:transition-all hover:after:w-full">Dashboard</Link>}
          </nav>
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link href={guardedHref("/generate-ai")} className="shimmer-button inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md xl:px-4">
              <Sparkles size={17} /> Generate with AI
            </Link>
            <button onClick={openUpload} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md xl:px-4">
              <UploadCloud size={17} /> Upload Resume
            </button>
            {!loading && user ? (
              <>
                <button onClick={() => void logout()} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 xl:px-4">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref(pathname || "/dashboard")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"><UserCircle size={16} /> Login</Link>
                <Link href={`/signup?next=${encodeURIComponent(pathname || "/dashboard")}`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-glow">Sign up</Link>
              </>
            )}
          </div>
          <button className="rounded-full p-2 transition hover:bg-white lg:hidden" onClick={() => setMobile((v) => !v)}>{mobile ? <X /> : <Menu />}</button>
        </div>
        {mobile && (
          <div className="border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex flex-col gap-3 font-bold text-slate-700">
              <Link href={guardedHref("/generate-ai")} onClick={() => setMobile(false)} className="rounded-full bg-brand-600 px-4 py-3 text-center text-white"><Sparkles size={16} className="mr-2 inline" /> Generate with AI</Link>
              {nav.map((item) => <Link key={item.href} href={guardedHref(item.href)} onClick={() => setMobile(false)}>{item.label}</Link>)}
              {user && <Link href="/dashboard" onClick={() => setMobile(false)}>Dashboard</Link>}
              <button onClick={() => { openUpload(); setMobile(false); }} className="mt-2 rounded-full bg-ink px-4 py-3 text-left text-white">Upload Resume</button>
              {!loading && user ? (
                <button onClick={() => { void logout(); setMobile(false); }} className="rounded-full border border-slate-200 px-4 py-3 text-left">Logout</button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={loginHref(pathname || "/dashboard")} onClick={() => setMobile(false)} className="rounded-full border border-slate-200 px-4 py-3 text-center">Login</Link>
                  <Link href={`/signup?next=${encodeURIComponent(pathname || "/dashboard")}`} onClick={() => setMobile(false)} className="rounded-full bg-brand-600 px-4 py-3 text-center text-white">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <UploadResumeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
