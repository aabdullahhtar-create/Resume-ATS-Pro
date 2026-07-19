"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Search, Sparkles, X } from "lucide-react";
import { emptyResume, ResumeData, safeId } from "@/lib/resume";
import { analyzeTextResume } from "@/lib/ats";

type Props = { open: boolean; onClose: () => void };
type SectionKey = "summary" | "experience" | "education" | "skills" | "projects" | "certifications";

type ParsedSection = { key: SectionKey; index: number };
type RawEntry = { header: string[]; bullets: string[] };

const monthPattern = "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
const dateRangeRegex = new RegExp(`(?:${monthPattern}\\.?\\s*)?\\b(?:19|20)\\d{2}\\b\\s*(?:-|–|—|to|through)\\s*(?:(?:${monthPattern}\\.?\\s*)?\\b(?:19|20)\\d{2}\\b|present|current|now)|\\b(?:${monthPattern})\\.?\\s+\\b(?:19|20)\\d{2}\\b|\\b(?:19|20)\\d{2}\\b`, "i");

function cleanLine(line: string) {
  return line
    .replace(/\u0000/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/^[•·▪■●○◆]\s*/, "• ")
    .trim();
}

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\b(PROFESSIONAL SUMMARY|SUMMARY|PROFILE|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|EDUCATION|ACADEMIC BACKGROUND|TECHNICAL SKILLS|CORE SKILLS|SKILLS|PROJECTS|CERTIFICATIONS|CERTIFICATES|LICENSES)\b/g, "\n$1\n")
    .replace(/[•·▪■●○◆]/g, "\n• ")
    .replace(/\s+\|\s+/g, " | ")
    .replace(/\n{3,}/g, "\n\n");
}

function isBulletLine(line: string) {
  return /^[•\-*–—]\s+/.test(line.trim());
}

function cleanBullet(line: string) {
  return cleanLine(line).replace(/^[•\-*–—]\s*/, "").trim();
}

function hasDate(line: string) {
  return dateRangeRegex.test(line);
}

function extractDates(line: string) {
  const match = line.match(dateRangeRegex)?.[0] || "";
  if (!match) return { start: "", end: "" };
  const parts = match.split(/\s*(?:-|–|—|to|through)\s*/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return { start: parts[0], end: parts.slice(1).join(" - ") };
  return { start: parts[0] || match, end: "" };
}

function removeDates(line: string) {
  return cleanLine(line.replace(dateRangeRegex, "").replace(/\s*\|\s*\|\s*/g, " | "));
}

function lineToSection(line: string): SectionKey | null {
  const cleaned = cleanLine(line)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[.:#\-–—]/g, " ")
    .replace(/[^a-z0-9/ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length > 72) return null;
  if (/^(professional )?(summary|profile|objective|career objective|about me|personal profile)$/.test(cleaned)) return "summary";
  if (/^(professional |work |relevant |career )?(experience|employment|employment history|work history|career history|internship|internships)$/.test(cleaned)) return "experience";
  if (/^(education|academic background|academic qualifications?|qualifications?|educational background)$/.test(cleaned)) return "education";
  if (/^(skills|technical skills|core skills|core competencies|competencies|technologies|tools|expertise|areas of expertise|computer skills)$/.test(cleaned)) return "skills";
  if (/^(projects|academic projects|personal projects|key projects|selected projects|relevant projects|portfolio projects)$/.test(cleaned)) return "projects";
  if (/^(certifications?|certificates?|licenses?|licences?|credentials|training|professional development|awards and certifications?)$/.test(cleaned)) return "certifications";
  return null;
}

function findSections(lines: string[]) {
  const sectionMarks = lines
    .map((line, index): ParsedSection | null => {
      const key = lineToSection(line);
      return key ? { key, index } : null;
    })
    .filter(Boolean) as ParsedSection[];

  const sections: Record<SectionKey, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  };

  sectionMarks.forEach((section, idx) => {
    const nextIndex = sectionMarks[idx + 1]?.index ?? lines.length;
    sections[section.key].push(...lines.slice(section.index + 1, nextIndex));
  });

  return { sectionMarks, sections };
}

function isContactLine(line: string) {
  return /@|linkedin\.com|github\.com|https?:\/\/|www\.|\+?\d[\d\s().-]{7,}\d/i.test(line);
}

function isLikelyNameLine(line: string) {
  const clean = cleanLine(line);
  if (!clean || clean.length > 60) return false;
  if (isContactLine(clean) || lineToSection(clean)) return false;
  if (/\d/.test(clean)) return false;
  if (/^(resume|curriculum vitae|cv|phone|email|address|portfolio)$/i.test(clean)) return false;
  return clean.split(/\s+/).length <= 6;
}

function parseBasics(text: string, lines: string[], firstSectionIndex: number) {
  const topLines = lines.slice(0, Math.max(firstSectionIndex, 0));
  const nameCandidates = topLines.filter(isLikelyNameLine);
  const name = nameCandidates[0] || "";
  const title = nameCandidates.find((line) => line !== name && line.length <= 80) || "";
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/\+?\d[\d\s().-]{7,}\d/)?.[0]?.trim() || "";
  const linkedIn = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,;)]+/i)?.[0] || "";
  const github = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,;)]+/i)?.[0] || "";
  const urls = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s,;)]*)?/gi) || [];
  const website = urls.find((url) => !/linkedin\.com|github\.com/i.test(url) && !url.includes("@")) || "";
  const location = topLines.find((line) =>
    !isContactLine(line) &&
    line !== name &&
    line !== title &&
    /,|pakistan|usa|united states|uk|uae|canada|australia|india|city|ny|ca|tx|ma/i.test(line) &&
    line.length <= 80
  ) || "";

  return { name, title, email, phone, location, website, linkedin: linkedIn, github, photo: "" };
}

function getSummary(sections: Record<SectionKey, string[]>, lines: string[], firstSectionIndex: number) {
  const sectionSummary = sections.summary.filter((line) => !isContactLine(line) && !lineToSection(line)).join(" ");
  if (sectionSummary.trim()) return sectionSummary.trim().slice(0, 900);

  return lines
    .slice(0, Math.min(firstSectionIndex >= 0 ? firstSectionIndex : 8, 8))
    .filter((line) => !isLikelyNameLine(line) && !isContactLine(line) && !lineToSection(line))
    .join(" ")
    .slice(0, 900);
}

function removeInlineLabel(line: string) {
  return cleanLine(line.replace(/^(skills|technical skills|core competencies|certifications?|certificates?|projects?|tools|technologies)\s*[:\-–—]\s*/i, ""));
}

function uniqueItems(items: string[]) {
  return [...new Set(items.map((item) => item.replace(/\s+/g, " ").trim()).filter(Boolean))];
}

function parseSkills(lines: string[]) {
  const items = lines.flatMap((line) =>
    removeInlineLabel(line)
      .replace(/^•\s*/, "")
      .split(/[,;|•\n]+/)
      .map((item) => item.trim())
  );

  return uniqueItems(items)
    .filter((item) => item.length > 1 && item.length <= 45 && !lineToSection(item))
    .slice(0, 40);
}

function parseCertifications(lines: string[]) {
  const items: string[] = [];

  lines.forEach((line) => {
    const cleaned = removeInlineLabel(cleanBullet(line));
    if (!cleaned || lineToSection(cleaned)) return;

    const shouldSplitCommas = cleaned.includes(",") && !/\b(?:19|20)\d{2}\b|issued|expires|valid/i.test(cleaned);
    const parts = shouldSplitCommas ? cleaned.split(/[,;|•]+/) : cleaned.split(/[;|•]+/);
    parts.map((part) => part.trim()).filter(Boolean).forEach((part) => items.push(part));
  });

  return uniqueItems(items).filter((item) => item.length > 1).slice(0, 20);
}

function parseRawEntries(lines: string[]) {
  const entries: RawEntry[] = [];
  let current: RawEntry | undefined;

  lines.forEach((line, index) => {
    const cleaned = cleanLine(line);
    if (!cleaned || lineToSection(cleaned)) return;

    const previous = lines[index - 1] || "";
    const next = lines[index + 1] || "";
    const looksLikeBullet = isBulletLine(cleaned) || (!!current && /^(achieved|administered|analyzed|assisted|built|collaborated|conducted|coordinated|created|delivered|designed|developed|diagnosed|documented|implemented|improved|increased|installed|led|managed|maintained|monitored|operated|performed|prepared|provided|reduced|resolved|supported|tested|trained|troubleshot|worked)\b/i.test(cleaned));
    const shouldStartNew = !current || current.bullets.length > 0 || hasDate(cleaned) || hasDate(next) || (hasDate(previous) && current.header.length >= 2);

    if (looksLikeBullet) {
      if (!current) current = { header: [], bullets: [] };
      current.bullets.push(cleanBullet(cleaned));
      return;
    }

    if (shouldStartNew) {
      if (current && (current.header.length || current.bullets.length)) entries.push(current);
      current = { header: [cleaned], bullets: [] };
    } else if (current) {
      if (current.header.length < 4) current.header.push(cleaned);
      else current.bullets.push(cleaned);
    }
  });

  if (current && (current.header.length || current.bullets.length)) entries.push(current);
  return entries;
}

function parseExperience(lines: string[]): ResumeData["experience"] {
  const roleWords = /engineer|developer|manager|analyst|assistant|officer|intern|specialist|technician|teacher|designer|consultant|operator|supervisor|lead|coordinator|representative|associate|trainee|physicist|doctor|nurse|accountant|marketing|sales|service|support|administrator|director|executive/i;
  const orgWords = /inc\.?|ltd\.?|llc|company|corp\.?|corporation|hospital|university|school|college|institute|center|centre|technolog|systems|solutions|labs|agency|bank|clinic|pvt|limited|group|services|studio|foundation/i;

  return parseRawEntries(lines).map((entry, index) => {
    const header = entry.header.join(" | ");
    const dates = extractDates(header);
    const withoutDates = removeDates(header);
    const parts = withoutDates
      .split(/\s+(?:at|@)\s+|\s*[|•]\s+|\s+[–—]\s+/i)
      .map((part) => cleanLine(part))
      .filter(Boolean);

    let role = "";
    let company = "";
    let location = "";

    if (entry.header.length >= 2) {
      const headerLines = entry.header.map(removeDates).filter(Boolean);
      const first = headerLines[0] || "";
      const second = headerLines[1] || "";
      if (orgWords.test(first) && roleWords.test(second)) {
        company = first;
        role = second;
      } else {
        role = roleWords.test(first) ? first : (parts.find((part) => roleWords.test(part)) || first);
        company = parts.find((part) => part !== role && orgWords.test(part)) || (second !== role ? second : "");
      }
      location = headerLines.find((part) => part !== role && part !== company && /,/.test(part)) || "";
    } else {
      role = parts.find((part) => roleWords.test(part)) || parts[0] || "";
      company = parts.find((part) => part !== role && orgWords.test(part)) || parts.find((part) => part !== role && !/,/.test(part)) || "";
      location = parts.find((part) => part !== role && part !== company && /,/.test(part)) || "";
    }

    return {
      id: safeId(`exp-${index + 1}`),
      company,
      role,
      location,
      start: dates.start,
      end: dates.end,
      bullets: uniqueItems(entry.bullets).slice(0, 8)
    };
  }).filter((entry) => entry.role || entry.company || entry.bullets.length);
}

function parseEducation(lines: string[]): ResumeData["education"] {
  const schoolRegex = /university|college|school|institute|academy|campus|faculty|polytechnic/i;
  const degreeRegex = /bachelor|master|ph\.?d|doctor|bs\b|bsc\b|b\.sc|ms\b|msc\b|m\.sc|mba\b|associate|diploma|certificate|degree|matric|intermediate|fsc|ics/i;
  const cleaned = lines.map((line) => cleanBullet(line)).filter((line) => line && !lineToSection(line));
  if (!cleaned.length) return [];

  const chunks: string[][] = [];
  let current: string[] = [];

  cleaned.forEach((line) => {
    const startsNew = current.length >= 3 && (schoolRegex.test(line) || degreeRegex.test(line));
    if (startsNew) {
      chunks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  });
  if (current.length) chunks.push(current);

  return chunks.slice(0, 5).map((chunk, index) => {
    const joined = chunk.join(" | ");
    const dates = extractDates(joined);
    const school = chunk.find((line) => schoolRegex.test(line)) || "";
    const degree = chunk.find((line) => degreeRegex.test(line) && line !== school) || (school ? "" : chunk[0] || "");
    const location = chunk.find((line) => line !== school && line !== degree && /,/.test(line) && !hasDate(line)) || "";
    const details = chunk
      .filter((line) => line !== school && line !== degree && line !== location)
      .map(removeDates)
      .filter(Boolean)
      .join("; ");

    return {
      id: safeId(`edu-${index + 1}`),
      school,
      degree,
      location,
      start: dates.start,
      end: dates.end,
      details
    };
  }).filter((entry) => entry.school || entry.degree || entry.details);
}

function parseProjects(lines: string[]): ResumeData["projects"] {
  const entries = parseRawEntries(lines);

  return entries.map((entry, index) => {
    const header = entry.header.join(" | ");
    const link = header.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s,;)]*)?/i)?.[0] || "";
    const name = cleanLine(header.replace(link, "").split(/[|•]/)[0] || header.replace(link, ""));
    const extraHeaderLines = entry.header.slice(1).map((line) => cleanLine(line.replace(link, ""))).filter(Boolean);

    return {
      id: safeId(`project-${index + 1}`),
      name,
      link,
      bullets: uniqueItems([...extraHeaderLines, ...entry.bullets]).slice(0, 6)
    };
  }).filter((project) => project.name || project.bullets.length);
}

function parseResumeText(text: string): ResumeData {
  const normalizedText = normalizeResumeText(text);
  const lines = normalizedText.split(/\n+/).map(cleanLine).filter(Boolean);
  const { sectionMarks, sections } = findSections(lines);
  const firstSectionIndex = sectionMarks[0]?.index ?? Math.min(lines.length, 8);

  const resume = JSON.parse(JSON.stringify(emptyResume)) as ResumeData;
  resume.basics = parseBasics(normalizedText, lines, firstSectionIndex);
  resume.summary = getSummary(sections, lines, firstSectionIndex);

  const experience = parseExperience(sections.experience);
  const education = parseEducation(sections.education);
  const projects = parseProjects(sections.projects);
  const skills = parseSkills(sections.skills);
  const certifications = parseCertifications(sections.certifications);

  if (experience.length) resume.experience = experience;
  if (education.length) resume.education = education;
  resume.projects = projects;
  resume.skills = skills;
  resume.certifications = certifications;

  return resume;
}

export default function UploadResumeModal({ open, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const report = useMemo(() => (text ? analyzeTextResume(text) : null), [text]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  async function upload(file: File) {
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
      const data = await res.json();
      if (res.status === 401) {
        onClose();
        router.push(`/login?next=${encodeURIComponent("/builder")}`);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setText(data.text);
      localStorage.setItem("uploaded-resume-text", data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function createWithData() {
    const parsed = parseResumeText(text);
    localStorage.setItem("resume-data", JSON.stringify(parsed));
    onClose();
    router.push("/builder?source=upload");
  }

  function findMistakes() {
    localStorage.setItem("uploaded-resume-text", text);
    onClose();
    router.push("/ats-checker?source=upload");
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="mx-auto my-4 flex min-h-[calc(100vh-2rem)] w-full max-w-3xl items-center justify-center sm:my-6 sm:min-h-[calc(100vh-3rem)]">
      <div className="relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto overscroll-contain rounded-[2rem] bg-white p-4 shadow-soft sm:max-h-[calc(100vh-3rem)] sm:p-6">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-500 hover:bg-slate-100"><X /></button>
        <div className="pr-12">
          <p className="font-bold text-brand-600">Upload resume</p>
          <h2 className="mt-1 text-3xl font-black text-ink">Use your current resume or find mistakes.</h2>
          <p className="mt-2 text-sm text-slate-600">Upload PDF, DOCX, or TXT. After extraction, choose the next action.</p>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center transition hover:border-brand-500 hover:bg-brand-50/40">
          <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          {loading ? <Loader2 className="animate-spin text-brand-600" size={38} /> : <FileUp className="text-brand-600" size={42} />}
          <span className="mt-3 font-black text-ink">Click to upload resume</span>
          <span className="mt-1 text-sm text-slate-500">PDF, DOCX, TXT supported</span>
        </label>

        {error && <div className="mt-4 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700"><AlertTriangle size={18} /> {error}</div>}

        {text && report && (
          <div className="mt-6 grid gap-4 md:grid-cols-[.7fr_1.3fr]">
            <div className="rounded-3xl bg-ink p-5 text-white">
              <p className="text-sm text-sky-100">Current ATS rank</p>
              <p className="mt-2 text-5xl font-black">{report.score}</p>
              <p className="font-bold text-mint">{report.rank}</p>
              <p className="mt-4 text-xs leading-5 text-sky-100">This score is generated from the extracted resume text. Use it to improve before downloading.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="font-black text-ink">Choose what to do next</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button onClick={createWithData} className="rounded-2xl bg-brand-600 p-4 text-left font-bold text-white transition hover:-translate-y-0.5">
                  <Sparkles className="mb-3" /> Create ATS resume with current data
                </button>
                <button onClick={findMistakes} className="rounded-2xl border border-slate-200 bg-white p-4 text-left font-bold text-ink transition hover:-translate-y-0.5 hover:shadow-md">
                  <Search className="mb-3 text-brand-600" /> Find mistakes in current resume
                </button>
              </div>
              <div className="mt-4 max-h-28 overflow-auto rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 no-scrollbar">{text.slice(0, 1200)}...</div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
