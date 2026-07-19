"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, FileImage, FileText, Loader2, Plus, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { cloneResume, demoResume, emptyResume, ResumeData, ResumeSectionKey, ResumeSettings, safeId, TemplateId, resumeToPlainText, resolveResumeSettings, starterResumes } from "@/lib/resume";
import { downloadResumeImage } from "@/lib/export-resume";
import { isTemplateId, templates } from "@/lib/templates";
import { analyzeResumeData } from "@/lib/ats";
import ResumePreview from "./ResumePreview";
import AtsReportView from "./AtsReportView";
import { useAuth } from "@/components/AuthProvider";

const steps = ["Basics", "Summary", "Experience", "Education", "Skills", "Customize", "Finalize"];

const roleSkillMap: Record<string, string[]> = {
  software: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "REST APIs", "Git", "Testing"],
  data: ["SQL", "Python", "Excel", "Power BI", "Tableau", "Data Analysis", "Forecasting", "Reporting"],
  marketing: ["SEO", "Google Ads", "Meta Ads", "GA4", "Email Marketing", "A/B Testing", "Campaign Analytics", "Content Strategy"],
  healthcare: ["Patient Coordination", "EHR", "HIPAA", "Scheduling", "Clinical Operations", "Compliance", "Quality Improvement", "Reporting"],
  business: ["Excel", "SQL", "Requirements Gathering", "Process Improvement", "Stakeholder Management", "Reporting", "Project Management", "Forecasting"]
};

function Field({ label, value, onChange, placeholder, textarea = false, helper, onFocus, onBlur }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; textarea?: boolean; helper?: string; onFocus?: () => void; onBlur?: () => void; key?: string | number }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        {label}
        {helper && <span className="text-xs font-semibold text-slate-400">{helper}</span>}
      </span>
      {textarea ? (
        <textarea value={value} onFocus={onFocus} onBlur={onBlur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={5} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
      ) : (
        <input value={value} onFocus={onFocus} onBlur={onBlur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
      )}
    </label>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300">
      <span>
        <span className="block font-black text-ink">{label}</span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-sky-600" />
    </label>
  );
}

const sectionOptions: Array<{ key: ResumeSectionKey; label: string; description: string }> = [
  { key: "summary", label: "Professional summary", description: "Hide it for academic, portfolio, or very short resumes." },
  { key: "experience", label: "Experience", description: "Useful for employed candidates; optional for first-time applicants." },
  { key: "education", label: "Education", description: "Show degrees, diplomas, courses, or training." },
  { key: "projects", label: "Projects", description: "Useful for students, developers, designers, and career changers." },
  { key: "skills", label: "Skills", description: "Keep a dedicated keyword section for most ATS applications." },
  { key: "certifications", label: "Certifications", description: "Hide when there are no relevant certificates." }
];

function getRoleSkills(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("software") || lower.includes("developer") || lower.includes("engineer")) return roleSkillMap.software;
  if (lower.includes("data") || lower.includes("analyst")) return roleSkillMap.data;
  if (lower.includes("marketing") || lower.includes("seo") || lower.includes("campaign")) return roleSkillMap.marketing;
  if (lower.includes("health") || lower.includes("medical") || lower.includes("clinical") || lower.includes("patient")) return roleSkillMap.healthcare;
  return roleSkillMap.business;
}

function unique(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function parseDelimitedList(value: string) {
  return unique(value.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean));
}

async function imageFileToDataUrl(file: File) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the selected image."));
    img.src = URL.createObjectURL(file);
  });

  const maxSize = 520;
  const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process the selected image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(image.src);
  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function ResumeBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const resumeIdParam = params.get("resumeId");
  const templateParam = params.get("template");
  const initialTemplate: TemplateId = isTemplateId(templateParam) ? templateParam : "eclipse";
  const [data, setData] = useState<ResumeData>(() => cloneResume(demoResume));
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cloudNotice, setCloudNotice] = useState("");
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const [previewFit, setPreviewFit] = useState({ scale: 0.62, width: 794, height: 1123 });
  const [skillsText, setSkillsText] = useState(data.skills.join(", "));
  const [certificationsText, setCertificationsText] = useState(data.certifications.join("\n"));
  const [editingListField, setEditingListField] = useState<"skills" | "certifications" | null>(null);
  const report = useMemo(() => analyzeResumeData(data), [data]);
  const plainText = useMemo(() => resumeToPlainText(data), [data]);
  const suggestedSkills = useMemo(() => getRoleSkills(data.basics.title || data.experience[0]?.role || "Business Analyst"), [data.basics.title, data.experience]);
  const settings = resolveResumeSettings(data.settings);

  function migrateResumeName(resume: ResumeData): ResumeData {
    const next = cloneResume(resume);
    const legacyNames = ["samantha williams", "semantha williams", "samantha", "semantha"];
    if (legacyNames.includes(next.basics.name.trim().toLowerCase())) {
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

  function loadStoredResume() {
    const saved = localStorage.getItem("resume-data");
    const savedTemplate = localStorage.getItem("resume-template") as TemplateId | null;
    if (isTemplateId(savedTemplate)) setTemplate(savedTemplate);
    if (!saved) return;

    try {
      setData(migrateResumeName(JSON.parse(saved)));
    } catch {
      localStorage.removeItem("resume-data");
    }
  }

  async function loadCloudResume(id: string) {
    setCloudNotice("Loading cloud resume...");
    try {
      const response = await fetch(`/api/resumes/${id}`, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load cloud resume");

      setResumeId(result.resume.id);
      setData(migrateResumeName(result.resume.data as ResumeData));
      if (isTemplateId(result.resume.template)) setTemplate(result.resume.template);
      localStorage.setItem("resume-data", JSON.stringify(result.resume.data));
      localStorage.setItem("resume-template", result.resume.template);
      setCloudNotice("Cloud resume loaded.");
    } catch (err) {
      setCloudNotice(err instanceof Error ? err.message : "Could not load cloud resume");
    }
  }

  useEffect(() => {
    if (resumeIdParam) {
      setResumeId(resumeIdParam);
      void loadCloudResume(resumeIdParam);
      return;
    }
    loadStoredResume();
  }, [resumeIdParam]);

  useEffect(() => {
    localStorage.setItem("resume-data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("resume-template", template);
  }, [template]);

  useEffect(() => {
    if (editingListField !== "skills") setSkillsText(data.skills.join(", "));
    if (editingListField !== "certifications") setCertificationsText(data.certifications.join("\n"));
  }, [data.skills, data.certifications, editingListField]);

  useEffect(() => {
    if (params.get("source") === "upload") {
      loadStoredResume();
    }
  }, [params]);

  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage) return;

    let frame = 0;
    const updatePreviewFit = () => {
      const paper = document.getElementById("resume-preview");
      const stageBox = stage.getBoundingClientRect();
      const paperWidth = paper?.scrollWidth || 794;
      const paperHeight = Math.max(paper?.scrollHeight || 1123, 1123);
      const safeWidth = Math.max(stageBox.width - 24, 260);
      const safeHeight = Math.max(stageBox.height - 24, 260);
      const visiblePaperHeight = Math.min(paperHeight, 1123);
      const widthScale = safeWidth / paperWidth;
      const heightScale = safeHeight / visiblePaperHeight;
      const isStackedLayout = window.matchMedia("(max-width: 1279px)").matches;
      const nextScale = isStackedLayout ? Math.min(widthScale, 1) : Math.min(widthScale, heightScale, 1);

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
    const paper = document.getElementById("resume-preview");
    if (paper) observer.observe(paper);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [data, template]);

  function updateBasics(key: keyof ResumeData["basics"], value: string) {
    setData((prev) => ({ ...prev, basics: { ...prev.basics, [key]: value } }));
  }

  function updateSettings(patch: Partial<ResumeSettings>) {
    setData((prev) => ({
      ...prev,
      settings: { ...resolveResumeSettings(prev.settings), ...patch }
    }));
  }

  function updateSectionTitle(key: ResumeSectionKey, value: string) {
    setData((prev) => {
      const current = resolveResumeSettings(prev.settings);
      return {
        ...prev,
        settings: {
          ...current,
          sectionTitles: { ...current.sectionTitles, [key]: value || current.sectionTitles[key] }
        }
      };
    });
  }

  function downloadTextFile() {
    const filename = `${(data.basics.name || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "resume"}-ats.txt`;
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function printResume() {
    window.print();
  }

  async function saveToCloud() {
    if (!user) {
      setCloudNotice("Please log in or create an account before saving to cloud.");
      router.push("/login");
      return;
    }

    setSaving(true);
    setCloudNotice("");
    try {
      const title = data.basics.name
        ? `${data.basics.name}${data.basics.title ? ` - ${data.basics.title}` : ""}`
        : "Untitled Resume";
      const response = await fetch(resumeId ? `/api/resumes/${resumeId}` : "/api/resumes", {
        method: resumeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, template, data, atsScore: report.score })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save resume");

      setResumeId(result.resume.id);
      setCloudNotice("Saved to cloud successfully.");
      router.replace(`/builder?resumeId=${result.resume.id}`);
    } catch (err) {
      setCloudNotice(err instanceof Error ? err.message : "Could not save resume");
    } finally {
      setSaving(false);
    }
  }

  async function downloadImage(format: "png" | "jpg") {
    const element = document.getElementById("resume-preview");
    await downloadResumeImage(element, data.basics.name || "resume", format);
  }

  function boostResume() {
    setData((prev) => {
      const role = prev.basics.title || prev.experience[0]?.role || "Target Role";
      const skills = getRoleSkills(role);
      const firstCompany = prev.experience[0]?.company || "Company";
      const boostedExperience = prev.experience.length ? prev.experience.map((exp, expIndex) => {
        const starterBullets = expIndex === 0
          ? [
              `Improved ${role.toLowerCase()} workflows by 20% by analyzing data, documenting requirements, and coordinating stakeholder actions.`,
              `Created reports, dashboards, or tracking tools that saved 8+ hours per week and improved team visibility.`,
              `Collaborated with cross-functional teams to deliver process improvements, resolve issues, and support measurable business results.`
            ]
          : [
              `Supported daily operations and reporting for ${firstCompany}, improving accuracy, response time, or service quality by 15%.`,
              `Maintained documentation, tracked priorities, and communicated updates to stakeholders to keep work on schedule.`
            ];
        const filledBullets = [...exp.bullets];
        while (filledBullets.length < Math.min(3, starterBullets.length)) filledBullets.push("");
        return {
          ...exp,
          role: exp.role || role,
          bullets: filledBullets.map((bullet, index) => bullet.trim() ? bullet : starterBullets[index] || starterBullets[0])
        };
      }) : emptyResume.experience;

      return {
        ...prev,
        summary: prev.summary || `${role} with experience in ${skills.slice(0, 4).join(", ")}. Skilled at improving workflows, using data to support decisions, collaborating with stakeholders, and delivering measurable results.`,
        skills: unique([...prev.skills, ...skills]),
        experience: boostedExperience
      };
    });
  }

  async function handlePhotoUpload(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCloudNotice("Please select a valid image file for the profile picture.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setCloudNotice("Profile picture is too large. Please use an image under 6 MB.");
      return;
    }

    try {
      const photo = await imageFileToDataUrl(file);
      updateBasics("photo", photo);
      setCloudNotice("Profile picture added. Select a photo template such as Portrait Pro, Sidebar Focus, Metro Card, Halo, or Compact Photo to display it.");
    } catch (error) {
      setCloudNotice(error instanceof Error ? error.message : "Could not process profile picture.");
    }
  }

  const stepBody = [
    <div key="basics" className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        {starterResumes.map((preset) => (
          <button key={preset.label} onClick={() => setData(cloneResume(preset.data))} className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md">
            <p className="font-black text-ink">{preset.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{preset.description}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" value={data.basics.name} onChange={(v) => updateBasics("name", v)} placeholder="Abdullah Akhtar" />
        <Field label="Professional headline (optional)" value={data.basics.title} onChange={(v) => updateBasics("title", v)} placeholder="Senior Business Analyst" helper="Leave blank when not needed" />
        <Field label="Email" value={data.basics.email} onChange={(v) => updateBasics("email", v)} placeholder="you@email.com" />
        <Field label="Phone" value={data.basics.phone} onChange={(v) => updateBasics("phone", v)} placeholder="+92 300 0000000" />
        <Field label="Location" value={data.basics.location} onChange={(v) => updateBasics("location", v)} placeholder="City, Country" />
        <Field label="Website" value={data.basics.website} onChange={(v) => updateBasics("website", v)} placeholder="portfolio.com" />
        <Field label="LinkedIn" value={data.basics.linkedin} onChange={(v) => updateBasics("linkedin", v)} placeholder="linkedin.com/in/username" />
        <Field label="GitHub" value={data.basics.github} onChange={(v) => updateBasics("github", v)} placeholder="github.com/username" />
      </div>
      <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-xl font-black text-slate-500 ring-1 ring-slate-200">
              {data.basics.photo ? <img src={data.basics.photo} alt="Profile preview" className="h-full w-full object-cover" /> : "AA"}
            </div>
            <div>
              <p className="font-black text-ink">Optional profile picture</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Shown only on the new photo templates. For strict ATS applications, use a non-photo template.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600 transition hover:bg-brand-100">
              Upload photo
              <input type="file" accept="image/*" onChange={(event) => void handlePhotoUpload(event.target.files?.[0] || null)} className="sr-only" />
            </label>
            {data.basics.photo && <button onClick={() => updateBasics("photo", "")} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Remove</button>}
          </div>
        </div>
      </div>
    </div>,
    <div key="summary" className="space-y-5">
      <Field textarea label="Professional summary" value={data.summary} onChange={(v) => setData((p) => ({ ...p, summary: v }))} placeholder="3-4 lines: target role, experience, core skills, measurable value." helper="Keep it keyword rich" />
      <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5 text-sm leading-6 text-slate-700"><b>ATS tip:</b> Use the exact job title, core tools, and 1 measurable result. Avoid generic phrases like “hardworking and passionate.”</div>
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="font-black text-ink">Suggested keywords for your title</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => <button key={skill} onClick={() => setData((p) => ({ ...p, skills: unique([...p.skills, skill]) }))} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-brand-100">+ {skill}</button>)}
        </div>
      </div>
    </div>,
    <div key="experience" className="space-y-5">
      {data.experience.map((exp, idx) => (
        <div key={exp.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-black text-ink">Experience {idx + 1}</h3><button onClick={() => setData((p) => ({ ...p, experience: p.experience.filter((x) => x.id !== exp.id) }))} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 size={18} /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Role" value={exp.role} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, role: v } : x) }))} />
            <Field label="Company" value={exp.company} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, company: v } : x) }))} />
            <Field label="Location" value={exp.location} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, location: v } : x) }))} />
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Start" value={exp.start} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, start: v } : x) }))} /><Field label="End" value={exp.end} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, end: v } : x) }))} /></div>
          </div>
          <div className="mt-4 space-y-3">
            {exp.bullets.map((bullet, bIdx) => (
              <Field key={bIdx} label={`Achievement bullet ${bIdx + 1}`} value={bullet} onChange={(v) => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, bullets: x.bullets.map((b, i) => i === bIdx ? v : b) } : x) }))} placeholder="Improved process efficiency by 20% by..." helper="Action + task + number" />
            ))}
            <button onClick={() => setData((p) => ({ ...p, experience: p.experience.map((x) => x.id === exp.id ? { ...x, bullets: [...x.bullets, ""] } : x) }))} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold"><Plus size={16} /> Add bullet</button>
          </div>
        </div>
      ))}
      <button onClick={() => setData((p) => ({ ...p, experience: [...p.experience, { id: safeId("exp"), company: "", role: "", location: "", start: "", end: "", bullets: [""] }] }))} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-bold text-white sm:w-auto"><Plus size={18} /> Add experience</button>
    </div>,
    <div key="education" className="space-y-5">
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-black text-ink">Education {idx + 1}</h3><button onClick={() => setData((p) => ({ ...p, education: p.education.filter((x) => x.id !== edu.id) }))} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 size={18} /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="School" value={edu.school} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, school: v } : x) }))} />
            <Field label="Degree" value={edu.degree} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, degree: v } : x) }))} />
            <Field label="Location" value={edu.location} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, location: v } : x) }))} />
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Start" value={edu.start} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, start: v } : x) }))} /><Field label="End" value={edu.end} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, end: v } : x) }))} /></div>
            <div className="md:col-span-2"><Field label="Details" value={edu.details} onChange={(v) => setData((p) => ({ ...p, education: p.education.map((x) => x.id === edu.id ? { ...x, details: v } : x) }))} placeholder="Relevant coursework, honors, GPA if strong" /></div>
          </div>
        </div>
      ))}
      <button onClick={() => setData((p) => ({ ...p, education: [...p.education, { id: safeId("edu"), school: "", degree: "", location: "", start: "", end: "", details: "" }] }))} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-bold text-white sm:w-auto"><Plus size={18} /> Add education</button>
    </div>,
    <div key="skills" className="space-y-5">
      <Field
        textarea
        label="Skills"
        value={skillsText}
        onFocus={() => setEditingListField("skills")}
        onBlur={() => {
          setEditingListField(null);
          setSkillsText(data.skills.join(", "));
        }}
        onChange={(v) => {
          setSkillsText(v);
          setData((p) => ({ ...p, skills: parseDelimitedList(v) }));
        }}
        placeholder="Excel, SQL, Project Management, Python"
        helper="Separate with commas, semicolons, or new lines"
      />
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="font-black text-ink">One-click skill chips</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => <button key={skill} onClick={() => setData((p) => ({ ...p, skills: unique([...p.skills, skill]) }))} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-100">+ {skill}</button>)}
        </div>
      </div>
      <Field
        textarea
        label="Certifications"
        value={certificationsText}
        onFocus={() => setEditingListField("certifications")}
        onBlur={() => {
          setEditingListField(null);
          setCertificationsText(data.certifications.join("\n"));
        }}
        onChange={(v) => {
          setCertificationsText(v);
          setData((p) => ({ ...p, certifications: parseDelimitedList(v) }));
        }}
        placeholder="Google Data Analytics, AWS Cloud Practitioner"
        helper="Separate with commas, semicolons, or new lines"
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="font-black text-ink">Projects</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Add a project heading, then optional explanatory lines below it.</p>
          </div>
          <button
            onClick={() => setData((p) => ({ ...p, projects: [...p.projects, { id: safeId("project"), name: "", link: "", bullets: [] }] }))}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
          >
            <Plus size={16} /> Add project
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {data.projects.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No projects added yet. Click Add project to add a heading first.</div>
          )}

          {data.projects.map((project, projectIndex) => (
            <div key={project.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-black text-ink">Project {projectIndex + 1}</h3>
                <button
                  onClick={() => setData((p) => ({ ...p, projects: p.projects.filter((item) => item.id !== project.id) }))}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50"
                  aria-label="Remove project"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Project heading"
                  value={project.name}
                  onChange={(v) => setData((p) => ({ ...p, projects: p.projects.map((item) => item.id === project.id ? { ...item, name: v } : item) }))}
                  placeholder="Portfolio Website"
                />
                <Field
                  label="Project link (optional)"
                  value={project.link}
                  onChange={(v) => setData((p) => ({ ...p, projects: p.projects.map((item) => item.id === project.id ? { ...item, link: v } : item) }))}
                  placeholder="github.com/username/project"
                />
              </div>

              <div className="mt-4 space-y-3">
                {project.bullets.map((line, lineIndex) => (
                  <Field
                    key={`${project.id}-line-${lineIndex}`}
                    label={`Explanatory line ${lineIndex + 1}`}
                    value={line}
                    onChange={(v) => setData((p) => ({
                      ...p,
                      projects: p.projects.map((item) => item.id === project.id
                        ? { ...item, bullets: item.bullets.map((bullet, idx) => idx === lineIndex ? v : bullet) }
                        : item)
                    }))}
                    placeholder="Built a responsive website using React and Tailwind CSS."
                  />
                ))}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setData((p) => ({ ...p, projects: p.projects.map((item) => item.id === project.id ? { ...item, bullets: [...item.bullets, ""] } : item) }))}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                  >
                    <Plus size={16} /> Add optional explanation
                  </button>
                  {project.bullets.length > 0 && (
                    <button
                      onClick={() => setData((p) => ({ ...p, projects: p.projects.map((item) => item.id === project.id ? { ...item, bullets: item.bullets.slice(0, -1) } : item) }))}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-red-600 ring-1 ring-red-100"
                    >
                      <Trash2 size={16} /> Remove last line
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    <div key="customize" className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-black text-ink">Layout flexibility</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">Choose a template and control optional content. Blank fields are never forced into the final resume.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Template</span>
            <select value={template} onChange={(event) => setTemplate(event.target.value as TemplateId)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              {templates.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.tone}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Content spacing</span>
            <select value={settings.density} onChange={(event) => updateSettings({ density: event.target.value as ResumeSettings["density"] })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact — fit more content</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Resume text size</span>
            <select value={settings.textScale} onChange={(event) => updateSettings({ textScale: event.target.value as ResumeSettings["textScale"] })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
          <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-slate-700">
            <b>Headline is optional:</b> leave the field blank or turn it off. Essential, Ledger, Vertex, Chronicle, Signal, and Minimal are designed to remain balanced without one.
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ToggleRow label="Show professional headline" description="When off, the header begins directly with your name." checked={settings.showHeadline} onChange={(checked) => updateSettings({ showHeadline: checked })} />
        <ToggleRow label="Show profile picture" description="Only applies to photo-friendly templates." checked={settings.showPhoto} onChange={(checked) => updateSettings({ showPhoto: checked })} />
        {sectionOptions.map((option) => {
          const settingKey = `show${option.key[0].toUpperCase()}${option.key.slice(1)}` as keyof ResumeSettings;
          return (
            <ToggleRow
              key={option.key}
              label={`Show ${option.label.toLowerCase()}`}
              description={option.description}
              checked={Boolean(settings[settingKey])}
              onChange={(checked) => updateSettings({ [settingKey]: checked })}
            />
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="font-black text-ink">Rename section headings</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Examples: Profile, Work History, Academic Background, Selected Projects, Core Skills.</p>
          </div>
          <button onClick={() => updateSettings({ sectionTitles: undefined })} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Reset names</button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sectionOptions.map((option) => (
            <Field key={option.key} label={option.label} value={settings.sectionTitles[option.key]} onChange={(value) => updateSectionTitle(option.key, value)} />
          ))}
        </div>
      </div>
    </div>,
    <div key="final" className="space-y-6">
      <AtsReportView report={report} />
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="font-black text-ink">Plain text ATS preview</h3>
            <p className="mt-1 text-sm text-slate-500">This text view shows how parsers can read the resume content.</p>
          </div>
          <button onClick={downloadTextFile} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">Download TXT</button>
        </div>
        <textarea readOnly value={plainText} className="mt-3 h-44 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5" />
      </div>
    </div>
  ];

  return (
    <main className="mx-auto w-full max-w-[1700px] overflow-x-hidden px-3 py-6 sm:px-4 sm:py-8 md:px-6">
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 no-print sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 sm:p-5">
          <p className="text-sm font-bold text-brand-600">Free ATS resume studio</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">Build, score, save, and export without payment</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use cloud saving for your account, text-based PDF print export for ATS readability, plus image export when you need previews.</p>
        </div>
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-bold text-slate-500">Current ATS rank</p>
          <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-black text-ink">{report.score}</span><span className="pb-1 text-sm font-bold text-slate-500">/100 · {report.rank}</span></div>
          <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${report.score}%` }} /></div>
        </div>
        <button onClick={boostResume} className="min-w-0 rounded-3xl bg-ink p-4 text-left text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow sm:p-5">
          <Wand2 className="text-mint" />
          <p className="mt-4 font-black">ATS Boost</p>
          <p className="mt-1 text-xs leading-5 text-sky-100">Fill empty areas with editable keyword and achievement examples.</p>
        </button>
      </div>


      <div className="no-print mb-8 rounded-[2rem] border border-brand-100 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-brand-600">Prefer voice or AI commands?</p>
            <h2 className="text-2xl font-black text-ink">Use the separate AI Generator instead of the manual builder.</h2>
            <p className="mt-1 text-sm text-slate-600">Speak or type commands and watch the resume preview update on a dedicated AI page.</p>
          </div>
          <Link href={resumeId ? `/generate-ai?resumeId=${resumeId}` : "/generate-ai"} className="shimmer-button inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5">
            <Sparkles size={18} /> Generate with AI
          </Link>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(430px,640px)_minmax(420px,1fr)] xl:gap-8 2xl:grid-cols-[minmax(520px,700px)_minmax(520px,1fr)]">
        <section className="no-print min-w-0 rounded-[2rem] border border-slate-200 bg-white/90 p-3 shadow-soft backdrop-blur sm:p-5 xl:order-1">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-brand-600">Step-by-step builder</p>
              <h2 className="text-2xl font-black text-ink sm:text-3xl">Create ATS resume</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setResumeId(null); setData(cloneResume(emptyResume)); router.replace("/builder"); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">Start empty</button>
              <button onClick={() => { setResumeId(null); setData(cloneResume(demoResume)); router.replace("/builder"); }} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600">Load demo</button>
            </div>
          </div>

          {cloudNotice && <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-900">{cloudNotice}</div>}

          <div className="mt-6 flex gap-2 overflow-auto no-scrollbar">
            {steps.map((label, idx) => (
              <button key={label} onClick={() => setStep(idx)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${step === idx ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{idx + 1}. {label}</button>
            ))}
          </div>

          <div className="mt-6 min-w-0 rounded-3xl bg-slate-50 p-3 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.25 }}>
                {stepBody[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 font-bold disabled:opacity-40 sm:w-auto"><ArrowLeft size={18} /> Back</button>
            <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2 xl:flex xl:flex-wrap">
              <button onClick={() => void saveToCloud()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60 sm:w-auto">{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Cloud</button>
              <button onClick={printResume} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 font-bold text-white sm:w-auto"><Download size={18} /> ATS PDF</button>
              <button onClick={downloadTextFile} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-bold text-white sm:w-auto"><FileText size={18} /> TXT</button>
              <button onClick={() => void downloadImage("png")} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-800 px-5 py-3 font-bold text-white sm:w-auto"><FileImage size={18} /> PNG</button>
              <button onClick={() => void downloadImage("jpg")} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-700 px-5 py-3 font-bold text-white sm:w-auto"><FileImage size={18} /> JPG</button>
              <button disabled={step === steps.length - 1} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 font-bold disabled:opacity-40 sm:w-auto">Next <ArrowRight size={18} /></button>
            </div>
          </div>
        </section>

        <aside className="w-full min-w-0 self-start xl:order-2">
          <div>
            <div className="no-print mb-4 min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-black text-ink"><Sparkles className="text-brand-600" /> Live template preview</div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Responsive preview · {Math.round(previewFit.scale * 100)}% zoom</p>
                </div>
                <select value={template} onChange={(e) => setTemplate(e.target.value as TemplateId)} className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold sm:w-auto">
                  {templates.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.tone}</option>)}
                </select>
              </div>
              <div className="mt-3 flex gap-2 overflow-auto no-scrollbar">
                {templates.map((item) => (
                  <button key={item.id} onClick={() => setTemplate(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${template === item.id ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.name}</button>
                ))}
              </div>
            </div>
            <div ref={previewStageRef} id="resume-print-stage" className="flex min-h-[360px] w-full max-w-full items-start justify-center overflow-auto overscroll-contain rounded-[2rem] bg-slate-200/50 p-2 no-scrollbar print-stage sm:min-h-[520px] sm:p-4 xl:h-[calc(100vh-250px)]">
              <motion.div
                id="resume-print-scale"
                key={JSON.stringify(data).slice(0, 80) + template}
                initial={{ opacity: 0.86 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="resume-preview-shell"
                style={{ width: `${previewFit.width * previewFit.scale}px`, height: `${previewFit.height * previewFit.scale}px` }}
              >
                <div
                  className="resume-preview-scale origin-top-left"
                  style={{ width: `${previewFit.width}px`, minHeight: `${previewFit.height}px`, transform: `scale(${previewFit.scale})`, transformOrigin: "top left" }}
                >
                  <ResumePreview data={data} template={template} previewId="resume-preview" />
                </div>
              </motion.div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
