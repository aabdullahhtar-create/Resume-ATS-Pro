import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cloneResume, ResumeData, safeId } from "@/lib/resume";

export const runtime = "nodejs";

type VoiceResumeResult = {
  updatedResume: ResumeData;
  changes: string[];
  questions?: string[];
  confidence?: "high" | "medium" | "low";
  mode?: "ai" | "fallback";
};

function unauthorized() {
  return NextResponse.json({ error: "Please log in first before using the AI Resume Generator." }, { status: 401 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item).trim()).filter(Boolean);
}

function normalizeResume(input: unknown): ResumeData {
  const source = isRecord(input) ? input : {};
  const basics = isRecord(source.basics) ? source.basics : {};
  const experience = Array.isArray(source.experience) ? source.experience : [];
  const education = Array.isArray(source.education) ? source.education : [];
  const projects = Array.isArray(source.projects) ? source.projects : [];
  const settings = isRecord(source.settings) ? source.settings : {};
  const sectionTitles = isRecord(settings.sectionTitles) ? settings.sectionTitles : {};
  const asOptionalBoolean = (value: unknown) => typeof value === "boolean" ? value : undefined;

  return {
    basics: {
      name: asString(basics.name) || "Abdullah Akhtar",
      title: asString(basics.title),
      email: asString(basics.email),
      phone: asString(basics.phone),
      location: asString(basics.location),
      website: asString(basics.website),
      linkedin: asString(basics.linkedin),
      github: asString(basics.github),
      photo: asString(basics.photo)
    },
    summary: asString(source.summary),
    experience: experience.map((item, index) => {
      const exp = isRecord(item) ? item : {};
      return {
        id: asString(exp.id) || safeId(`exp-${index}`),
        company: asString(exp.company),
        role: asString(exp.role),
        location: asString(exp.location),
        start: asString(exp.start),
        end: asString(exp.end),
        bullets: asStringArray(exp.bullets).length ? asStringArray(exp.bullets) : [""]
      };
    }).slice(0, 10),
    education: education.map((item, index) => {
      const edu = isRecord(item) ? item : {};
      return {
        id: asString(edu.id) || safeId(`edu-${index}`),
        school: asString(edu.school),
        degree: asString(edu.degree),
        location: asString(edu.location),
        start: asString(edu.start),
        end: asString(edu.end),
        details: asString(edu.details)
      };
    }).slice(0, 8),
    projects: projects.map((item, index) => {
      const project = isRecord(item) ? item : {};
      return {
        id: asString(project.id) || safeId(`project-${index}`),
        name: asString(project.name),
        link: asString(project.link),
        bullets: asStringArray(project.bullets).length ? asStringArray(project.bullets) : []
      };
    }).slice(0, 10),
    skills: asStringArray(source.skills).slice(0, 80),
    certifications: asStringArray(source.certifications).slice(0, 30),
    settings: {
      showHeadline: asOptionalBoolean(settings.showHeadline),
      showSummary: asOptionalBoolean(settings.showSummary),
      showExperience: asOptionalBoolean(settings.showExperience),
      showEducation: asOptionalBoolean(settings.showEducation),
      showProjects: asOptionalBoolean(settings.showProjects),
      showSkills: asOptionalBoolean(settings.showSkills),
      showCertifications: asOptionalBoolean(settings.showCertifications),
      showPhoto: asOptionalBoolean(settings.showPhoto),
      density: settings.density === "compact" ? "compact" : "comfortable",
      textScale: settings.textScale === "small" || settings.textScale === "large" ? settings.textScale : "medium",
      sectionTitles: {
        summary: asString(sectionTitles.summary) || undefined,
        experience: asString(sectionTitles.experience) || undefined,
        education: asString(sectionTitles.education) || undefined,
        projects: asString(sectionTitles.projects) || undefined,
        skills: asString(sectionTitles.skills) || undefined,
        certifications: asString(sectionTitles.certifications) || undefined
      }
    }
  };
}

function splitList(value: string) {
  return value
    .replace(/\band\b/gi, ",")
    .replace(/\bplus\b/gi, ",")
    .split(/,|;|\n/)
    .map((item) => item.trim().replace(/^[+\-•\s]+/, ""))
    .filter(Boolean)
    .slice(0, 20);
}

function unique(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const clean = item.trim();
    if (!clean) return false;
    const key = clean.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractAfter(text: string, phrases: string[]) {
  const lower = text.toLowerCase();
  for (const phrase of phrases) {
    const index = lower.indexOf(phrase);
    if (index >= 0) return text.slice(index + phrase.length).trim().replace(/^[:\-\s]+/, "");
  }
  return "";
}

function replaceEverywhere(resume: ResumeData, from: string, to: string) {
  const source = from.trim();
  const replacement = to.trim();
  if (!source || !replacement) return resume;
  const pattern = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const replaceText = (value: string) => value.replace(pattern, replacement);
  return {
    ...resume,
    basics: {
      ...resume.basics,
      title: replaceText(resume.basics.title),
      website: replaceText(resume.basics.website),
      linkedin: replaceText(resume.basics.linkedin),
      github: replaceText(resume.basics.github)
    },
    summary: replaceText(resume.summary),
    skills: resume.skills.map((skill) => replaceText(skill)),
    certifications: resume.certifications.map((cert) => replaceText(cert)),
    experience: resume.experience.map((exp) => ({
      ...exp,
      company: replaceText(exp.company),
      role: replaceText(exp.role),
      location: replaceText(exp.location),
      bullets: exp.bullets.map((bullet) => replaceText(bullet))
    })),
    education: resume.education.map((edu) => ({
      ...edu,
      school: replaceText(edu.school),
      degree: replaceText(edu.degree),
      location: replaceText(edu.location),
      details: replaceText(edu.details)
    })),
    projects: resume.projects.map((project) => ({
      ...project,
      name: replaceText(project.name),
      link: replaceText(project.link),
      bullets: project.bullets.map((bullet) => replaceText(bullet))
    }))
  };
}

function fallbackEditor(current: ResumeData, transcript: string): VoiceResumeResult {
  let next = cloneResume(current);
  const lower = transcript.toLowerCase();
  const changes: string[] = [];
  const questions: string[] = [];

  if (!next.basics.name) {
    next.basics.name = "Abdullah Akhtar";
    changes.push("Added Abdullah Akhtar as the resume name.");
  }

  const basicFieldMap: Array<[keyof ResumeData["basics"], string[]]> = [
    ["name", ["change my name to", "set my name to", "name to"]],
    ["title", ["change my title to", "set my title to", "professional title to", "target role to", "role to", "position to"]],
    ["email", ["change my email to", "set my email to", "email to"]],
    ["phone", ["change my phone to", "set my phone to", "phone to", "number to"]],
    ["location", ["change my location to", "set my location to", "location to"]],
    ["website", ["change my website to", "set my website to", "website to"]],
    ["linkedin", ["change my linkedin to", "set my linkedin to", "linkedin to"]],
    ["github", ["change my github to", "set my github to", "github to"]]
  ];

  for (const [field, phrases] of basicFieldMap) {
    const value = extractAfter(transcript, phrases).replace(/[.?!]$/, "");
    if (value && value.length < 140) {
      next.basics[field] = value;
      changes.push(`Updated ${String(field)}.`);
      break;
    }
  }

  const replaceMatch = transcript.match(/replace\s+(.+?)\s+with\s+(.+?)(?:\.|$)/i);
  if (replaceMatch?.[1] && replaceMatch?.[2]) {
    next = replaceEverywhere(next, replaceMatch[1], replaceMatch[2]);
    changes.push(`Replaced ${replaceMatch[1].trim()} with ${replaceMatch[2].trim()}.`);
  }

  const removeSkillText = extractAfter(transcript, ["remove skills", "remove skill", "delete skills", "delete skill"]);
  if (removeSkillText) {
    const toRemove = splitList(removeSkillText).map((skill) => skill.toLowerCase());
    const before = next.skills.length;
    next.skills = next.skills.filter((skill) => !toRemove.includes(skill.toLowerCase()));
    if (before !== next.skills.length) changes.push(`Removed ${before - next.skills.length} skill${before - next.skills.length === 1 ? "" : "s"}.`);
  }

  const skillText = extractAfter(transcript, ["add skills", "add skill", "include skills", "include skill", "add these skills", "skills"]);
  if (lower.includes("skill") && skillText) {
    const incoming = splitList(skillText.replace(/to my skills?/gi, ""));
    if (incoming.length) {
      next.skills = unique([...next.skills, ...incoming]);
      changes.push(`Added ${incoming.length} skill${incoming.length === 1 ? "" : "s"}.`);
    }
  }

  const targetRole = extractAfter(transcript, ["make it for", "tailor it for", "optimize it for", "for a", "for an"]).replace(/[.?!]$/, "");
  if (targetRole && (lower.includes("tailor") || lower.includes("optimize") || lower.includes("make it for") || lower.includes("summary") || lower.includes("role"))) {
    next.basics.title = targetRole.length < 90 ? targetRole : next.basics.title;
    changes.push("Adjusted the target title/role wording.");
  }

  if (lower.includes("summary") || lower.includes("profile") || lower.includes("about me") || lower.includes("make it for") || lower.includes("tailor")) {
    const role = next.basics.title || next.experience[0]?.role || "Professional";
    const currentSkills = next.skills.slice(0, 6).join(", ") || "communication, analysis, problem solving, and collaboration";
    next.summary = `${role} with hands-on experience in ${currentSkills}. Skilled at turning requirements into practical results, improving workflows, collaborating with stakeholders, and delivering accurate, measurable outcomes in fast-paced environments.`;
    changes.push("Improved the professional summary with clearer ATS-friendly wording.");
  }

  if (lower.includes("rewrite") || lower.includes("improve") || lower.includes("bullet") || lower.includes("stronger")) {
    next.experience = next.experience.map((exp, expIndex) => ({
      ...exp,
      bullets: (exp.bullets.length ? exp.bullets : [""]).map((bullet, bulletIndex) => {
        if (bullet.trim() && !lower.includes("rewrite")) return bullet;
        if (expIndex === 0 && bulletIndex === 0) return `Improved ${exp.role || next.basics.title || "business"} workflows by 20% through structured analysis, stakeholder coordination, and clear documentation.`;
        if (expIndex === 0 && bulletIndex === 1) return "Created reports, tracking tools, or process documentation that reduced manual work and improved team visibility.";
        return bullet.trim() || "Collaborated with cross-functional teams to complete priority tasks on time and support measurable operational improvements.";
      })
    }));
    changes.push("Strengthened experience bullets with action verbs and measurable language.");
  }

  const projectName = extractAfter(transcript, ["add a project called", "add project called", "project called", "add project"]);
  if (projectName && lower.includes("project")) {
    const name = projectName.split(/ with | using | that /i)[0].replace(/[.?!]$/, "").trim();
    next.projects.push({
      id: safeId("project"),
      name: name || "New Project",
      link: "",
      bullets: ["Built a practical project with user-focused features, clear design, and measurable outcomes."]
    });
    changes.push(`Added project: ${name || "New Project"}.`);
  }

  const certText = extractAfter(transcript, ["add certification", "add certificate", "certification", "certificate"]);
  if (certText && (lower.includes("certification") || lower.includes("certificate"))) {
    const certs = splitList(certText);
    if (certs.length) {
      next.certifications = unique([...next.certifications, ...certs]);
      changes.push(`Added ${certs.length} certification${certs.length === 1 ? "" : "s"}.`);
    }
  }

  if (!changes.length) {
    questions.push("I could not confidently understand the instruction. Try: 'Add React and Next.js to skills', 'Rewrite my summary for frontend developer', or 'Replace Java with Python'.");
  }

  return {
    updatedResume: normalizeResume(next),
    changes: changes.length ? changes : ["No safe automatic change was applied."],
    questions,
    confidence: changes.length ? "medium" : "low",
    mode: "fallback"
  };
}

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  };
}

function extractModelText(payload: unknown) {
  if (!isRecord(payload)) return "";
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const first = isRecord(candidates[0]) ? candidates[0] : {};
  const content = isRecord(first.content) ? first.content : {};
  const parts = Array.isArray(content.parts) ? content.parts : [];
  return parts.map((part) => isRecord(part) ? asString(part.text) : "").join("\n").trim();
}

function parseJsonFromModel(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("AI did not return valid JSON.");
  }
}

async function runGeminiEditor(current: ResumeData, transcript: string): Promise<VoiceResumeResult> {
  const config = getGeminiConfig();
  if (!config) return fallbackEditor(current, transcript);

  const systemInstruction = [
    "You are the AI Resume Generator inside ResumeATS Pro.",
    "Your job is to understand natural English voice/text commands and update the resume JSON accurately.",
    "Return ONLY valid JSON with this shape: {\"updatedResume\": ResumeData, \"changes\": string[], \"questions\": string[], \"confidence\": \"high\" | \"medium\" | \"low\"}.",
    "The ResumeData structure is: basics{name,title,email,phone,location,website,linkedin,github,photo}, summary, experience[{id,company,role,location,start,end,bullets}], education[{id,school,degree,location,start,end,details}], projects[{id,name,link,bullets}], skills[], certifications[], and optional settings for showHeadline/show sections/showPhoto/density/textScale/sectionTitles.",
    "Understand explicit commands even when spoken casually: add, remove, delete, replace, change, update, rewrite, improve, shorten, expand, tailor, optimize, make it for, add experience, add project, add education, add certification, add skills, remove skill, change title, change location, rewrite first bullet, improve summary.",
    "If the user gives clear facts, apply them directly. If they ask for rewriting or improvement, rewrite professionally using existing facts and ATS-friendly language.",
    "For add experience/project/education commands, use only facts the user provided. If important facts are missing, add a reasonable editable placeholder ONLY when needed and ask a question in questions[].",
    "For remove/delete commands, remove only the requested item. For replace X with Y, replace X wherever it appears in relevant resume text/skills.",
    "Preserve all existing true facts unless the user clearly asks to change them.",
    "Do not invent employers, schools, degrees, dates, phone numbers, addresses, or private personal details.",
    "Keep the candidate name as Abdullah Akhtar unless the user explicitly asks to change the name.",
    "Keep photo data and resume settings unchanged unless the user explicitly requests changing them.",
    "Keep bullets concise, recruiter-friendly, and measurable where possible.",
    "Make sure all ids exist. Reuse existing ids for edited items; create readable unique ids for newly added items."
  ].join("\n");

  const prompt = JSON.stringify({
    voiceOrTextCommand: transcript,
    currentResume: current,
    instructions: "Update the resume according to voiceOrTextCommand. Return only the JSON response shape described in the system instruction."
  });

  const modelName = config.model.replace(/^models\//, "");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.18,
        topP: 0.9,
        responseMimeType: "application/json"
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = isRecord(payload.error) ? asString(payload.error.message) : "AI resume editor failed.";
    throw new Error(message || "AI resume editor failed.");
  }

  const text = extractModelText(payload);
  if (!text) throw new Error("AI assistant returned an empty response.");

  const parsed = parseJsonFromModel(text) as Partial<VoiceResumeResult>;
  return {
    updatedResume: normalizeResume(parsed.updatedResume),
    changes: Array.isArray(parsed.changes) && parsed.changes.length ? parsed.changes.map(String) : ["Resume updated from AI instruction."],
    questions: Array.isArray(parsed.questions) ? parsed.questions.map(String).filter(Boolean) : [],
    confidence: parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low" ? parsed.confidence : "medium",
    mode: "ai"
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const transcript = asString(body.transcript).trim();
    if (transcript.length < 4) {
      return NextResponse.json({ error: "Please speak or type a longer resume instruction." }, { status: 400 });
    }
    if (transcript.length > 3500) {
      return NextResponse.json({ error: "AI instruction is too long. Please keep it under 3500 characters." }, { status: 400 });
    }

    const current = normalizeResume(body.resume);
    const result = await runGeminiEditor(current, transcript);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not process the AI resume request." },
      { status: 400 }
    );
  }
}
