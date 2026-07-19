import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Gauge, Layers3, Sparkles, Wand2 } from "lucide-react";
import TemplateGallery from "@/components/TemplateGallery";
import AtsMiniCard from "@/components/AtsMiniCard";
import { atsSafeTemplateCount, templateCount } from "@/lib/templates";

const features = [
  { icon: FileText, title: "Free ATS resume builder", text: "Create text-based resumes with recruiter-friendly headings, bullets, skills, education, projects, and certifications." },
  { icon: Gauge, title: "Live ATS rank checker", text: "Score resumes by contact details, section clarity, measurable achievements, keywords, skills, and formatting." },
  { icon: Layers3, title: `${templateCount} flexible templates`, text: `Choose from ${atsSafeTemplateCount} ATS-safe layouts, headline-optional designs, and optional profile-photo templates.` },
  { icon: Wand2, title: "ATS boost helper", text: "Fill empty sections with editable keyword suggestions and achievement bullet examples you can customize." }
];

const proof = ["Free ATS PDF print", "Plain TXT export", "PNG/JPG previews", `${templateCount} templates + flexible sections`, "No payment lock", "Upload + rebuild"];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative bg-navy px-6 pb-24 pt-20 text-white">
        <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl floating-orb" />
        <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-mint/25 blur-3xl floating-orb-reverse" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_18%_18%,#1298E8,transparent_28rem),radial-gradient(circle_at_80%_10%,#B9FBC0,transparent_22rem),linear-gradient(120deg,rgba(255,255,255,.12),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/10 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-sky-100 backdrop-blur">
              <Sparkles size={16} /> Free modern ATS resume generator · account required
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
              Build a polished ATS resume with a live rank score.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-100">
              Upload your old resume or start from a professional template. Improve sections with ATS tips, check your rank, then export a text-based PDF or plain text file for free.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/builder" className="shimmer-button inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-navy shadow-glow transition hover:-translate-y-0.5">
                Start Free Builder <ArrowRight size={18} />
              </Link>
              <Link href="/templates" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/15">
                View Templates
              </Link>
            </div>
            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 text-sm text-sky-50 md:grid-cols-3">
              {proof.map((item) => (
                <div key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-mint" /> {item}</div>
              ))}
            </div>
          </div>
          <div className="relative fade-in-up">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur-xl">
              <AtsMiniCard />
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-16 px-6 pb-12">
        <TemplateGallery compact />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-bold text-brand-600">Everything needed for a strong resume</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-ink">Upload, build, score, export.</h2>
          </div>
          <Link href="/ats-checker" className="shimmer-button rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-glow">Try ATS checker</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="lift-card rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon /></div>
                <h3 className="text-lg font-black text-ink">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
