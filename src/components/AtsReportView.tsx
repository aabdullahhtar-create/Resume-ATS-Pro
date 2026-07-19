"use client";

import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { AtsReport } from "@/lib/ats";

export default function AtsReportView({ report }: { report: AtsReport }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold text-brand-600">ATS rank checker</p>
          <h3 className="text-3xl font-black text-ink">Score: {report.score}/100</h3>
          <p className="font-bold text-slate-600">{report.rank}</p>
        </div>
        <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-brand-500 bg-brand-50 text-3xl font-black text-ink">{report.score}</div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {Object.entries(report.sectionScores).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase text-slate-500">{key}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${value}%` }} /></div>
            <p className="mt-1 text-sm font-black text-ink">{value}%</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {report.issues.map((issue) => (
          <div key={issue.title} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
            {issue.type === "success" ? <CheckCircle2 className="shrink-0 text-emerald-500" /> : issue.type === "critical" ? <CircleAlert className="shrink-0 text-red-500" /> : <AlertTriangle className="shrink-0 text-amber-500" />}
            <div><p className="font-black text-ink">{issue.title}</p><p className="text-sm leading-6 text-slate-600">{issue.detail}</p></div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-ink p-5 text-white">
        <p className="font-black">Action plan</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-sky-100">
          {report.actionPlan.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}
