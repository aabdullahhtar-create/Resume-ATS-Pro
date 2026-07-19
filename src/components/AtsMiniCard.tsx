import { CheckCircle2, Gauge, Zap } from "lucide-react";

export default function AtsMiniCard() {
  return (
    <div className="rounded-[1.8rem] bg-white p-6 text-ink">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-brand-600">Live ATS rank</p>
          <h3 className="mt-1 text-3xl font-black">Resume Health</h3>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Gauge /></div>
      </div>
      <div className="mt-7 grid grid-cols-[auto_1fr] gap-5">
        <div className="grid h-32 w-32 place-items-center rounded-full border-[10px] border-brand-500 bg-brand-50">
          <div className="text-center"><p className="text-4xl font-black">94</p><p className="text-xs font-bold text-brand-600">Excellent</p></div>
        </div>
        <div className="space-y-3">
          {["Contact parsed", "Experience section clear", "Keywords matched", "Text-based ATS export"].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"><CheckCircle2 size={16} className="text-emerald-500" /> {item}</div>
          ))}
        </div>
      </div>
      <div className="mt-7 rounded-3xl bg-ink p-5 text-white">
        <div className="flex items-center gap-3"><Zap className="text-mint" /> <span className="font-black">Free ATS exports</span></div>
        <p className="mt-2 text-sm leading-6 text-sky-100">Download TXT, print a text-based PDF, or export PNG/JPG previews without payment.</p>
      </div>
    </div>
  );
}
