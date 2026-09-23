import { useEffect, useState } from "react";
import type { ParsedResume } from "../api";
import { sendContactMessage, getErrorMessage } from "../api";

interface Props {
    data: ParsedResume;
    slug: string;
}
const SECTION_ORDER = [
    { id: "tt-about", label: "About" },
    { id: "tt-skills", label: "Skills" },
    { id: "tt-projects", label: "Projects" },
    { id: "tt-experience", label: "Experience" },
    { id: "tt-education", label: "Education" },
    { id: "tt-certifications", label: "Certifications" },
    { id: "tt-profiles", label: "Profiles" },
    { id: "tt-contact", label: "Contact" },
];
function TemplateTerminal({ data, slug }: Props) {
    const [typed, setTyped] = useState("");
    const fullTitle = data.title || "Software Developer";
    const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [contactError, setContactError] = useState<string | null>(null);
    const knownLinkKeys = ["github", "linkedin", "portfolio", "email"];
    const otherPlatforms = Object.entries(data.links || {}).filter(
        ([key, value]) => !knownLinkKeys.includes(key.toLowerCase()) && value
    );
    useEffect(() => {
        let i = 0;
        setTyped("");
        const interval = setInterval(() => {
            i++;
            setTyped(fullTitle.slice(0, i));
            if (i >= fullTitle.length) clearInterval(interval);
        }, 45);
        return () => clearInterval(interval);
    }, [fullTitle]);

    useEffect(() => {
        const revealEls = document.querySelectorAll(".tt-reveal");
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealEls.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [data]);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = String(formData.get("name") || "");
        const email = String(formData.get("email") || "");
        const message = String(formData.get("message") || "");

        setContactStatus("sending");
        setContactError(null);

        try {
            await sendContactMessage(slug, { name, email, message });
            setContactStatus("success");
            form.reset();
        } catch (err) {
            setContactStatus("error");
            setContactError(getErrorMessage(err));
        }
    };
    <form className="tt-contact-form" onSubmit={handleContactSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <textarea name="message" placeholder="Message" required />
        <button type="submit" className="tt-btn tt-btn-primary" disabled={contactStatus === "sending"}>
            {contactStatus === "sending" ? "Sending..." : "Send Message"}
        </button>
        {contactStatus === "success" && <p style={{ color: "var(--tt-accent)", fontSize: 13, marginTop: 10 }}>Message sent! Thanks for reaching out.</p>}
        {contactStatus === "error" && <p style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{contactError}</p>}
    </form>

    const stats = [
        { label: "Projects", value: data.projects?.length || 0 },
        { label: "Certifications", value: data.certifications?.length || 0 },
        { label: "Roles Held", value: data.experience?.length || 0 },
        { label: "Skill Areas", value: data.skillCategories?.length || 0 },
    ];

    return (
        <div className="tt-root">
            <style>{ttStyles}</style>

            <header className="tt-header">
                <nav className="tt-container tt-nav">
                    <a href="#tt-hero" className="tt-logo">&lt;{data.name?.charAt(0) || "D"}/&gt;</a>
                    <ul className="tt-nav-links">
                        {SECTION_ORDER.map((s, i) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`}>
                                    <span className="tt-idx">{String(i + 1).padStart(2, "0")}</span>{s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <section id="tt-hero" className="tt-hero">
                <div className="tt-container tt-hero-inner">
                    <div className="tt-badge">Available for opportunities</div>
                    <h1>Hi, I'm <span className="tt-accent">{data.name}</span></h1>
                    <div className="tt-typeline">
                        <span className="tt-prompt">$</span> {typed}<span className="tt-cursor">|</span>
                    </div>
                    <p className="tt-summary">{data.summary}</p>
                    <div className="tt-btn-row">
                        <a href="#tt-contact" className="tt-btn tt-btn-primary">Contact Me</a>
                        {data.links?.github && (
                            <a href={data.links.github} target="_blank" rel="noopener noreferrer" className="tt-btn tt-btn-outline">GitHub</a>
                        )}
                    </div>
                    <div className="tt-link-row">
                        {data.links?.github && <a href={data.links.github} target="_blank" rel="noopener noreferrer">{data.links.github}</a>}
                        {data.links?.linkedin && <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer">{data.links.linkedin}</a>}
                        {data.links?.email && <a href={`mailto:${data.links.email}`}>{data.links.email}</a>}
                        {data.links?.portfolio && <a href={data.links.portfolio} target="_blank" rel="noopener noreferrer">{data.links.portfolio}</a>}
                    </div>
                </div>
            </section>

            <section id="tt-about" className="tt-section">
                <div className="tt-container">
                    <TTHead index="01" title="About" />
                    <div className="tt-about-grid tt-reveal">
                        <p className="tt-about-text">{data.summary}</p>
                        <div className="tt-stats">
                            {stats.map((s) => (
                                <div className="tt-stat" key={s.label}>
                                    <div className="tt-stat-num">{s.value}+</div>
                                    <div className="tt-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {data.skillCategories?.length > 0 && (
                <section id="tt-skills" className="tt-section tt-section-alt">
                    <div className="tt-container">
                        <TTHead index="02" title="Skills" />
                        <div className="tt-skills-grid">
                            {data.skillCategories.map((cat, i) => (
                                <div className="tt-skill-block tt-reveal" key={i}>
                                    <h3>{cat.category}</h3>
                                    <div className="tt-chip-row">
                                        {cat.skills.map((s, j) => (
                                            <span className="tt-chip" key={j}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.projects?.length > 0 && (
                <section id="tt-projects" className="tt-section">
                    <div className="tt-container">
                        <TTHead index="03" title="Projects" />
                        <div className="tt-project-grid">
                            {data.projects.map((proj, i) => (
                                <div className="tt-project-card tt-reveal" key={i}>
                                    <div className="tt-project-top">
                                        <span className="tt-folder-icon">📁</span>
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="tt-project-link">↗</a>
                                        )}
                                    </div>
                                    <h3>{proj.title}</h3>
                                    <p>{proj.description}</p>
                                    {proj.techStack && <div className="tt-tech-line">{proj.techStack}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.experience?.length > 0 && (
                <section id="tt-experience" className="tt-section tt-section-alt">
                    <div className="tt-container">
                        <TTHead index="04" title="Experience" />
                        <div className="tt-timeline">
                            {data.experience.map((exp, i) => (
                                <div className="tt-tl-item tt-reveal" key={i}>
                                    <div className="tt-tl-dot" />
                                    <div className="tt-tl-content">
                                        <div className="tt-tl-duration">{exp.duration}</div>
                                        <h3>{exp.role}</h3>
                                        <div className="tt-tl-org">{exp.company}</div>
                                        {exp.highlights?.length > 0 && (
                                            <ul>
                                                {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.education?.length > 0 && (
                <section id="tt-education" className="tt-section">
                    <div className="tt-container">
                        <TTHead index="05" title="Education" />
                        <div className="tt-timeline">
                            {data.education.map((edu, i) => (
                                <div className="tt-tl-item tt-reveal" key={i}>
                                    <div className="tt-tl-dot" />
                                    <div className="tt-tl-content">
                                        <div className="tt-tl-duration">{edu.year}</div>
                                        <h3>{edu.degree}</h3>
                                        <div className="tt-tl-org">{edu.school}</div>
                                        {edu.score && <div className="tt-tl-score">{edu.score}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.certifications?.length > 0 && (
                <section id="tt-certifications" className="tt-section tt-section-alt">
                    <div className="tt-container">
                        <TTHead index="06" title="Certifications" />
                        <div className="tt-cert-grid">
                            {data.certifications.map((cert, i) => (
                                <div className="tt-cert-card tt-reveal" key={i}>
                                    <h4>{cert.name}</h4>
                                    <div className="tt-cert-meta">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>
                                    {cert.credentialUrl && (
                                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">View Credential ↗</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.achievements?.length > 0 && (
                <section id="tt-achievements" className="tt-section">
                    <div className="tt-container">
                        <TTHead index="07" title="Achievements" />
                        <div className="tt-cert-grid">
                            {data.achievements.map((ach, i) => (
                                <div className="tt-cert-card tt-reveal" key={i}>
                                    <h4>{ach.title}</h4>
                                    <p>{ach.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {otherPlatforms.length > 0 && (
                <section id="tt-profiles" className="tt-section tt-section-alt">
                    <div className="tt-container">
                        <TTHead index="08" title="Profiles" />
                        <div className="tt-profile-row tt-reveal">
                            {otherPlatforms.map(([key, url], i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tt-profile-pill">
                                    {key}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="tt-contact" className="tt-section">
                <div className="tt-container">
                    <TTHead index="09" title="Contact" />
                    <div className="tt-contact-grid tt-reveal">
                        <div className="tt-contact-info">
                            <p>Have a role, project, or opportunity in mind? My inbox is open.</p>
                            {data.links?.email && <div className="tt-contact-row">✉ <a href={`mailto:${data.links.email}`}>{data.links.email}</a></div>}
                            {data.phone && <div className="tt-contact-row">📞 <a href={`tel:${data.phone}`}>{data.phone}</a></div>}
                            {data.location && <div className="tt-contact-row">📍 {data.location}</div>}
                        </div>
                        <form className="tt-contact-form" onSubmit={handleContactSubmit}>
                            <input type="text" placeholder="Name" required />
                            <input type="email" placeholder="Email" required />
                            <textarea placeholder="Message" required />
                            <button type="submit" className="tt-btn tt-btn-primary">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            <footer className="tt-footer">
                <div className="tt-container">
                    © {new Date().getFullYear()} {data.name}. Built with React.
                </div>
            </footer>
        </div>
    );
}

function TTHead({ index, title }: { index: string; title: string }) {
    return (
        <div className="tt-section-head tt-reveal">
            <span className="tt-section-index">{index} /</span>
            <h2>{title}</h2>
        </div>
    );
}

const ttStyles = `
.tt-root{
  --tt-bg:#0a0e14; --tt-bg-alt:#0d1219; --tt-panel:#111823; --tt-border:#1e2a3a;
  --tt-text:#c9d1d9; --tt-text-dim:#7d8590; --tt-accent:#39d353; --tt-accent-dim:rgba(57,211,83,0.12);
  background:var(--tt-bg); color:var(--tt-text); font-family:'JetBrains Mono','Fira Code',monospace;
}
.tt-root h1,.tt-root h2,.tt-root h3,.tt-root h4{font-family:'Inter',sans-serif; color:#fff;}
.tt-root a{color:inherit; text-decoration:none;}
.tt-container{max-width:1100px; margin:0 auto; padding:0 24px;}
.tt-header{position:sticky; top:0; z-index:100; background:rgba(10,14,20,0.85); backdrop-filter:blur(10px); border-bottom:1px solid var(--tt-border);}
.tt-nav{display:flex; align-items:center; justify-content:space-between; padding:16px 24px;}
.tt-logo{font-weight:700; color:var(--tt-accent); font-size:16px;}
.tt-nav-links{display:flex; gap:22px; list-style:none;}
.tt-nav-links a{font-size:12.5px; color:var(--tt-text-dim); display:flex; gap:4px;}
.tt-nav-links a:hover{color:var(--tt-accent);}
.tt-idx{color:var(--tt-accent); opacity:.7;}
.tt-hero{padding:110px 0 90px; border-bottom:1px solid var(--tt-border);}
.tt-hero-inner{max-width:720px;}
.tt-badge{display:inline-block; padding:6px 14px; border:1px solid var(--tt-accent); border-radius:999px; color:var(--tt-accent); font-size:12px; margin-bottom:24px; background:var(--tt-accent-dim);}
.tt-root h1{font-size:clamp(28px,5vw,48px); font-weight:800; margin-bottom:18px; line-height:1.25; overflow-wrap:break-word;}
.tt-accent{color:var(--tt-accent);}
.tt-typeline{font-size:18px; color:var(--tt-text-dim); margin-bottom:22px; min-height:26px;}
.tt-prompt{color:var(--tt-accent);}
.tt-cursor{animation:tt-blink 1s step-end infinite;}
@keyframes tt-blink{50%{opacity:0;}}
.tt-summary{color:var(--tt-text-dim); font-size:15px; line-height:1.75; max-width:560px; margin-bottom:32px;}
.tt-btn-row{display:flex; gap:14px; margin-bottom:28px; flex-wrap:wrap;}
.tt-btn{padding:12px 24px; border-radius:8px; font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid transparent;}
.tt-btn-primary{background:var(--tt-accent); color:#0a0e14;}
.tt-btn-outline{border-color:var(--tt-border); color:var(--tt-text);}
.tt-link-row{display:flex; gap:18px; flex-wrap:wrap; font-size:12.5px; color:var(--tt-text-dim);}
.tt-link-row a:hover{color:var(--tt-accent);}
.tt-section{padding:80px 0;}
.tt-section-alt{background:var(--tt-bg-alt);}
.tt-section-head{display:flex; align-items:baseline; gap:12px; margin-bottom:40px;}
.tt-section-index{color:var(--tt-accent); font-size:14px; font-weight:600;}
.tt-section-head h2{font-size:26px; font-weight:800;}
.tt-reveal{opacity:0; transform:translateY(24px); transition:opacity .6s ease, transform .6s ease;}
.tt-reveal.in-view{opacity:1; transform:translateY(0);}
.tt-about-grid{display:grid; grid-template-columns:1.3fr 0.7fr; gap:40px; align-items:start;}
.tt-about-text{color:var(--tt-text-dim); font-size:15px; line-height:1.8;}
.tt-stats{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
.tt-stat{padding:18px; border:1px solid var(--tt-border); border-radius:10px; text-align:center;}
.tt-stat-num{font-size:24px; font-weight:800; color:var(--tt-accent);}
.tt-stat-label{font-size:11px; color:var(--tt-text-dim); margin-top:4px; text-transform:uppercase; letter-spacing:.05em;}
.tt-skills-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:22px;}
.tt-skill-block{padding:20px; border:1px solid var(--tt-border); border-radius:10px;}
.tt-skill-block h3{font-size:14px; margin-bottom:14px; color:var(--tt-accent);}
.tt-chip-row{display:flex; flex-wrap:wrap; gap:8px;}
.tt-chip{padding:5px 12px; background:var(--tt-panel); border:1px solid var(--tt-border); border-radius:6px; font-size:12px;}
.tt-project-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px;}
.tt-project-card{padding:24px; border:1px solid var(--tt-border); border-radius:12px; background:var(--tt-panel); transition:transform .2s, border-color .2s;}
.tt-project-card:hover{transform:translateY(-4px); border-color:var(--tt-accent);}
.tt-project-top{display:flex; justify-content:space-between; margin-bottom:14px; font-size:18px;}
.tt-project-link{color:var(--tt-accent); font-size:16px;}
.tt-project-card h3{font-size:16px; margin-bottom:8px;}
.tt-project-card p{color:var(--tt-text-dim); font-size:13.5px; line-height:1.6; margin-bottom:12px;}
.tt-tech-line{font-size:11.5px; color:var(--tt-accent); font-family:monospace;}
.tt-timeline{max-width:760px;}
.tt-tl-item{display:flex; gap:20px; padding-bottom:32px; position:relative;}
.tt-tl-item::before{content:""; position:absolute; left:5px; top:16px; bottom:0; width:1px; background:var(--tt-border);}
.tt-tl-item:last-child::before{display:none;}
.tt-tl-dot{width:11px; height:11px; border-radius:50%; background:var(--tt-accent); margin-top:5px; flex-shrink:0; z-index:1;}
.tt-tl-duration{font-size:11.5px; color:var(--tt-accent); margin-bottom:4px;}
.tt-tl-content h3{font-size:16px; margin-bottom:4px;}
.tt-tl-org{font-size:13px; color:var(--tt-text-dim); margin-bottom:10px;}
.tt-tl-score{font-size:13px; color:var(--tt-accent); font-weight:600;}
.tt-tl-content ul{padding-left:16px; margin:0;}
.tt-tl-content ul li{color:var(--tt-text-dim); font-size:13.5px; line-height:1.7; list-style:disc;}
.tt-cert-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px;}
.tt-cert-card{padding:20px; border:1px solid var(--tt-border); border-radius:10px;}
.tt-cert-card h4{font-size:14px; margin-bottom:6px;}
.tt-cert-meta{font-size:12px; color:var(--tt-text-dim); margin-bottom:8px;}
.tt-cert-card p{font-size:13px; color:var(--tt-text-dim); line-height:1.6;}
.tt-cert-card a{color:var(--tt-accent); font-size:12.5px; font-weight:600;}
.tt-profile-row{display:flex; flex-wrap:wrap; gap:12px;}
.tt-profile-pill{padding:10px 20px; border:1px solid var(--tt-border); border-radius:999px; font-size:13px; text-transform:capitalize;}
.tt-profile-pill:hover{border-color:var(--tt-accent); color:var(--tt-accent);}
.tt-contact-grid{display:grid; grid-template-columns:0.9fr 1.1fr; gap:40px;}
.tt-contact-info p{color:var(--tt-text-dim); font-size:14px; line-height:1.7; margin-bottom:20px;}
.tt-contact-row{font-size:13.5px; margin-bottom:12px; display:flex; gap:10px; align-items:center;}
.tt-contact-row a:hover{color:var(--tt-accent);}
.tt-contact-form{display:flex; flex-direction:column; gap:14px;}
.tt-contact-form input, .tt-contact-form textarea{padding:12px 14px; background:var(--tt-panel); border:1px solid var(--tt-border); border-radius:8px; color:var(--tt-text); font-family:inherit; font-size:13.5px; outline:none;}
.tt-contact-form textarea{min-height:100px; resize:vertical;}
.tt-footer{padding:26px 0; border-top:1px solid var(--tt-border); text-align:center; color:var(--tt-text-dim); font-size:12.5px;}
@media(max-width:800px){
  .tt-about-grid, .tt-contact-grid{grid-template-columns:1fr;}
  .tt-nav-links{display:none;}
}
`;

export default TemplateTerminal;