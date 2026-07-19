import type { TemplateId } from "./resume";

export type ResumeTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  tone: string;
  atsSafe: boolean;
  bestFor: string;
  photoFriendly?: boolean;
  headlineOptional?: boolean;
  category: "classic" | "modern" | "compact" | "photo" | "international";
};

export const templates: ResumeTemplate[] = [
  {
    id: "eclipse",
    name: "Eclipse",
    description: "Classic one-column ATS template with strong section hierarchy and recruiter-friendly spacing.",
    tone: "Corporate",
    atsSafe: true,
    bestFor: "Business, operations, administration",
    category: "classic"
  },
  {
    id: "aether",
    name: "Aether",
    description: "Executive style with left-aligned identity, clean dividers, and generous white space.",
    tone: "Executive",
    atsSafe: true,
    bestFor: "Senior roles, management",
    category: "classic"
  },
  {
    id: "solstice",
    name: "Solstice",
    description: "Modern professional template with a strong top rule and crisp achievement bullets.",
    tone: "Modern",
    atsSafe: true,
    bestFor: "Marketing, finance, HR",
    category: "modern"
  },
  {
    id: "nova",
    name: "Nova",
    description: "Clean technology layout using sans-serif typography and light accent headings.",
    tone: "Tech",
    atsSafe: true,
    bestFor: "Software, data, IT",
    category: "modern"
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Compact professional format for candidates with deeper experience and more content.",
    tone: "Senior",
    atsSafe: true,
    bestFor: "Experienced professionals",
    category: "compact"
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple recruiter-first format optimized for parsing, scanning, and easy editing.",
    tone: "Simple",
    atsSafe: true,
    bestFor: "Entry-level, internships",
    headlineOptional: true,
    category: "classic"
  },
  {
    id: "clarity",
    name: "Clarity",
    description: "Highly readable ATS layout with larger section labels and clean spacing for fast review.",
    tone: "Readable",
    atsSafe: true,
    bestFor: "Healthcare, education, support",
    category: "classic"
  },
  {
    id: "impact",
    name: "Impact",
    description: "Achievement-focused template that makes quantified results and action bullets stand out.",
    tone: "Results",
    atsSafe: true,
    bestFor: "Sales, marketing, leadership",
    category: "modern"
  },
  {
    id: "summit",
    name: "Summit",
    description: "Polished senior template with refined typography and a confident professional header.",
    tone: "Premium",
    atsSafe: true,
    bestFor: "Executive, consulting",
    category: "classic"
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description: "Structured engineering-style template with precise rules and technical readability.",
    tone: "Technical",
    atsSafe: true,
    bestFor: "Engineering, product, analytics",
    category: "compact"
  },
  {
    id: "europass",
    name: "Europass Classic",
    description: "European CV-inspired layout with blue section hierarchy, clear contact details, and recruiter-friendly spacing.",
    tone: "Europass",
    atsSafe: true,
    bestFor: "Europe applications, scholarships, internships",
    category: "international"
  },
  {
    id: "europassModern",
    name: "Europass Modern",
    description: "Compact Europass-style template with a soft blue profile band and structured professional sections.",
    tone: "EU Modern",
    atsSafe: true,
    bestFor: "EU jobs, academic CVs, entry-level roles",
    category: "international"
  },
  {
    id: "essential",
    name: "Essential",
    description: "A name-first ATS layout designed to look complete even when no professional headline is entered.",
    tone: "Headline-free",
    atsSafe: true,
    bestFor: "Students, career changers, general applications",
    headlineOptional: true,
    category: "classic"
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Structured business resume with subtle left rules, compact dates, and clear evidence-first sections.",
    tone: "Structured",
    atsSafe: true,
    bestFor: "Finance, accounting, operations",
    headlineOptional: true,
    category: "compact"
  },
  {
    id: "vertex",
    name: "Vertex",
    description: "Sharp modern layout with a strong name block and clean section markers for technical candidates.",
    tone: "Focused",
    atsSafe: true,
    bestFor: "Engineering, software, product",
    headlineOptional: true,
    category: "modern"
  },
  {
    id: "chronicle",
    name: "Chronicle",
    description: "Traditional serif resume that prioritizes career history and remains balanced without a headline.",
    tone: "Classic",
    atsSafe: true,
    bestFor: "Law, policy, research, academia",
    headlineOptional: true,
    category: "classic"
  },
  {
    id: "signal",
    name: "Signal",
    description: "Clean high-contrast resume with compact metadata and bold, parser-friendly section labels.",
    tone: "Contemporary",
    atsSafe: true,
    bestFor: "Startups, digital roles, consulting",
    headlineOptional: true,
    category: "modern"
  },
  {
    id: "portrait",
    name: "Portrait Pro",
    description: "Friendly profile-photo layout with a clean header, strong identity area, and readable sections.",
    tone: "Photo",
    atsSafe: false,
    photoFriendly: true,
    bestFor: "Creative, client-facing, portfolio roles",
    category: "photo"
  },
  {
    id: "sidebar",
    name: "Sidebar Focus",
    description: "Modern photo-friendly profile block with a polished left-accent feel and compact content spacing.",
    tone: "Profile",
    atsSafe: false,
    photoFriendly: true,
    bestFor: "Design, sales, customer success",
    category: "photo"
  },
  {
    id: "metro",
    name: "Metro Card",
    description: "Clean card-style professional resume with optional profile picture and balanced spacing.",
    tone: "Fresh",
    atsSafe: false,
    photoFriendly: true,
    bestFor: "Students, internships, modern CVs",
    category: "photo"
  },
  {
    id: "halo",
    name: "Halo",
    description: "Premium round-photo header with elegant typography and soft section separation.",
    tone: "Elegant",
    atsSafe: false,
    photoFriendly: true,
    bestFor: "Consulting, HR, administration",
    category: "photo"
  },
  {
    id: "compactPhoto",
    name: "Compact Photo",
    description: "Space-saving resume with optional profile photo while keeping content easy to scan.",
    tone: "Compact",
    atsSafe: false,
    photoFriendly: true,
    bestFor: "Experienced professionals with more content",
    category: "photo"
  }
];

export const templateCount = templates.length;
export const atsSafeTemplateCount = templates.filter((template) => template.atsSafe).length;
export const headlineOptionalTemplateCount = templates.filter((template) => template.headlineOptional).length;
export const photoTemplateCount = templates.filter((template) => template.photoFriendly).length;

export const templateClass: Record<TemplateId, string> = {
  eclipse: "template-eclipse",
  aether: "template-aether",
  solstice: "template-solstice",
  nova: "template-nova",
  atlas: "template-atlas",
  minimal: "template-minimal",
  clarity: "template-clarity",
  impact: "template-impact",
  summit: "template-summit",
  blueprint: "template-blueprint",
  europass: "template-europass",
  europassModern: "template-europass-modern",
  essential: "template-essential",
  ledger: "template-ledger",
  vertex: "template-vertex",
  chronicle: "template-chronicle",
  signal: "template-signal",
  portrait: "template-portrait",
  sidebar: "template-sidebar",
  metro: "template-metro",
  halo: "template-halo",
  compactPhoto: "template-compact-photo"
};

export function isTemplateId(value: string | null | undefined): value is TemplateId {
  return Boolean(value && templates.some((template) => template.id === value));
}
