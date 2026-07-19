"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type SavedResume = {
  id: string;
  title: string;
  template: string;
  atsScore: number | null;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  async function loadResumes() {
    setFetching(true);
    setError("");
    try {
      const response = await fetch("/api/resumes", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load resumes");
      setResumes(data.resumes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load resumes");
    } finally {
      setFetching(false);
    }
  }

  async function deleteResume(id: string) {
    const confirmed = window.confirm("Delete this saved resume?");
    if (!confirmed) return;

    const response = await fetch(`/api/resumes/${id}`, { method: "DELETE", credentials: "include" });
    if (response.ok) {
      setResumes((current) => current.filter((resume) => resume.id !== id));
    }
  }

  useEffect(() => {
    if (user) void loadResumes();
    if (!loading && !user) setFetching(false);
  }, [user, loading]);

  if (loading || fetching) {
    return <main className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-brand-600" size={42} /></main>;
  }

  if (!user) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-78px)] max-w-4xl place-items-center px-6 py-16 text-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <FileText className="mx-auto text-brand-600" size={54} />
          <h1 className="mt-5 text-4xl font-black text-ink">Login required</h1>
          <p className="mt-3 text-slate-600">Create an account to save your resumes in the cloud and open them from web, iOS, or Android.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-full bg-ink px-6 py-3 font-black text-white">Login</Link>
            <Link href="/signup" className="rounded-full border border-slate-200 px-6 py-3 font-black text-ink">Create account</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-bold text-brand-600">Cloud dashboard</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-ink">Saved resumes</h1>
          <p className="mt-3 text-slate-600">Signed in as {user.email}. Your resumes are protected in your account and only visible after you sign in.</p>
        </div>
        <Link href="/builder" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-black text-white"><Plus size={18} /> New resume</Link>
      </div>

      {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

      {resumes.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <FileText className="mx-auto text-brand-600" size={52} />
          <h2 className="mt-4 text-2xl font-black text-ink">No cloud resumes yet</h2>
          <p className="mt-2 text-slate-600">Open the builder, fill your resume, then press Save Cloud.</p>
          <Link href="/builder" className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 font-black text-white">Build your first resume</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><FileText /></div>
                <button onClick={() => void deleteResume(resume.id)} className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete resume"><Trash2 size={18} /></button>
              </div>
              <h2 className="mt-5 text-xl font-black text-ink">{resume.title}</h2>
              <p className="mt-2 text-sm text-slate-500">Template: {resume.template} · ATS score: {resume.atsScore ?? "Not scored"}</p>
              <p className="mt-1 text-xs text-slate-400">Updated {new Date(resume.updatedAt).toLocaleString()}</p>
              <Link href={`/builder?resumeId=${resume.id}`} className="mt-5 block rounded-full bg-ink px-5 py-3 text-center font-black text-white">Open resume</Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
