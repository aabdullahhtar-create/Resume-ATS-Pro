"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mic, MicOff, Sparkles, Wand2, X } from "lucide-react";
import type { ResumeData } from "@/lib/resume";

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

type VoiceAssistantResponse = {
  updatedResume: ResumeData;
  changes: string[];
  questions?: string[];
  confidence?: "high" | "medium" | "low";
  mode?: "ai" | "fallback";
};

type Props = {
  data: ResumeData;
  setData: Dispatch<SetStateAction<ResumeData>>;
  onApplied?: () => void;
};

const examples = [
  "Improve my professional summary for a software engineer role.",
  "Add React, TypeScript, Node.js, and PostgreSQL to my skills.",
  "Rewrite my first experience bullets with stronger numbers and action verbs.",
  "Add a project called ResumeATS Pro with Next.js, Prisma, and Neon."
];

function getSpeechConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as WindowWithSpeech;
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

export default function VoiceResumeAssistant({ data, setData, onApplied }: Props) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [processing, setProcessing] = useState(false);
  const [draft, setDraft] = useState<VoiceAssistantResponse | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const command = useMemo(() => (transcript || typedCommand).trim(), [transcript, typedCommand]);

  useEffect(() => {
    setSupported(Boolean(getSpeechConstructor()));
    return () => recognitionRef.current?.abort();
  }, []);

  function startListening() {
    setError("");
    setNotice("");
    setDraft(null);

    const SpeechRecognition = getSpeechConstructor();
    if (!SpeechRecognition) {
      setSupported(false);
      setError("Voice input is not supported in this browser. Type the change request instead, or use Chrome/Edge.");
      return;
    }

    finalTranscriptRef.current = "";
    setTranscript("");

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
        : event.message || "Voice input stopped unexpectedly. You can type the request instead.";
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

  function reset() {
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

  async function generateDraft() {
    if (!command) {
      setError("Speak or type the resume change you want first.");
      return;
    }

    setProcessing(true);
    setError("");
    setNotice("Analyzing your instruction and preparing resume changes...");

    try {
      const response = await fetch("/api/voice-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transcript: command, resume: data })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not generate resume changes.");

      setDraft(result as VoiceAssistantResponse);
      setNotice(result.mode === "fallback"
        ? "Prepared changes using the built-in editor. Add GEMINI_API_KEY for stronger AI rewriting."
        : "AI changes are ready. Review them before applying.");
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
    setNotice("Voice changes applied to your resume. Review the preview, then save to cloud.");
    setDraft(null);
    onApplied?.();
  }

  return (
    <section className="no-print overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white via-skyglass to-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-brand-600 shadow-sm">
            <Sparkles size={15} /> Voice AI Resume Editor
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-ink">Speak the changes you want. Review. Apply.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Tell the assistant what to update in English. It can improve summaries, rewrite bullets, add skills, add projects, and keep the resume ATS-friendly.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {!listening ? (
            <button onClick={startListening} disabled={!supported || processing} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
              <Mic size={17} /> Start voice
            </button>
          ) : (
            <button onClick={stopListening} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5">
              <MicOff size={17} /> Stop
            </button>
          )}
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">
            <X size={16} /> Clear
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <div className="rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200">
          <label className="block text-sm font-black text-slate-700">Voice transcript or typed command</label>
          <textarea
            value={transcript || typedCommand}
            onChange={(event) => {
              setTypedCommand(event.target.value);
              setTranscript("");
            }}
            placeholder="Example: Improve my summary for a frontend developer role and add React, Next.js, Tailwind, and Prisma to skills."
            rows={5}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">{listening ? "Listening... speak clearly in English." : supported ? "Use voice or type the instruction manually." : "Voice unsupported here; typed instruction still works."}</p>
            <button onClick={() => void generateDraft()} disabled={processing || !command} className="shimmer-button inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">
              {processing ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />} Generate changes
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-slate-700">Try saying</p>
          <div className="mt-3 grid gap-2">
            {examples.map((example) => (
              <button key={example} onClick={() => { setTranscript(""); setTypedCommand(example); setDraft(null); }} className="rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs font-bold leading-5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-900">
                “{example}”
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>}
      {notice && <div className="mt-4 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm font-bold text-brand-900">{notice}</div>}

      {draft && (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-800"><CheckCircle2 size={17} /> Suggested changes ready</p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">Confidence: {draft.confidence || "medium"}</p>
            </div>
            <button onClick={applyDraft} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5">
              Apply to resume
            </button>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-emerald-900">
            {(draft.changes?.length ? draft.changes : ["Resume content updated."]).map((change, index) => <li key={index}>{change}</li>)}
          </ul>
          {!!draft.questions?.length && (
            <div className="mt-3 rounded-2xl bg-white/80 p-3 text-xs font-bold leading-5 text-amber-800">
              Needs review: {draft.questions.join(" ")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
