import Link from "next/link";
import { Check, Gift } from "lucide-react";
import { requirePageUser } from "@/lib/page-auth";
import { atsSafeTemplateCount, templateCount } from "@/lib/templates";

export default async function PricingPage() {
  await requirePageUser("/pricing");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center fade-in-up">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-600"><Gift /></div>
        <h1 className="text-5xl font-black tracking-tight text-ink">Everything is free.</h1>
        <p className="mt-4 text-slate-600">The payment lock has been removed. Users can build, score, customize, and export resumes without paying after login.</p>
      </div>
      <div className="lift-card mx-auto mt-12 max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Free plan</p>
            <h2 className="mt-2 text-3xl font-black text-ink">ATS Resume Builder</h2>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-ink">$0</p>
            <p className="text-xs text-slate-500">forever</p>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {["Text-based ATS PDF print export", "TXT export for parser-friendly resume text", "PNG and JPG preview export", `${templateCount} free templates (${atsSafeTemplateCount} ATS-safe)`, "Optional headline and section visibility controls", "Custom section names, spacing, and text size", "Live ATS score and action plan", "Resume upload workflow", "Unlimited browser edits"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-slate-700"><Check className="text-brand-600" size={18} /> {item}</div>
          ))}
        </div>
        <Link href="/builder" className="shimmer-button mt-8 block rounded-full bg-ink px-6 py-4 text-center font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-glow">Build resume now</Link>
        <p className="mt-4 text-center text-xs text-slate-500">Tip: Use “ATS PDF” to print/save a text-readable PDF instead of an image-only PDF.</p>
      </div>
    </main>
  );
}
