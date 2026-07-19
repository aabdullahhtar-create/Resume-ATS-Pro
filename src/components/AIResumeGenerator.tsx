"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Download, FileText, Loader2, Mic, MicOff, Save, Sparkles, Wand2, X } from "lucide-react";
import { analyzeResumeData } from "@/lib/ats";
import { cloneResume, demoResume, ResumeData, TemplateId } from "@/lib/resume";
import { isTemplateId, templates } from "@/lib/templates";
import ResumePreview from "./ResumePreview";
import { downloadResumePdf } from "@/lib/export-resume";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type AIResult = {
  updatedResume: ResumeData;
  changes: string[];
  questions?: string[];
  confidence?: "high" | "medium" | "low";
  mode?: "ai" | "fallback";
};

const quickCommands = [
  "Improve my summary for a frontend developer role and make it ATS friendly.",
  "Add React, Next.js, Tailwind CSS, Prisma, PostgreSQL, Git, and REST APIs to my skills.",
  "Rewrite my first experience bullets with stronger action verbs and measurable results.",
  "Tailor my resume for a software engineer internship.",
  "Replace Java with Python everywhere in my resume.",
  "Add a project called ResumeATS Pro using Next.js, Neon, Prisma, our AI API, and Tailwind CSS.",
  "Make my resume more professional and remove weak wording.",
  "Shorten my summary and make it more direct."
];

const commandTips = [
  "Change my title to Frontend Developer",
  "Remove Excel from my skills",
  "Add my internship at ABC Company as Web Developer from June 2025 to August 2025",
  "Rewrite the second bullet under my first experience",
  "Add Google Data Analytics Certificate",
  "Optimize this resume for remote React developer jobs"
];

function getSpeechConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as WindowWithSpeech;
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

function migrateResumeName(resume: ResumeData): ResumeData {
  const next = cloneResume(resume);
  const legacyNames = ["samantha williams", "semantha williams", "samantha", "semantha"];
  if (legacyNames.includes(next.basics.name.trim().toLowerCase()) || !next.basics.name.trim()) {
    next.basics.name = "Abdullah Akhtar";
  }
  if (next.basics.email.toLowerCase().includes("samantha") || next.basics.email.toLowerCase().includes("semantha")) {
    next.basics.email = "abdullah.akhtar@example.com";
  }
  if (next.basics.website.toLowerCase().includes("samantha") || next.basics.website.toLowerCase().includes("semantha")) {
    next.basics.website = "abdullahakhtar.com";
  }
  if (next.basics.linkedin.toLowerCase().includes("samantha") || next.basics.linkedin.toLowerCase().includes("semantha")) {
    next.basics.linkedin = "linkedin.com/in/abdullahakhtar";
  }
  return next;
}

export default function AIResumeGenerator() {
  const router = useRouter();
  const params = useSearchParams();
  const resumeIdParam = params.get("resumeId");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const previewStageRef = useRef<HTMLDivElement | null>(null);

  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [processing, setProcessing] = useState(false);
  const [draft, setDraft] = useState<AIResult | null>(null);
  const [data, setData] = useState<ResumeData>(() => cloneResume(demoResume));
  const [template, setTemplate] = useState<TemplateId>("eclipse");
  const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewFit, setPreviewFit] = useState({ scale: 0.62, width: 794, height: 1123 });

  const command = useMemo(() => (transcript || typedCommand).trim(), [transcript, typedCommand]);
  const previewData = draft?.updatedResume || data;
  const report = useMemo(() => analyzeResumeData(previewData), [previewData]);

  useEffect(() => {
    setSupported(Boolean(getSpeechConstructor()));
    return () => recognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    if (resumeIdParam) {
      setResumeId(resumeIdParam);
      void loadCloudResume(resumeIdParam);
      return;
    }

    const saved = localStorage.getItem("resume-data");
    const savedTemplate = localStorage.getItem("resume-template") as TemplateId | null;
    if (isTemplateId(savedTemplate)) setTemplate(savedTemplate);
    if (!saved) return;

    try {
      setData(migrateResumeName(JSON.parse(saved)));
    } catch {
      localStorage.removeItem("resume-data");
    }
  }, [resumeIdParam]);

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage) return;

    let frame = 0;
    const updatePreviewFit = () => {
      const paper = document.getElementById("ai-resume-preview");
      const stageBox = stage.getBoundingClientRect();
      const paperWidth = paper?.scrollWidth || 794;
      const paperHeight = Math.max(paper?.scrollHeight || 1123, 1123);
      const safeWidth = Math.max(stageBox.width - 32, 240);
      const safeHeight = Math.max(stageBox.height - 32, 240);
      const visiblePaperHeight = Math.min(paperHeight, 1123);
      const nextScale = Math.min(safeWidth / paperWidth, safeHeight / visiblePaperHeight, 1);

      setPreviewFit({
        scale: Number(Math.max(0.2, nextScale).toFixed(3)),
        width: paperWidth,
        height: paperHeight
      });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updatePreviewFit);
    };

    scheduleUpdate();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(stage);
    const paper = document.getElementById("ai-resume-preview");
    if (paper) observer.observe(paper);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [previewData, template]);

  async function loadCloudResume(id: string) {
    setNotice("Loading cloud resume for AI editing...");
    try {
      const response = await fetch(`/api/resumes/${id}`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load cloud resume");

      setResumeId(result.resume.id);
      setData(migrateResumeName(result.resume.data as ResumeData));
      if (isTemplateId(result.resume.template)) setTemplate(result.resume.template);
      localStorage.setItem("resume-data", JSON.stringify(result.resume.data));
      localStorage.setItem("resume-template", result.resume.template);
      setNotice("Cloud resume loaded. Speak or type the change you want.");
    } catch (err) {
      setNotice("");
      setError(err instanceof Error ? err.message : "Could not load cloud resume");
    }
  }

  function startListening() {
    setError("");
    setNotice("");
    setDraft(null);

    const SpeechRecognition = getSpeechConstructor();
    if (!SpeechRecognition) {
      setSupported(false);
      setError("Voice input is not supported in this browser. Type the command instead, or use Chrome/Edge.");
      return;
    }

    finalTranscriptRef.current = "";
    setTranscript("");
    setTypedCommand("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || "";
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim();
        } else {
          interim += text;
        }
      }
      setTranscript(`${finalTranscriptRef.current} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      const message = event.error === "not-allowed"
        ? "Microphone permission was blocked. Allow microphone access and try again."
        : event.message || "Voice input stopped unexpectedly. You can type the command instead.";
      setError(message);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function resetCommand() {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    finalTranscriptRef.current = "";
    setTranscript("");
    setTypedCommand("");
    setDraft(null);
    setError("");
    setNotice("");
    setListening(false);
  }

  async function generateDraft(customCommand?: string) {
    const requestedCommand = (customCommand || command).trim();
    if (!requestedCommand) {
      setError("Speak or type the resume change you want first.");
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("Our AI assistant is understanding your instruction and preparing a live resume preview...");

    try {
      const response = await fetch("/api/voice-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transcript: requestedCommand, resume: previewData })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not generate resume changes.");

      setDraft(result as AIResult);
      setTranscript("");
      setTypedCommand(requestedCommand);
      setNotice(result.mode === "fallback"
        ? "Prepared a safe draft using the built-in editor. Configure your AI API key for stronger understanding."
        : "AI draft is showing on the right. Review it, then apply or ask another change.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate resume changes.");
      setNotice("");
    } finally {
      setProcessing(false);
    }
  }

  function applyDraft() {
    if (!draft) return;
    setData(draft.updatedResume);
    localStorage.setItem("resume-data", JSON.stringify(draft.updatedResume));
    localStorage.setItem("resume-template", template);
    setDraft(null);
    setNotice("AI changes applied. You can continue with another command, save to cloud, or open the manual builder.");
  }

  function discardDraft() {
    setDraft(null);
    setNotice("Draft discarded. Your saved resume is unchanged.");
  }

  async function saveToCloud() {
    const resumeToSave = previewData;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const title = resumeToSave.basics.name
        ? `${resumeToSave.basics.name}${resumeToSave.basics.title ? ` - ${resumeToSave.basics.title}` : ""}`
        : "AI Generated Resume";
      const response = await fetch(resumeId ? `/api/resumes/${resumeId}` : "/api/resumes", {
        method: resumeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, template, data: resumeToSave, atsScore: report.score })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save AI resume");

      setResumeId(result.resume.id);
      setData(resumeToSave);
      setDraft(null);
      localStorage.setItem("resume-data", JSON.stringify(resumeToSave));
      localStorage.setItem("resume-template", template);
      setNotice("Saved to cloud successfully.");
      router.replace(`/generate-ai?resumeId=${result.resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save AI resume");
    } finally {
      setSaving(false);
    }
  }

  async function downloadPdf() {
    const element = document.getElementById("ai-resume-preview");
    await downloadResumePdf(element, previewData.basics.name || "ai-resume");
  }

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-8 md:px-6">
      <section className="no-print relative mb-6 overflow-hidden rounded-[2rem] border border-brand-100 bg-white p-6 shadow-soft">
        <div className="animated-grid absolute inset-0 opacity-70" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-600">
              <Sparkles size={15} /> Generate with AI
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-ink md:text-5xl">Speak or type. Our AI assistant updates your resume preview.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              This is separate from the manual builder. Use natural English commands, review the live preview on the right, then apply changes when you are happy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/builder" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5">
              <FileText size={17} /> Manual builder
            </Link>
            <button onClick={() => void saveToCloud()} disabled={saving} className="shimmer-button inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Save AI resume
            </button>
            <button onClick={() => void downloadPdf()} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5">
              <Download size={17} /> Download PDF
            </button>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(420px,620px)_minmax(520px,1fr)]">
        <section className="no-print space-y-5 rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-soft backdrop-blur">
          <div className="rounded-3xl bg-gradient-to-br from-skyglass via-white to-brand-50 p-5 ring-1 ring-brand-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-brand-600">AI command center</p>
                <h2 className="text-2xl font-black text-ink">Tell AI exactly what to change</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {!listening ? (
                  <button onClick={startListening} disabled={!supported || processing} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
                    <Mic size={17} /> Start voice
                  </button>
                ) : (
                  <button onClick={stopListening} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5">
                    <MicOff size={17} /> Stop
                  </button>
                )}
                <button onClick={resetCommand} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">
                  <X size={16} /> Clear
                </button>
              </div>
            </div>

            <textarea
              value={transcript || typedCommand}
              onChange={(event) => {
                setTypedCommand(event.target.value);
                setTranscript("");
                setDraft(null);
              }}
              placeholder="Example: Add my internship at ABC Company as Frontend Developer from June 2025 to August 2025, and write 3 strong bullet points using React and Tailwind."
              rows={8}
              className="mt-4 w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-slate-500">
                {listening ? "Listening... speak clearly in English." : supported ? "Use voice or type a detailed command." : "Voice unsupported here; typed commands still work."}
              </p>
              <button onClick={() => void generateDraft()} disabled={processing || !command} className="shimmer-button inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
                {processing ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />} Generate update
              </button>
            </div>
          </div>

          {(notice || error) && (
            <div className={`rounded-3xl px-4 py-3 text-sm font-bold ${error ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-brand-50 text-brand-900 ring-1 ring-brand-100"}`}>
              {error || notice}
            </div>
          )}

          {draft && (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-black text-emerald-800"><CheckCircle2 size={18} /> AI draft ready</div>
              <div className="mt-3 space-y-2">
                {draft.changes.map((change) => <p key={change} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold text-emerald-900 shadow-sm">{change}</p>)}
              </div>
              {draft.questions?.length ? (
                <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                  {draft.questions.map((question) => <p key={question}>Question: {question}</p>)}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={applyDraft} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white">Apply changes</button>
                <button onClick={discardDraft} className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-black text-emerald-800">Discard</button>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="font-black text-ink">Built-in AI commands</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Click any command to fill it, then press Generate update.</p>
            <div className="mt-4 grid gap-2">
              {quickCommands.map((item) => (
                <button key={item} onClick={() => { setTranscript(""); setTypedCommand(item); setDraft(null); }} className="rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs font-bold leading-5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-900">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="font-black text-ink">Try explicit commands like these</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {commandTips.map((tip) => (
                <button key={tip} onClick={() => { setTranscript(""); setTypedCommand(tip); setDraft(null); }} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100">
                  {tip}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="min-w-0 self-start">
          <div className="no-print mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-black text-ink"><Sparkles className="text-brand-600" /> Live AI resume preview</div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {draft ? "Showing AI draft before applying" : "Showing your current resume"} · ATS score {report.score}/100 · {Math.round(previewFit.scale * 100)}% zoom
                </p>
              </div>
              <select value={template} onChange={(e) => { setTemplate(e.target.value as TemplateId); localStorage.setItem("resume-template", e.target.value); }} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold">
                {templates.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.tone}</option>)}
              </select>
            </div>
            <div className="mt-3 flex gap-2 overflow-auto no-scrollbar">
              {templates.map((item) => (
                <button key={item.id} onClick={() => { setTemplate(item.id); localStorage.setItem("resume-template", item.id); }} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${template === item.id ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.name}</button>
              ))}
            </div>
          </div>

          <div ref={previewStageRef} className="flex min-h-[620px] items-start justify-center overflow-auto rounded-[2rem] bg-slate-200/50 p-3 no-scrollbar print-stage sm:p-4 xl:h-[calc(100vh-230px)]">
            <motion.div
              id="ai-resume-print-scale"
              key={JSON.stringify(previewData).slice(0, 100) + template}
              initial={{ opacity: 0.86, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              className="resume-preview-shell"
              style={{ width: `${previewFit.width * previewFit.scale}px`, height: `${previewFit.height * previewFit.scale}px` }}
            >
              <div
                className="resume-preview-scale origin-top-left"
                style={{ width: `${previewFit.width}px`, minHeight: `${previewFit.height}px`, transform: `scale(${previewFit.scale})`, transformOrigin: "top left" }}
              >
                <ResumePreview data={previewData} template={template} previewId="ai-resume-preview" />
              </div>
            </motion.div>
          </div>

          <div className="no-print mt-4 flex flex-wrap gap-3">
            {draft && <button onClick={applyDraft} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white"><CheckCircle2 size={17} /> Apply preview</button>}
            <button onClick={() => void downloadPdf()} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-black text-white">
              <Download size={17} /> Download PDF
            </button>
            <Link href="/builder" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">
              Continue manually <ArrowRight size={17} />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
