"use client";

import Link from "next/link";
import { CheckCircle2, Image as ImageIcon, LayoutTemplate, Type } from "lucide-react";
import { atsSafeTemplateCount, headlineOptionalTemplateCount, photoTemplateCount, templateCount, templates } from "@/lib/templates";
import { demoResume } from "@/lib/resume";
import ResumePreview from "./ResumePreview";
import { useState } from "react";

type Props = { compact?: boolean };
type Filter = "all" | "ats" | "headline" | "photo";

const headlineFreeDemo = {
  ...demoResume,
  basics: { ...demoResume.basics, title: "" }
};

export default function TemplateGallery({ compact }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = templates.filter((template) => {
    if (filter === "ats") return template.atsSafe;
    if (filter === "headline") return template.headlineOptional;
    if (filter === "photo") return template.photoFriendly;
    return true;
  });
  const list = compact ? templates.slice(0, 3) : filtered;

  return (
    <div className="mx-auto max-w-7xl">
      {!compact && (
        <div className="mb-10 text-center">
          <p className="font-bold text-brand-600">{templateCount} free premium templates</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-ink">Flexible ATS-compatible resume templates</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">Choose from {atsSafeTemplateCount} ATS-safe layouts, {headlineOptionalTemplateCount} designs that work without a headline, and optional profile-photo templates.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {([
              ["all", `All ${templateCount}`, LayoutTemplate],
              ["ats", `ATS-safe ${atsSafeTemplateCount}`, CheckCircle2],
              ["headline", `Headline optional ${headlineOptionalTemplateCount}`, Type],
              ["photo", `Photo layouts ${photoTemplateCount}`, ImageIcon]
            ] as const).map(([value, label, Icon]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${filter === value ? "bg-ink text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {list.map((template) => (
          <div key={template.id} className="group min-w-0">
            <div className="relative h-[540px] overflow-hidden rounded-3xl bg-white p-3 shadow-soft ring-1 ring-slate-200 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-glow sm:p-4">
              <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black shadow-sm backdrop-blur ${template.atsSafe ? "text-emerald-700" : "text-brand-600"}`}><CheckCircle2 size={14} /> {template.atsSafe ? "ATS-safe" : "Photo option"}</span>
                {template.headlineOptional && <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur"><Type size={14} /> No headline needed</span>}
              </div>
              <div className="absolute inset-x-0 top-14 flex justify-center px-3">
                <div className="origin-top scale-[0.4] sm:scale-[0.42]">
                  <ResumePreview data={template.headlineOptional ? headlineFreeDemo : demoResume} template={template.id} previewOnly previewId={null} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex min-w-0 items-start justify-between gap-4 px-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-black text-ink sm:text-3xl">{template.name}</h3>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">{template.tone}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">Best for: {template.bestFor}</p>
              </div>
              <Link href={`/builder?template=${template.id}`} className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5">Use</Link>
            </div>
          </div>
        ))}
      </div>
      {!compact && list.length === 0 && <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">No templates match this filter.</div>}
      {compact && (
        <div className="mt-8 text-center">
          <Link href="/templates" className="inline-flex rounded-full bg-ink px-6 py-3 font-black text-white transition hover:-translate-y-0.5">Browse all {templateCount} templates</Link>
        </div>
      )}
    </div>
  );
}
