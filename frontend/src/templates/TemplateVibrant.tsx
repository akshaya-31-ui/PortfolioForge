import {useEffect, useState} from "react";
import type { ParsedResume } from "../api";
import { sendContactMessage, getErrorMessage } from "../api";

interface Props {
    data: ParsedResume;
    slug: string;
}
const PALETTE = ["#ff5d8f", "#6c5ce7", "#00cec9", "#fdcb6e", "#0984e3", "#e17055"];
function TemplateVibrant({ data, slug }: Props) {
    const initial = data.name?.trim()?.charAt(0)?.toUpperCase() || "?";
    const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [contactError, setContactError] = useState<string | null>(null);
    const knownLinkKeys = ["github", "linkedin", "portfolio", "email"];
    const otherPlatforms = Object.entries(data.links || {}).filter(
        ([key, value]) => !knownLinkKeys.includes(key.toLowerCase()) && value
    );

    useEffect(() => {
        const revealEls = document.querySelectorAll(".tv-reveal");
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
    <form className="tv-contact-form" onSubmit={handleContactSubmit}>
        <input type="text" name="name" placeholder="Your name" required />
        <input type="email" name="email" placeholder="Your email" required />
        <textarea name="message" placeholder="Say something nice ✨" required />
        <button type="submit" className="tv-btn tv-btn-fill" disabled={contactStatus === "sending"}>
            {contactStatus === "sending" ? "Sending..." : "Send It →"}
        </button>
        {contactStatus === "success" && <p style={{ color: "#00cec9", fontSize: 13, marginTop: 10 }}>Message sent! Thanks for reaching out.</p>}
        {contactStatus === "error" && <p style={{ color: "#ff5d8f", fontSize: 13, marginTop: 10 }}>{contactError}</p>}
    </form>
    return (
        <div className="tv-root">
            <style>{tvStyles}</style>

            <div className="tv-blob tv-blob-1" />
            <div className="tv-blob tv-blob-2" />
            <div className="tv-blob tv-blob-3" />

            <header className="tv-header">
                <div className="tv-container tv-nav">
                    <div className="tv-brand">
                        <div className="tv-brand-mark">{initial}</div>
                        <span>{data.name}</span>
                    </div>
                    <nav className="tv-nav-links">
                        <a href="#tv-skills">Skills</a>
                        <a href="#tv-projects">Projects</a>
                        <a href="#tv-experience">Experience</a>
                        <a href="#tv-contact">Contact</a>
                    </nav>
                </div>
            </header>

            <section className="tv-hero">
                <div className="tv-container tv-hero-inner">
                    <div className="tv-pill">✦ {data.title}</div>
                    <h1>
                        Hey, I'm <span className="tv-gradient-text">{data.name?.split(" ")[0]}</span> 👋
                    </h1>
                    <p className="tv-summary">{data.summary}</p>
                    <div className="tv-btn-row">
                        <a href="#tv-projects" className="tv-btn tv-btn-fill">See My Work</a>
                        <a href="#tv-contact" className="tv-btn tv-btn-ghost">Let's Talk</a>
                    </div>
                </div>
            </section>

            {data.skillCategories?.length > 0 && (
                <section id="tv-skills" className="tv-section">
                    <div className="tv-container">
                        <TVHead emoji="🛠" title="What I Work With" />
                        <div className="tv-skills-grid">
                            {data.skillCategories.map((cat, i) => (
                                <div
                                    className="tv-skill-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <h3>{cat.category}</h3>
                                    <div className="tv-chip-row">
                                        {cat.skills.map((s, j) => (
                                            <span className="tv-chip" key={j}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.projects?.length > 0 && (
                <section id="tv-projects" className="tv-section tv-section-shade">
                    <div className="tv-container">
                        <TVHead emoji="🚀" title="Things I've Built" />
                        <div className="tv-project-grid">
                            {data.projects.map((proj, i) => (
                                <div
                                    className="tv-project-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <div className="tv-project-glow" />
                                    <h3>{proj.title}</h3>
                                    <p>{proj.description}</p>
                                    {proj.techStack && (
                                        <div className="tv-chip-row">
                                            {proj.techStack.split(",").map((t, j) => (
                                                <span className="tv-chip tv-chip-sm" key={j}>{t.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="tv-project-link">
                                            Check it out →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.experience?.length > 0 && (
                <section id="tv-experience" className="tv-section">
                    <div className="tv-container">
                        <TVHead emoji="💼" title="Where I've Worked" />
                        <div className="tv-exp-list">
                            {data.experience.map((exp, i) => (
                                <div
                                    className="tv-exp-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <div className="tv-exp-badge">{exp.duration}</div>
                                    <h3>{exp.role}</h3>
                                    <div className="tv-exp-org">{exp.company}</div>
                                    {exp.highlights?.length > 0 && (
                                        <ul>
                                            {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.education?.length > 0 && (
                <section className="tv-section tv-section-shade">
                    <div className="tv-container">
                        <TVHead emoji="🎓" title="Education" />
                        <div className="tv-edu-grid">
                            {data.education.map((edu, i) => (
                                <div
                                    className="tv-edu-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <div className="tv-edu-year">{edu.year}</div>
                                    <h3>{edu.degree}</h3>
                                    <div className="tv-exp-org">{edu.school}</div>
                                    {edu.score && <div className="tv-edu-score">{edu.score}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.certifications?.length > 0 && (
                <section className="tv-section">
                    <div className="tv-container">
                        <TVHead emoji="🏅" title="Certifications" />
                        <div className="tv-edu-grid">
                            {data.certifications.map((cert, i) => (
                                <div
                                    className="tv-edu-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <h3>{cert.name}</h3>
                                    <div className="tv-exp-org">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>
                                    {cert.credentialUrl && (
                                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="tv-project-link">
                                            View Credential →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.achievements?.length > 0 && (
                <section className="tv-section tv-section-shade">
                    <div className="tv-container">
                        <TVHead emoji="🏆" title="Achievements" />
                        <div className="tv-edu-grid">
                            {data.achievements.map((ach, i) => (
                                <div
                                    className="tv-edu-card tv-reveal"
                                    key={i}
                                    style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                                    <h3>{ach.title}</h3>
                                    <p style={{ fontSize: 13.5, color: "var(--tv-text-dim)" }}>{ach.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {otherPlatforms.length > 0 && (
                <section className="tv-section">
                    <div className="tv-container">
                        <TVHead emoji="🔗" title="Find Me Elsewhere" />
                        <div className="tv-platform-row tv-reveal">
                            {otherPlatforms.map(([key, url], i) => (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tv-platform-pill"
                                style={{ ["--tv-c" as any]: PALETTE[i % PALETTE.length] }}
                                >
                            {key}
                                </a>
                                ))}
                        </div>
                    </div>
                </section>
            )}

<section id="tv-contact" className="tv-section tv-section-shade">
    <div className="tv-container">
        <TVHead emoji="💌" title="Let's Connect" />
        <div className="tv-contact-grid tv-reveal">
            <div className="tv-contact-info">
                <p>Got a project, role, or just want to say hi? I'd love to hear from you.</p>
                {data.links?.email && <div className="tv-contact-row">✉️ <a href={`mailto:${data.links.email}`}>{data.links.email}</a></div>}
                {data.phone && <div className="tv-contact-row">📱 <a href={`tel:${data.phone}`}>{data.phone}</a></div>}
                {data.location && <div className="tv-contact-row">📍 {data.location}</div>}
                <div className="tv-social-row">
                    {data.links?.github && <a href={data.links.github} target="_blank" rel="noopener noreferrer" className="tv-social-btn">GitHub</a>}
                    {data.links?.linkedin && <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer" className="tv-social-btn">LinkedIn</a>}
                    {data.links?.portfolio && <a href={data.links.portfolio} target="_blank" rel="noopener noreferrer" className="tv-social-btn">Portfolio</a>}
                </div>
            </div>
            <form className="tv-contact-form" onSubmit={handleContactSubmit}>
                <input type="text" placeholder="Your name" required />
                <input type="email" placeholder="Your email" required />
                <textarea placeholder="Say something nice ✨" required />
                <button type="submit" className="tv-btn tv-btn-fill">Send It →</button>
            </form>
        </div>
    </div>
</section>

<footer className="tv-footer">
    <div className="tv-container">
        Made with 💜 by {data.name} · © {new Date().getFullYear()}
    </div>
</footer>
</div>
);
}

function TVHead({ emoji, title }: { emoji: string; title: string }) {
    return (
        <div className="tv-section-head tv-reveal">
            <span className="tv-emoji">{emoji}</span>
            <h2>{title}</h2>
        </div>
    );
}

const tvStyles = `
.tv-root{
  --tv-bg:#0f0b1e; --tv-bg-shade:#150f28; --tv-text:#f5f3ff; --tv-text-dim:#b3aed1; --tv-panel:rgba(255,255,255,0.05); --tv-border:rgba(255,255,255,0.1);
  background:var(--tv-bg); color:var(--tv-text); font-family:'Poppins','Inter',sans-serif; position:relative; overflow-x:hidden;
}
.tv-root h1,.tv-root h2,.tv-root h3{font-family:'Poppins',sans-serif; font-weight:800; color:#fff;}
.tv-root a{color:inherit; text-decoration:none;}
.tv-container{max-width:1140px; margin:0 auto; padding:0 26px; position:relative; z-index:1;}
.tv-blob{position:absolute; border-radius:50%; filter:blur(80px); opacity:.35; z-index:0; pointer-events:none;}
.tv-blob-1{width:420px; height:420px; background:#ff5d8f; top:-120px; right:-100px;}
.tv-blob-2{width:380px; height:380px; background:#6c5ce7; top:600px; left:-140px;}
.tv-blob-3{width:340px; height:340px; background:#00cec9; bottom:200px; right:-120px;}
.tv-header{position:sticky; top:0; z-index:100; backdrop-filter:blur(14px); background:rgba(15,11,30,0.65); border-bottom:1px solid var(--tv-border);}
.tv-nav{display:flex; justify-content:space-between; align-items:center; padding:16px 26px;}
.tv-brand{display:flex; align-items:center; gap:10px; font-weight:700; font-size:15px;}
.tv-brand-mark{width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#ff5d8f,#6c5ce7); display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:14px;}
.tv-nav-links{display:flex; gap:24px; font-size:13.5px; font-weight:600;}
.tv-nav-links a:hover{color:#ff9fbb;}
.tv-hero{padding:110px 0 90px; text-align:center;}
.tv-hero-inner{max-width:680px; margin:0 auto;}
.tv-pill{display:inline-block; padding:8px 18px; border-radius:999px; background:var(--tv-panel); border:1px solid var(--tv-border); font-size:13px; font-weight:600; margin-bottom:26px;}
.tv-root h1{font-size:clamp(32px,6vw,52px); line-height:1.15; margin-bottom:20px;}
.tv-gradient-text{background:linear-gradient(135deg,#ff5d8f,#6c5ce7,#00cec9); -webkit-background-clip:text; background-clip:text; color:transparent;}
.tv-summary{color:var(--tv-text-dim); font-size:16px; line-height:1.8; margin-bottom:34px;}
.tv-btn-row{display:flex; gap:16px; justify-content:center; flex-wrap:wrap;}
.tv-btn{padding:14px 30px; border-radius:12px; font-weight:700; font-size:14px; cursor:pointer; border:1px solid transparent;}
.tv-btn-fill{background:linear-gradient(135deg,#ff5d8f,#6c5ce7); color:#fff;}
.tv-btn-ghost{border-color:var(--tv-border); background:var(--tv-panel);}
.tv-section{padding:80px 0;}
.tv-section-shade{background:var(--tv-bg-shade);}
.tv-section-head{display:flex; align-items:center; gap:12px; margin-bottom:42px;}
.tv-emoji{font-size:26px;}
.tv-section-head h2{font-size:26px;}
.tv-reveal{opacity:0; transform:translateY(26px) scale(.97); transition:opacity .6s ease, transform .6s ease;}
.tv-reveal.in-view{opacity:1; transform:translateY(0) scale(1);}
.tv-skills-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:22px;}
.tv-skill-card{padding:24px; border-radius:16px; background:var(--tv-panel); border:1px solid var(--tv-border); border-top:3px solid var(--tv-c);}
.tv-skill-card h3{font-size:15px; margin-bottom:14px;}
.tv-chip-row{display:flex; flex-wrap:wrap; gap:8px;}
.tv-chip{padding:6px 13px; border-radius:999px; background:rgba(255,255,255,0.08); font-size:12px; font-weight:600;}
.tv-chip-sm{font-size:11px; padding:4px 10px;}
.tv-project-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px;}
.tv-project-card{padding:26px; border-radius:18px; background:var(--tv-panel); border:1px solid var(--tv-border); position:relative; overflow:hidden;}
.tv-project-glow{position:absolute; top:-40px; right:-40px; width:100px; height:100px; border-radius:50%; background:var(--tv-c); filter:blur(40px); opacity:.5;}
.tv-project-card h3{font-size:17px; margin-bottom:10px; position:relative;}
.tv-project-card p{color:var(--tv-text-dim); font-size:13.5px; line-height:1.7; margin-bottom:14px; position:relative;}
.tv-project-link{color:var(--tv-c); font-weight:700; font-size:13px; display:inline-block; margin-top:12px; position:relative;}
.tv-exp-list{display:flex; flex-direction:column; gap:20px;}
.tv-exp-card{padding:24px; border-radius:16px; background:var(--tv-panel); border:1px solid var(--tv-border); border-left:4px solid var(--tv-c);}
.tv-exp-badge{display:inline-block; font-size:11.5px; font-weight:700; color:var(--tv-c); margin-bottom:10px;}
.tv-exp-card h3{font-size:17px; margin-bottom:4px;}
.tv-exp-org{font-size:13.5px; color:var(--tv-text-dim); margin-bottom:12px;}
.tv-exp-card ul{padding-left:18px; margin:0;}
.tv-exp-card ul li{color:var(--tv-text-dim); font-size:13.5px; line-height:1.75;}
.tv-edu-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px;}
.tv-edu-card{padding:22px; border-radius:16px; background:var(--tv-panel); border:1px solid var(--tv-border); border-top:3px solid var(--tv-c);}
.tv-edu-year{font-size:11.5px; font-weight:700; color:var(--tv-c); margin-bottom:8px;}
.tv-edu-card h3{font-size:15px; margin-bottom:6px;}
.tv-edu-score{font-size:13px; font-weight:700; color:var(--tv-c); margin-top:8px;}
.tv-platform-row{display:flex; flex-wrap:wrap; gap:14px;}
.tv-platform-pill{padding:12px 24px; border-radius:999px; background:var(--tv-panel); border:1px solid var(--tv-c); color:var(--tv-c); font-weight:700; font-size:13.5px; text-transform:capitalize;}
.tv-contact-grid{display:grid; grid-template-columns:0.9fr 1.1fr; gap:44px;}
.tv-contact-info p{color:var(--tv-text-dim); font-size:15px; line-height:1.8; margin-bottom:20px;}
.tv-contact-row{font-size:14px; margin-bottom:12px; display:flex; gap:10px; align-items:center;}
.tv-social-row{display:flex; gap:12px; margin-top:18px;}
.tv-social-btn{padding:10px 20px; border-radius:10px; background:var(--tv-panel); border:1px solid var(--tv-border); font-weight:600; font-size:13px;}
.tv-contact-form{display:flex; flex-direction:column; gap:14px;}
.tv-contact-form input, .tv-contact-form textarea{padding:13px 16px; border-radius:12px; background:var(--tv-panel); border:1px solid var(--tv-border); color:var(--tv-text); font-family:inherit; font-size:14px; outline:none;}
.tv-contact-form textarea{min-height:100px; resize:vertical;}
.tv-footer{padding:28px 0; text-align:center; color:var(--tv-text-dim); font-size:13px; border-top:1px solid var(--tv-border);}
@media(max-width:800px){
  .tv-contact-grid{grid-template-columns:1fr;}
  .tv-nav-links{display:none;}
}
`;

export default TemplateVibrant;