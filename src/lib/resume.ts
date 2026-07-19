export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type Project = {
  id: string;
  name: string;
  link: string;
  bullets: string[];
};

export type ResumeSectionKey = "summary" | "experience" | "education" | "projects" | "skills" | "certifications";

export type ResumeSettings = {
  showHeadline?: boolean;
  showSummary?: boolean;
  showExperience?: boolean;
  showEducation?: boolean;
  showProjects?: boolean;
  showSkills?: boolean;
  showCertifications?: boolean;
  showPhoto?: boolean;
  density?: "comfortable" | "compact";
  textScale?: "small" | "medium" | "large";
  sectionTitles?: Partial<Record<ResumeSectionKey, string>>;
};

export const defaultResumeSettings: Required<Omit<ResumeSettings, "sectionTitles">> & { sectionTitles: Record<ResumeSectionKey, string> } = {
  showHeadline: true,
  showSummary: true,
  showExperience: true,
  showEducation: true,
  showProjects: true,
  showSkills: true,
  showCertifications: true,
  showPhoto: true,
  density: "comfortable",
  textScale: "medium",
  sectionTitles: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    certifications: "Certifications"
  }
};

export type ResumeData = {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    photo?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  certifications: string[];
  settings?: ResumeSettings;
};

export type TemplateId =
  | "eclipse"
  | "aether"
  | "solstice"
  | "nova"
  | "atlas"
  | "minimal"
  | "clarity"
  | "impact"
  | "summit"
  | "blueprint"
  | "europass"
  | "europassModern"
  | "essential"
  | "ledger"
  | "vertex"
  | "chronicle"
  | "signal"
  | "portrait"
  | "sidebar"
  | "metro"
  | "halo"
  | "compactPhoto";

export const emptyResume: ResumeData = {
  basics: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    photo: ""
  },
  summary: "",
  experience: [
    {
      id: "exp-1",
      company: "",
      role: "",
      location: "",
      start: "",
      end: "",
      bullets: [""]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "",
      degree: "",
      location: "",
      start: "",
      end: "",
      details: ""
    }
  ],
  projects: [],
  skills: [],
  certifications: [],
  settings: { ...defaultResumeSettings, sectionTitles: { ...defaultResumeSettings.sectionTitles } }
};

export const demoResume: ResumeData = {
  basics: {
    name: "Abdullah Akhtar",
    title: "Senior Business Analyst",
    email: "abdullah.akhtar@example.com",
    phone: "(555) 789-1234",
    location: "New York, NY",
    website: "abdullahakhtar.com",
    linkedin: "linkedin.com/in/abdullahakhtar",
    github: "",
    photo: ""
  },
  summary:
    "Senior Business Analyst with 5+ years of experience in data analysis, process optimization, stakeholder management, and reporting automation. Skilled in SQL, Excel, dashboards, forecasting, and requirements gathering, with a record of improving decision quality, reducing manual work, and increasing operational visibility.",
  experience: [
    {
      id: "exp-1",
      company: "Loom & Lantern Co.",
      role: "Senior Business Analyst",
      location: "New York, NY",
      start: "Jul 2021",
      end: "Present",
      bullets: [
        "Created executive dashboards and KPI reporting workflows used by 8 departments, reducing weekly reporting time by 32%.",
        "Analyzed customer, sales, and operations data to identify trends that improved forecast accuracy by 18% and supported annual planning.",
        "Partnered with stakeholders to document requirements, prioritize process improvements, and deliver 14 workflow enhancements on schedule."
      ]
    },
    {
      id: "exp-2",
      company: "Willow & Reed Ltd.",
      role: "Business Analyst",
      location: "New York, NY",
      start: "Aug 2017",
      end: "May 2021",
      bullets: [
        "Built Excel and SQL reports for finance and operations teams, improving data accuracy and reducing manual reconciliation by 20%.",
        "Mapped business processes, gathered user requirements, and delivered documentation that accelerated system changes by 25%."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "New York University",
      degree: "Bachelor of Science in Economics",
      location: "New York, NY",
      start: "Sep 2013",
      end: "May 2017",
      details: "Dean's List; Business Analytics Society"
    }
  ],
  projects: [
    {
      id: "project-1",
      name: "Revenue Forecasting Dashboard",
      link: "",
      bullets: ["Built a forecasting dashboard that reduced weekly reporting time by 8 hours and increased forecast accuracy by 18%."]
    }
  ],
  skills: ["SQL", "Excel", "Power BI", "Data Analysis", "Requirements Gathering", "Process Improvement", "Forecasting", "Stakeholder Management"],
  certifications: ["Google Data Analytics Certificate"],
  settings: { ...defaultResumeSettings, sectionTitles: { ...defaultResumeSettings.sectionTitles } }
};

export const starterResumes: { label: string; description: string; data: ResumeData }[] = [
  {
    label: "Business Analyst",
    description: "Data, reporting, requirements, process improvement",
    data: demoResume
  },
  {
    label: "Software Engineer",
    description: "Projects, code quality, APIs, cloud, testing",
    data: {
      basics: {
        name: "Abdullah Akhtar",
        title: "Software Engineer",
        email: "abdullah.akhtar@example.com",
        phone: "(555) 234-9812",
        location: "Austin, TX",
        website: "abdullahakhtar.com",
        linkedin: "linkedin.com/in/abdullahakhtar",
        github: "github.com/abdullahakhtar",
        photo: ""
      },
      summary:
        "Software Engineer with 4+ years of experience building scalable web applications, REST APIs, and cloud-based features. Skilled in React, TypeScript, Node.js, SQL, testing, and performance optimization, with experience delivering reliable products in agile teams.",
      experience: [
        {
          id: "exp-se-1",
          company: "BrightStack Labs",
          role: "Software Engineer",
          location: "Austin, TX",
          start: "Jun 2021",
          end: "Present",
          bullets: [
            "Developed React and TypeScript features used by 40,000+ monthly users, improving task completion speed by 21%.",
            "Built REST API endpoints and SQL queries that reduced average dashboard load time from 4.2 seconds to 1.7 seconds.",
            "Improved test coverage across core services by 35% and reduced production defects through automated regression testing."
          ]
        },
        {
          id: "exp-se-2",
          company: "Northwind Digital",
          role: "Junior Software Developer",
          location: "Dallas, TX",
          start: "Jan 2019",
          end: "May 2021",
          bullets: [
            "Implemented reusable UI components and internal tools that saved the support team 10+ hours per week.",
            "Collaborated with product managers and designers to ship 18 enhancements across web and mobile workflows."
          ]
        }
      ],
      education: [
        {
          id: "edu-se-1",
          school: "University of Texas at Austin",
          degree: "Bachelor of Science in Computer Science",
          location: "Austin, TX",
          start: "Aug 2015",
          end: "May 2019",
          details: "Coursework: Data Structures, Databases, Software Engineering"
        }
      ],
      projects: [
        {
          id: "project-se-1",
          name: "Issue Tracking API",
          link: "github.com/abdullahakhtar/issues-api",
          bullets: ["Designed a Node.js and PostgreSQL API with authentication, pagination, and automated tests covering 85% of core logic."]
        }
      ],
      skills: ["React", "TypeScript", "Node.js", "REST APIs", "SQL", "PostgreSQL", "Git", "Jest", "Agile", "AWS"],
      certifications: ["AWS Certified Cloud Practitioner"]
    }
  },
  {
    label: "Medical / Healthcare",
    description: "Clinical operations, patient care, compliance",
    data: {
      basics: {
        name: "Abdullah Akhtar",
        title: "Healthcare Operations Specialist",
        email: "abdullah.akhtar@example.com",
        phone: "(555) 638-1049",
        location: "Chicago, IL",
        website: "",
        linkedin: "linkedin.com/in/abdullahakhtar",
        github: "",
        photo: ""
      },
      summary:
        "Healthcare Operations Specialist with 6+ years of experience supporting clinical workflows, patient coordination, compliance documentation, and quality improvement. Skilled in EHR systems, scheduling, reporting, HIPAA compliance, and cross-functional communication.",
      experience: [
        {
          id: "exp-hc-1",
          company: "Mercy Regional Hospital",
          role: "Healthcare Operations Specialist",
          location: "Chicago, IL",
          start: "Mar 2020",
          end: "Present",
          bullets: [
            "Coordinated daily clinical operations for 12 providers and improved patient appointment throughput by 17% through workflow changes.",
            "Audited documentation for compliance and reduced missing chart information by 24% within 6 months.",
            "Prepared weekly performance reports for leadership, improving visibility into patient wait times, cancellations, and resource use."
          ]
        },
        {
          id: "exp-hc-2",
          company: "Lakeside Clinic",
          role: "Patient Services Coordinator",
          location: "Chicago, IL",
          start: "May 2017",
          end: "Feb 2020",
          bullets: [
            "Managed intake, scheduling, and insurance verification for 80+ patients per day while maintaining service quality.",
            "Trained 5 new team members on EHR workflows, documentation standards, and patient communication procedures."
          ]
        }
      ],
      education: [
        {
          id: "edu-hc-1",
          school: "DePaul University",
          degree: "Bachelor of Science in Health Sciences",
          location: "Chicago, IL",
          start: "Aug 2013",
          end: "May 2017",
          details: "Relevant coursework: Healthcare Administration, Quality Management"
        }
      ],
      projects: [],
      skills: ["EHR", "Patient Coordination", "HIPAA", "Scheduling", "Quality Improvement", "Reporting", "Compliance", "Team Training"],
      certifications: ["Certified Medical Administrative Assistant"]
    }
  },
  {
    label: "Marketing",
    description: "Campaigns, analytics, content, growth",
    data: {
      basics: {
        name: "Abdullah Akhtar",
        title: "Digital Marketing Specialist",
        email: "abdullah.akhtar@example.com",
        phone: "(555) 447-2210",
        location: "San Diego, CA",
        website: "abdullahakhtar.com",
        linkedin: "linkedin.com/in/abdullahakhtar",
        github: "",
        photo: ""
      },
      summary:
        "Digital Marketing Specialist with 4+ years of experience in paid campaigns, SEO, content strategy, email marketing, and marketing analytics. Skilled in Google Ads, Meta Ads, GA4, A/B testing, and campaign reporting, with a record of improving acquisition and conversion results.",
      experience: [
        {
          id: "exp-mk-1",
          company: "Pacific Growth Studio",
          role: "Digital Marketing Specialist",
          location: "San Diego, CA",
          start: "Apr 2021",
          end: "Present",
          bullets: [
            "Managed paid search and social campaigns with a $55K quarterly budget, improving lead conversion rate by 23%.",
            "Built campaign dashboards in GA4 and Looker Studio, reducing manual reporting time by 30%.",
            "Launched SEO content updates that increased organic traffic by 41% across priority landing pages."
          ]
        },
        {
          id: "exp-mk-2",
          company: "Blue Harbor Media",
          role: "Marketing Coordinator",
          location: "San Diego, CA",
          start: "Jun 2019",
          end: "Mar 2021",
          bullets: [
            "Coordinated email campaigns, social content, and landing page updates that generated 1,200+ qualified leads.",
            "Partnered with designers and sales teams to improve campaign messaging, increasing email click-through rate by 18%."
          ]
        }
      ],
      education: [
        {
          id: "edu-mk-1",
          school: "San Diego State University",
          degree: "Bachelor of Business Administration in Marketing",
          location: "San Diego, CA",
          start: "Aug 2015",
          end: "May 2019",
          details: "Marketing Analytics Club"
        }
      ],
      projects: [
        {
          id: "project-mk-1",
          name: "Lead Nurture Campaign",
          link: "",
          bullets: ["Created a 5-email nurture sequence that increased trial-to-demo conversion by 16% over 60 days."]
        }
      ],
      skills: ["Google Ads", "Meta Ads", "GA4", "SEO", "Email Marketing", "A/B Testing", "Looker Studio", "Content Strategy"],
      certifications: ["Google Ads Search Certification", "HubSpot Email Marketing"]
    }
  }
];

export function resolveResumeSettings(settings?: ResumeSettings) {
  const titles = settings?.sectionTitles;
  return {
    showHeadline: settings?.showHeadline ?? defaultResumeSettings.showHeadline,
    showSummary: settings?.showSummary ?? defaultResumeSettings.showSummary,
    showExperience: settings?.showExperience ?? defaultResumeSettings.showExperience,
    showEducation: settings?.showEducation ?? defaultResumeSettings.showEducation,
    showProjects: settings?.showProjects ?? defaultResumeSettings.showProjects,
    showSkills: settings?.showSkills ?? defaultResumeSettings.showSkills,
    showCertifications: settings?.showCertifications ?? defaultResumeSettings.showCertifications,
    showPhoto: settings?.showPhoto ?? defaultResumeSettings.showPhoto,
    density: settings?.density === "compact" ? "compact" as const : "comfortable" as const,
    textScale: settings?.textScale === "small" || settings?.textScale === "large" ? settings.textScale : "medium" as const,
    sectionTitles: {
      summary: titles?.summary?.trim() || defaultResumeSettings.sectionTitles.summary,
      experience: titles?.experience?.trim() || defaultResumeSettings.sectionTitles.experience,
      education: titles?.education?.trim() || defaultResumeSettings.sectionTitles.education,
      projects: titles?.projects?.trim() || defaultResumeSettings.sectionTitles.projects,
      skills: titles?.skills?.trim() || defaultResumeSettings.sectionTitles.skills,
      certifications: titles?.certifications?.trim() || defaultResumeSettings.sectionTitles.certifications
    }
  };
}

export function normalizeResumeData(data: ResumeData): ResumeData {
  const cloned = JSON.parse(JSON.stringify(data)) as ResumeData;
  return {
    ...cloned,
    basics: {
      name: cloned.basics?.name || "",
      title: cloned.basics?.title || "",
      email: cloned.basics?.email || "",
      phone: cloned.basics?.phone || "",
      location: cloned.basics?.location || "",
      website: cloned.basics?.website || "",
      linkedin: cloned.basics?.linkedin || "",
      github: cloned.basics?.github || "",
      photo: cloned.basics?.photo || ""
    },
    summary: cloned.summary || "",
    experience: Array.isArray(cloned.experience) ? cloned.experience : [],
    education: Array.isArray(cloned.education) ? cloned.education : [],
    projects: Array.isArray(cloned.projects) ? cloned.projects : [],
    skills: Array.isArray(cloned.skills) ? cloned.skills : [],
    certifications: Array.isArray(cloned.certifications) ? cloned.certifications : [],
    settings: resolveResumeSettings(cloned.settings)
  };
}

export function cloneResume(data: ResumeData): ResumeData {
  return normalizeResumeData(data);
}

export function resumeToPlainText(data: ResumeData): string {
  const settings = resolveResumeSettings(data.settings);
  const lines: string[] = [];
  lines.push(data.basics.name);
  if (settings.showHeadline) lines.push(data.basics.title);
  lines.push(data.basics.email, data.basics.phone, data.basics.location, data.basics.website, data.basics.linkedin, data.basics.github);

  if (settings.showSummary && data.summary.trim()) lines.push(settings.sectionTitles.summary.toUpperCase(), data.summary);
  if (settings.showExperience && data.experience.length) {
    lines.push(settings.sectionTitles.experience.toUpperCase());
    data.experience.forEach((exp) => {
      lines.push(`${exp.role} ${exp.company} ${exp.location} ${exp.start} ${exp.end}`);
      exp.bullets.forEach((b) => lines.push(`- ${b}`));
    });
  }
  if (settings.showEducation && data.education.length) {
    lines.push(settings.sectionTitles.education.toUpperCase());
    data.education.forEach((edu) => lines.push(`${edu.degree} ${edu.school} ${edu.location} ${edu.start} ${edu.end} ${edu.details}`));
  }
  if (settings.showProjects && data.projects.length) {
    lines.push(settings.sectionTitles.projects.toUpperCase());
    data.projects.forEach((project) => {
      lines.push(`${project.name} ${project.link}`);
      project.bullets.forEach((b) => lines.push(`- ${b}`));
    });
  }
  if (settings.showSkills && data.skills.length) lines.push(settings.sectionTitles.skills.toUpperCase(), data.skills.join(", "));
  if (settings.showCertifications && data.certifications.length) {
    lines.push(settings.sectionTitles.certifications.toUpperCase());
    data.certifications.forEach((certification) => lines.push(certification));
  }
  return lines.filter((line) => Boolean(line && line.trim())).join("\n");
}

export function safeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
