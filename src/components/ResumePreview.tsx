import clsx from "clsx";
import { ResumeData, TemplateId, resolveResumeSettings } from "@/lib/resume";
import { templateClass } from "@/lib/templates";

type Props = {
  data: ResumeData;
  template: TemplateId;
  previewOnly?: boolean;
  previewId?: string | null;
};

const photoTemplates: TemplateId[] = ["portrait", "sidebar", "metro", "halo", "compactPhoto"];

function ContactLine({ data }: { data: ResumeData }) {
  const items = [data.basics.location, data.basics.phone, data.basics.email, data.basics.website, data.basics.linkedin, data.basics.github].filter(Boolean);
  if (!items.length) return null;
  return <p className="resume-contact">{items.join(" • ")}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "Y") + (parts[1]?.[0] || "N");
}

export default function ResumePreview({ data, template, previewOnly, previewId = "resume-preview" }: Props) {
  const settings = resolveResumeSettings(data.settings);
  const experiences = data.experience.filter((exp) => exp.company || exp.role || exp.location || exp.start || exp.end || exp.bullets.some(Boolean));
  const education = data.education.filter((edu) => edu.school || edu.degree || edu.location || edu.start || edu.end || edu.details);
  const projects = data.projects.filter((project) => project.name || project.link || project.bullets.some(Boolean));
  const skills = data.skills.filter(Boolean);
  const certifications = data.certifications.filter(Boolean);
  const showHeadline = settings.showHeadline && Boolean(data.basics.title.trim());
  const showPhoto = settings.showPhoto && photoTemplates.includes(template);

  return (
    <article
      id={previewId ?? undefined}
      className={clsx(
        "resume-paper print-resume",
        templateClass[template],
        settings.density === "compact" && "resume-density-compact",
        settings.textScale === "small" && "resume-text-small",
        settings.textScale === "large" && "resume-text-large",
        !showHeadline && "resume-no-headline",
        previewOnly && "pointer-events-none"
      )}
    >
      <style>{`
        .resume-paper { padding: 50px 54px; font-family: Georgia, 'Times New Roman', serif; }
        .resume-paper h1 { margin: 0; font-size: 34px; letter-spacing: -0.03em; text-align: center; color:#111827; }
        .resume-paper .resume-title { margin: 0 0 7px; text-align:center; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color:#374151; }
        .resume-contact { margin: 14px auto 0; max-width: 650px; text-align:center; font-size: 11px; color:#1f2937; overflow-wrap:anywhere; }
        .resume-section { margin-top: 22px; break-inside: avoid; }
        .resume-section h2 { margin: 0 0 9px; border-bottom: 1.4px solid #111827; padding-bottom: 5px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .09em; color:#111827; }
        .resume-section p { margin: 0; font-size: 11.6px; color:#111827; }
        .resume-item { margin-top: 11px; break-inside: avoid; }
        .resume-row { display:flex; justify-content:space-between; gap: 16px; align-items: baseline; }
        .resume-role { font-size: 11.8px; font-weight:900; }
        .resume-company { font-size: 11.8px; font-weight:700; }
        .resume-date { white-space:nowrap; font-size: 10.8px; color:#374151; font-style: italic; }
        .resume-location { margin-top: 2px; font-size: 10.8px; color:#374151; font-style: italic; }
        .resume-paper ul { margin: 7px 0 0 18px; padding:0; }
        .resume-paper li { margin: 3.8px 0; font-size: 11.15px; color:#111827; }
        .skill-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 6px 30px; margin-top: 7px; }
        .skill-grid span { font-size: 11.15px; color:#111827; }
        .certification-list { display:grid; gap: 4px; margin-top: 2px; }
        .certification-list p { margin:0; }
        .resume-avatar { display:none; flex: 0 0 auto; height: 92px; width: 92px; overflow:hidden; border-radius:999px; border: 3px solid #ffffff; background:#0f172a; color:#ffffff; box-shadow: 0 10px 30px rgba(15,23,42,.18); }
        .resume-avatar img { height:100%; width:100%; object-fit:cover; display:block; }
        .resume-avatar span { display:grid; height:100%; width:100%; place-items:center; font-size: 30px; font-weight:900; letter-spacing:-.05em; }
        .resume-no-headline h1 { margin-top: 0; }
        .resume-density-compact { padding-top: 38px; padding-bottom: 38px; }
        .resume-density-compact .resume-section { margin-top: 15px; }
        .resume-density-compact .resume-item { margin-top: 8px; }
        .resume-density-compact .resume-paper li { margin: 2.6px 0; }
        .resume-text-small { font-size: 94%; }
        .resume-text-small h1 { font-size: 31px; }
        .resume-text-small .resume-section p, .resume-text-small li, .resume-text-small .skill-grid span { font-size: 10.5px; }
        .resume-text-large h1 { font-size: 37px; }
        .resume-text-large .resume-section p, .resume-text-large li, .resume-text-large .skill-grid span { font-size: 12.1px; }
        .resume-text-large .resume-role, .resume-text-large .resume-company { font-size: 12.5px; }
        .template-aether { font-family: Georgia, 'Times New Roman', serif; padding: 48px 58px; }
        .template-aether h1 { text-align:left; font-size: 31px; }
        .template-aether .resume-title { text-align:left; color:#111827; }
        .template-aether .resume-contact { text-align:left; max-width:none; border-bottom: 1.4px solid #111827; padding-bottom: 12px; }
        .template-solstice h1 { font-size: 31px; }
        .template-solstice header { border-top: 5px solid #111827; padding-top: 18px; }
        .template-solstice .resume-section h2 { border-bottom: 2px solid #111827; }
        .template-nova { font-family: Arial, Helvetica, sans-serif; }
        .template-nova h1 { color:#0b2e40; }
        .template-nova .resume-section h2 { color:#0079C6; border-color:#94a3b8; }
        .template-atlas { padding: 40px 46px; font-family: Arial, Helvetica, sans-serif; }
        .template-atlas h1 { text-align:left; font-size: 32px; }
        .template-atlas .resume-title, .template-atlas .resume-contact { text-align:left; max-width:none; }
        .template-atlas .resume-section { margin-top: 18px; }
        .template-atlas li { margin: 3px 0; }
        .template-minimal { font-family: Arial, Helvetica, sans-serif; padding: 56px; }
        .template-minimal h1 { text-align:left; font-size: 32px; letter-spacing: -0.02em; }
        .template-minimal .resume-title, .template-minimal .resume-contact { text-align:left; max-width:none; }
        .template-minimal .resume-section h2 { border-bottom: 1px solid #cbd5e1; letter-spacing:.12em; color:#334155; }
        .template-clarity { font-family: Arial, Helvetica, sans-serif; padding: 52px 58px; }
        .template-clarity h1 { font-size: 33px; text-align:left; }
        .template-clarity .resume-title, .template-clarity .resume-contact { text-align:left; max-width:none; }
        .template-clarity .resume-section h2 { border:0; border-left: 4px solid #111827; padding: 0 0 0 9px; font-size:12.5px; }
        .template-clarity .skill-grid { grid-template-columns: 1fr; gap: 5px; }
        .template-impact { font-family: Arial, Helvetica, sans-serif; padding: 46px 52px; }
        .template-impact header { border-bottom: 2px solid #111827; padding-bottom: 14px; }
        .template-impact h1 { text-align:left; font-size: 35px; }
        .template-impact .resume-title, .template-impact .resume-contact { text-align:left; max-width:none; }
        .template-impact .resume-section h2 { border-bottom: 0; padding-bottom:0; color:#0b2e40; }
        .template-impact .resume-section h2::after { content:""; display:block; height:1px; margin-top:6px; background:#111827; }
        .template-summit { padding: 54px 58px; }
        .template-summit header { text-align:center; border-bottom: 1.6px solid #111827; padding-bottom: 14px; }
        .template-summit h1 { font-size: 36px; letter-spacing: .02em; }
        .template-summit .resume-section h2 { text-align:center; border:0; border-bottom: 1px solid #cbd5e1; }
        .template-blueprint { font-family: 'Courier New', Courier, monospace; padding: 44px 48px; }
        .template-blueprint h1 { text-align:left; font-size: 30px; letter-spacing: -0.04em; }
        .template-blueprint .resume-title, .template-blueprint .resume-contact { text-align:left; max-width:none; }
        .template-blueprint .resume-section h2 { border-bottom: 1px dashed #111827; font-size: 12px; }
        .template-blueprint .resume-role, .template-blueprint .resume-company, .template-blueprint p, .template-blueprint li, .template-blueprint .skill-grid span { font-size: 10.7px; }
        .template-europass, .template-europass-modern { font-family: Arial, Helvetica, sans-serif; }
        .template-europass { padding: 42px 50px; border-top: 10px solid #1d4ed8; }
        .template-europass h1 { text-align:left; color:#1e3a8a; font-size: 32px; letter-spacing:-.025em; }
        .template-europass .resume-title { text-align:left; color:#1d4ed8; }
        .template-europass .resume-contact { text-align:left; max-width:none; margin-top: 10px; border-bottom: 1px solid #bfdbfe; padding-bottom: 12px; color:#1e293b; }
        .template-europass .resume-section { margin-top: 19px; }
        .template-europass .resume-section h2 { border-bottom: 1.6px solid #1d4ed8; color:#1d4ed8; letter-spacing:.11em; }
        .template-europass .resume-role { color:#0f172a; }
        .template-europass .skill-grid { grid-template-columns: 1fr 1fr; }
        .template-europass-modern { padding: 38px 44px; background: linear-gradient(90deg, #eff6ff 0 28%, #ffffff 28%); }
        .template-europass-modern header { border-radius: 24px; background:#ffffff; padding: 18px 20px; box-shadow: inset 0 0 0 1px #bfdbfe; }
        .template-europass-modern h1 { text-align:left; color:#1e40af; font-size: 31px; }
        .template-europass-modern .resume-title, .template-europass-modern .resume-contact { text-align:left; max-width:none; }
        .template-europass-modern .resume-contact { color:#334155; }
        .template-europass-modern .resume-section { margin-top: 16px; border-left: 4px solid #93c5fd; padding-left: 14px; }
        .template-europass-modern .resume-section h2 { border-bottom: 0; color:#1d4ed8; padding-bottom: 2px; }
        .template-europass-modern .skill-grid { grid-template-columns: 1fr; gap: 5px; }
        .template-essential { font-family: Arial, Helvetica, sans-serif; padding: 52px 58px; }
        .template-essential header { border-bottom: 1px solid #94a3b8; padding-bottom: 13px; }
        .template-essential h1, .template-essential .resume-title, .template-essential .resume-contact { text-align:left; max-width:none; }
        .template-essential h1 { font-size: 36px; }
        .template-essential .resume-title { margin-bottom: 4px; font-weight:700; text-transform:none; letter-spacing:.02em; }
        .template-essential .resume-section h2 { border:0; padding-bottom:0; color:#334155; letter-spacing:.13em; }
        .template-ledger { font-family: Arial, Helvetica, sans-serif; padding: 42px 48px; border-left: 10px solid #334155; }
        .template-ledger h1, .template-ledger .resume-title, .template-ledger .resume-contact { text-align:left; max-width:none; }
        .template-ledger .resume-contact { padding-bottom:12px; border-bottom:1px solid #cbd5e1; }
        .template-ledger .resume-section { margin-top:17px; padding-left:14px; border-left:2px solid #cbd5e1; }
        .template-ledger .resume-section h2 { border:0; padding:0; }
        .template-ledger .resume-row { gap:10px; }
        .template-vertex { font-family: Arial, Helvetica, sans-serif; padding: 46px 52px; }
        .template-vertex header { border-top:7px solid #0f172a; padding-top:16px; }
        .template-vertex h1, .template-vertex .resume-title, .template-vertex .resume-contact { text-align:left; max-width:none; }
        .template-vertex h1 { font-size:36px; }
        .template-vertex .resume-section h2 { border:0; padding:5px 8px; background:#f1f5f9; letter-spacing:.12em; }
        .template-chronicle { font-family: Georgia, 'Times New Roman', serif; padding: 50px 60px; }
        .template-chronicle h1 { font-size:38px; font-weight:500; letter-spacing:.01em; }
        .template-chronicle .resume-title { text-transform:none; letter-spacing:.03em; font-weight:600; }
        .template-chronicle .resume-contact { border-top:1px solid #111827; border-bottom:1px solid #111827; padding:8px 0; }
        .template-chronicle .resume-section h2 { text-align:center; border:0; font-weight:600; letter-spacing:.16em; }
        .template-signal { font-family: Arial, Helvetica, sans-serif; padding: 44px 50px; }
        .template-signal header { display:grid; gap:5px; padding-bottom:14px; border-bottom:3px double #0f172a; }
        .template-signal h1, .template-signal .resume-title, .template-signal .resume-contact { text-align:left; max-width:none; margin-left:0; }
        .template-signal .resume-title { order:2; color:#475569; }
        .template-signal h1 { order:1; font-size:35px; }
        .template-signal .resume-contact { order:3; margin-top:5px; }
        .template-signal .resume-section h2 { border:0; border-bottom:1px solid #94a3b8; padding-bottom:4px; }
        .template-portrait, .template-sidebar, .template-metro, .template-halo, .template-compact-photo { font-family: Arial, Helvetica, sans-serif; }
        .template-portrait { padding: 44px 52px; }
        .template-portrait header { display:flex; align-items:center; gap: 22px; border-bottom: 2px solid #0f172a; padding-bottom: 18px; }
        .template-portrait .resume-avatar { display:block; }
        .template-portrait h1, .template-portrait .resume-title, .template-portrait .resume-contact { text-align:left; max-width:none; }
        .template-portrait h1 { font-size: 34px; }
        .template-portrait .resume-contact { margin-top: 10px; }
        .template-sidebar { padding: 38px 44px; background: linear-gradient(90deg, #f1f5f9 0 26%, #fff 26%); }
        .template-sidebar header { display:flex; gap: 20px; align-items:center; padding: 18px; border-radius: 22px; background:#ffffff; box-shadow: 0 10px 30px rgba(15,23,42,.08); }
        .template-sidebar .resume-avatar { display:block; border-color:#0f172a; }
        .template-sidebar h1, .template-sidebar .resume-title, .template-sidebar .resume-contact { text-align:left; max-width:none; }
        .template-sidebar .resume-section h2 { border:0; color:#0f172a; background:#e2e8f0; display:inline-block; border-radius:999px; padding: 5px 12px; }
        .template-metro { padding: 42px 50px; background:#f8fafc; }
        .template-metro header { display:grid; grid-template-columns:auto 1fr; gap: 20px; align-items:center; border-radius:28px; background:#ffffff; padding:20px; box-shadow: inset 0 0 0 1px #e2e8f0; }
        .template-metro .resume-avatar { display:block; border-color:#1298E8; }
        .template-metro h1, .template-metro .resume-title, .template-metro .resume-contact { text-align:left; max-width:none; }
        .template-metro .resume-section { background:#fff; border-radius:20px; padding:14px 16px; border:1px solid #e2e8f0; }
        .template-metro .resume-section h2 { border-bottom: 1px solid #e2e8f0; color:#0079C6; }
        .template-halo { padding: 46px 56px; }
        .template-halo header { text-align:center; }
        .template-halo .resume-avatar { display:block; margin: 0 auto 14px; height: 104px; width: 104px; border: 4px solid #eaf7ff; }
        .template-halo h1 { font-size: 35px; }
        .template-halo .resume-section h2 { text-align:center; border:0; border-bottom:1px solid #cbd5e1; color:#0b2e40; }
        .template-compact-photo { padding: 36px 42px; }
        .template-compact-photo header { display:flex; align-items:center; gap: 18px; }
        .template-compact-photo .resume-avatar { display:block; height:78px; width:78px; border-color:#e2e8f0; }
        .template-compact-photo h1, .template-compact-photo .resume-title, .template-compact-photo .resume-contact { text-align:left; max-width:none; }
        .template-compact-photo .resume-section { margin-top: 16px; }
        .template-compact-photo .resume-section h2 { border-bottom: 1px solid #cbd5e1; font-size: 11.5px; }
        .template-compact-photo .resume-role, .template-compact-photo .resume-company, .template-compact-photo p, .template-compact-photo li, .template-compact-photo .skill-grid span { font-size: 10.7px; }
      `}</style>
      <header>
        {showPhoto && (
          <div className="resume-avatar" aria-hidden="true">
            {data.basics.photo ? <img src={data.basics.photo} alt="" /> : <span>{initials(data.basics.name || "Your Name")}</span>}
          </div>
        )}
        <div className="resume-header-text">
          {showHeadline && <p className="resume-title">{data.basics.title}</p>}
          <h1>{data.basics.name || "Your Name"}</h1>
          <ContactLine data={data} />
        </div>
      </header>

      {settings.showSummary && data.summary.trim() && (
        <Section title={settings.sectionTitles.summary}>
          <p>{data.summary}</p>
        </Section>
      )}

      {settings.showExperience && experiences.length > 0 && (
        <Section title={settings.sectionTitles.experience}>
          {experiences.map((exp) => (
            <div key={exp.id} className="resume-item">
              <div className="resume-row">
                <div><span className="resume-role">{exp.role}</span>{exp.company && <span className="resume-company">{exp.role ? " · " : ""}{exp.company}</span>}</div>
                {(exp.start || exp.end) && <span className="resume-date">{[exp.start, exp.end].filter(Boolean).join(" — ")}</span>}
              </div>
              {exp.location && <div className="resume-location">{exp.location}</div>}
              {exp.bullets.some(Boolean) && <ul>{exp.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
            </div>
          ))}
        </Section>
      )}

      {settings.showEducation && education.length > 0 && (
        <Section title={settings.sectionTitles.education}>
          {education.map((edu) => (
            <div key={edu.id} className="resume-item">
              <div className="resume-row">
                <div><span className="resume-role">{edu.school}</span>{edu.degree && <span className="resume-company">{edu.school ? " · " : ""}{edu.degree}</span>}</div>
                {(edu.start || edu.end) && <span className="resume-date">{[edu.start, edu.end].filter(Boolean).join(" — ")}</span>}
              </div>
              {edu.location && <div className="resume-location">{edu.location}</div>}
              {edu.details && <p>{edu.details}</p>}
            </div>
          ))}
        </Section>
      )}

      {settings.showProjects && projects.length > 0 && (
        <Section title={settings.sectionTitles.projects}>
          {projects.map((project) => (
            <div key={project.id} className="resume-item">
              <div className="resume-row"><span className="resume-role">{project.name}</span>{project.link && <span className="resume-date">{project.link}</span>}</div>
              {project.bullets.some(Boolean) && <ul>{project.bullets.filter(Boolean).map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
            </div>
          ))}
        </Section>
      )}

      {settings.showSkills && skills.length > 0 && (
        <Section title={settings.sectionTitles.skills}>
          <div className="skill-grid">{skills.map((skill, index) => <span key={`${skill}-${index}`}>• {skill}</span>)}</div>
        </Section>
      )}

      {settings.showCertifications && certifications.length > 0 && (
        <Section title={settings.sectionTitles.certifications}>
          <div className="certification-list">{certifications.map((certification, index) => <p key={`${certification}-${index}`}>{certification}</p>)}</div>
        </Section>
      )}
    </article>
  );
}
