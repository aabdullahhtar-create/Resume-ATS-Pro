"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Loader2 } from "lucide-react";
import AtsReportView from "./AtsReportView";
import { AtsReport } from "@/lib/ats";

export default function AtsChecker() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [report, setReport] = useState<AtsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const uploaded = localStorage.getItem("uploaded-resume-text");
    if (uploaded) setResumeText(uploaded);
  }, []);

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resumeText, jobDescription })
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/ats-checker")}`);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not analyze resume");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze resume");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold text-brand-600">Resume mistake finder</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-ink">ATS rank checker</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Paste your resume text and an optional job description. The app will rank your resume and show exactly what to improve.</p>
        </div>
        <button onClick={analyze} disabled={!resumeText || loading} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-black text-white disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" /> : <FileSearch />} Analyze resume
        </button>
      </div>

      {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <label className="block">
            <span className="mb-2 block font-black text-ink">Resume text</span>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste resume text here or upload from the header..." className="h-96 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <label className="mt-5 block">
            <span className="mb-2 block font-black text-ink">Job description keywords (optional)</span>
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description here for keyword matching..." className="h-44 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
        </section>

        <section>
          {report ? <AtsReportView report={report} /> : <div className="grid min-h-[520px] place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center"><div><FileSearch className="mx-auto text-brand-600" size={52} /><h2 className="mt-4 text-2xl font-black text-ink">Your ATS report appears here</h2><p className="mt-2 text-slate-600">Click analyze to get score, mistakes, missing keywords, and action plan.</p></div></div>}
        </section>
      </div>
    </main>
  );
}
