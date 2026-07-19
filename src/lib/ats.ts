import { ResumeData, resumeToPlainText } from "./resume";

export type AtsIssue = {
  type: "critical" | "warning" | "success";
  title: string;
  detail: string;
};

export type AtsReport = {
  score: number;
  rank: "Excellent" | "Strong" | "Average" | "Weak";
  issues: AtsIssue[];
  keywordMatches: string[];
  missingKeywords: string[];
  sectionScores: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    formatting: number;
    keywords: number;
  };
  actionPlan: string[];
};

const defaultKeywords = [
  "leadership",
  "analysis",
  "management",
  "communication",
  "project",
  "strategy",
  "data",
  "customer",
  "process",
  "operations",
  "reporting",
  "collaboration",
  "compliance",
  "budget",
  "forecasting",
  "automation",
  "performance",
  "stakeholder"
];

const badFormattingSignals = [
  "table of contents",
  "references available",
  "curriculum vitae",
  "photo",
  "date of birth",
  "marital status",
  "religion",
  "national id"
];

function tokenize(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

function extractKeywords(jobDescription?: string) {
  if (!jobDescription || jobDescription.trim().length < 30) return defaultKeywords;
  const stop = new Set([
    "and", "the", "for", "with", "you", "our", "are", "will", "this", "that", "from", "have", "has", "your", "about", "into", "using", "work", "team", "role", "candidate", "ability", "experience", "years", "skills"
  ]);
  const counts = new Map<string, number>();
  jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stop.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([word]) => word);
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function analyzeTextResume(resumeText: string, jobDescription?: string): AtsReport {
  const text = resumeText || "";
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const jobKeywords = extractKeywords(jobDescription);
  const keywordMatches = jobKeywords.filter((keyword) => tokens.has(keyword.toLowerCase()) || lower.includes(keyword.toLowerCase()));
  const missingKeywords = jobKeywords.filter((keyword) => !keywordMatches.includes(keyword)).slice(0, 12);

  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLocation = /(new york|remote|pakistan|united states|canada|london|texas|california|ny|tx|ca|city|karachi|lahore|islamabad|rawalpindi|peshawar)/i.test(text);
  const contact = clamp((hasEmail ? 40 : 0) + (hasPhone ? 35 : 0) + (hasLocation ? 25 : 0));

  const hasSummary = /(summary|profile|professional summary)/i.test(text) && text.length > 250;
  const summary = clamp(hasSummary ? 90 : text.length > 180 ? 55 : 20);

  const hasExperience = /(experience|employment|work history|professional experience)/i.test(text);
  const hasBullets = /[•\-]\s+.{20,}/.test(text) || /\n\s*\*\s+/.test(text);
  const quantified = (text.match(/\b\d+%|\$\d+|\d+\+|\b\d{2,}\b/g) || []).length;
  const actionWords = (lower.match(/\b(led|built|created|improved|reduced|increased|managed|delivered|designed|implemented|analyzed|developed|launched|optimized|automated)\b/g) || []).length;
  const experience = clamp((hasExperience ? 35 : 0) + (hasBullets ? 25 : 0) + Math.min(25, quantified * 5) + Math.min(15, actionWords * 2));

  const education = clamp(/(education|university|college|bachelor|master|degree|diploma|certification)/i.test(text) ? 90 : 35);
  const skills = clamp(/(skills|technical skills|tools|technologies)/i.test(text) ? 85 : keywordMatches.length * 4);

  const badSignals = badFormattingSignals.filter((signal) => lower.includes(signal));
  const hasLongParagraph = text.split(/\n+/).some((line) => line.length > 350);
  const formatting = clamp(100 - badSignals.length * 12 - (hasLongParagraph ? 12 : 0) - (text.length < 600 ? 20 : 0));

  const keywordScore = clamp((keywordMatches.length / Math.max(jobKeywords.length, 1)) * 100);

  const score = clamp(
    contact * 0.12 +
      summary * 0.12 +
      experience * 0.25 +
      education * 0.1 +
      skills * 0.12 +
      formatting * 0.12 +
      keywordScore * 0.17
  );

  const issues: AtsIssue[] = [];
  if (!hasEmail || !hasPhone) {
    issues.push({ type: "critical", title: "Missing contact information", detail: "ATS systems and recruiters need a clear email and phone number near the top." });
  } else {
    issues.push({ type: "success", title: "Contact details detected", detail: "Email and phone number are present." });
  }
  if (!hasExperience) issues.push({ type: "critical", title: "Experience section not clear", detail: "Add a section titled Experience or Professional Experience." });
  if (!hasBullets) issues.push({ type: "warning", title: "Bullet points need improvement", detail: "Use short bullet points under each role instead of long paragraphs." });
  if (quantified < 3) issues.push({ type: "warning", title: "Add measurable achievements", detail: "Use numbers such as %, $, time saved, customers served, or volume handled." });
  if (keywordScore < 55) issues.push({ type: "warning", title: "Low keyword match", detail: "Your resume does not include enough role-specific keywords from the job description." });
  if (badSignals.length) issues.push({ type: "warning", title: "Remove non-ATS information", detail: `Avoid: ${badSignals.join(", ")}.` });
  if (formatting > 80) issues.push({ type: "success", title: "Formatting looks ATS-friendly", detail: "The resume appears mostly text-based and easy to parse." });

  const actionPlan = [
    !hasSummary ? "Add a 3-4 line professional summary with target role keywords." : "Tighten the summary with the exact job title and 2-3 core skills.",
    quantified < 3 ? "Rewrite at least 4 bullets with measurable results." : "Keep quantified achievements visible in the first half of the resume.",
    missingKeywords.length ? `Add missing keywords naturally: ${missingKeywords.slice(0, 6).join(", ")}.` : "Keyword coverage is strong; keep wording natural.",
    !/(skills|technical skills|tools|technologies)/i.test(text) ? "Add a dedicated Skills section with tools, technologies, and domain skills." : "Group skills by category if the list is long."
  ];

  return {
    score,
    rank: score >= 88 ? "Excellent" : score >= 74 ? "Strong" : score >= 58 ? "Average" : "Weak",
    issues,
    keywordMatches,
    missingKeywords,
    sectionScores: { contact, summary, experience, education, skills, formatting, keywords: keywordScore },
    actionPlan
  };
}

export function analyzeResumeData(data: ResumeData, jobDescription?: string) {
  return analyzeTextResume(resumeToPlainText(data), jobDescription);
}
