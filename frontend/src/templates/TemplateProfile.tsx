import {useEffect, useState} from "react";
import type { ParsedResume } from "../api";
import { sendContactMessage, getErrorMessage } from "../api";

interface Props {
    data: ParsedResume;
    slug: string;
}
function TemplateProfile({ data, slug }: Props) {
    const initial = data.name?.trim()?.charAt(0)?.toUpperCase() || "?";
    const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [contactError, setContactError] = useState<string | null>(null);
    const knownLinkKeys = ["github", "linkedin", "portfolio", "email"];
    const otherPlatforms = Object.entries(data.links || {}).filter(
        ([key, value]) => !knownLinkKeys.includes(key.toLowerCase()) && value
    );

    useEffect(() => {
        const revealEls = document.querySelectorAll(".tp-reveal");
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
    <form className="tp-contact-form tp-reveal" onSubmit={handleContactSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <textarea name="message" placeholder="Message" required />
        <button type="submit" className="tp-btn" disabled={contactStatus === "sending"}>
            {contactStatus === "sending" ? "Sending..." : "Send"}
        </button>
        {contactStatus === "success" && <p style={{ color: "var(--tp-accent)", fontSize: 13, marginTop: 10 }}>Message sent! Thanks for reaching out.</p>}
        {contactStatus === "error" && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{contactError}</p>}
    </form>

    return (
        <div className="tp-root">
            <style>{tpStyles}</style>

            <header className="tp-header">
                <div className="tp-container tp-nav">
                    <span className="tp-brand">{data.name}</span>
                    <nav className="tp-nav-links">
                        <a href="#tp-about">About</a>
                        <a href="#tp-resume">Resume</a>
                        <a href="#tp-work">Projects</a>
                        <a href="#tp-contact">Contact</a>
                    </nav>
                </div>
            </header>

            <section id="tp-home" className="tp-hero">
                <div className="tp-hero-bg" aria-hidden="true">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i}>PORTFOLIO</span>
                    ))}
                </div>
                <div className="tp-container tp-hero-inner">
                    <div className="tp-hero-left tp-reveal">
                        <p className="tp-eyebrow">{data.title}</p>
                        <h1>Hello, I'm {data.name?.split(" ")[0]}!</h1>
                        <p className="tp-summary">{data.summary}</p>
                        <div className="tp-link-row">
                            {data.links?.linkedin && (
                                <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer" className="tp-btn">
                                    🔍 View LinkedIn
                                </a>
                            )}
                            {data.links?.github && (
                                <a href={data.links.github} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-outline">
                                    💻 GitHub
                                </a>
                            )}
                            {data.links?.portfolio && (
                                <a href={data.links.portfolio} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-outline">
                                    🌐 Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="tp-profile-card tp-reveal">
                        <div className="tp-avatar">{initial}</div>
                        <h3>{data.name}</h3>
                        <div className="tp-profile-title">{data.title}</div>
                        <div className="tp-profile-rows">
                            {data.location && <div className="tp-profile-row">📍 {data.location}</div>}
                            {data.links?.email && <div className="tp-profile-row">✉️ {data.links.email}</div>}
                            {data.phone && <div className="tp-profile-row">📞 {data.phone}</div>}
                        </div>
                    </div>
                </div>
            </section>

            {data.education?.length > 0 && (
                <section id="tp-resume" className="tp-section">
                    <div className="tp-container">
                        <TPHead title="Education" />
                        <div className="tp-timeline tp-reveal">
                            {data.education.map((edu, i) => (
                                <div className="tp-tl-item" key={i}>
                                    <div className="tp-tl-year">{edu.year}</div>
                                    <div className="tp-tl-body">
                                        <h4>{edu.degree}</h4>
                                        <div className="tp-tl-sub">{edu.school}</div>
                                        {edu.score && <div className="tp-tl-score">{edu.score}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.experience?.length > 0 && (
                <section className="tp-section tp-section-shade">
                    <div className="tp-container">
                        <TPHead title="Experience" />
                        <div className="tp-timeline tp-reveal">
                            {data.experience.map((exp, i) => (
                                <div className="tp-tl-item" key={i}>
                                    <div className="tp-tl-year">{exp.duration}</div>
                                    <div className="tp-tl-body">
                                        <h4>{exp.role}</h4>
                                        <div className="tp-tl-sub">{exp.company}</div>
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

            {data.skillCategories?.length > 0 && (
                <section className="tp-section">
                    <div className="tp-container">
                        <TPHead title="Technical Skills" />
                        <div className="tp-skills-grid">
                            {data.skillCategories.map((cat, i) => (
                                <div className="tp-skill-block tp-reveal" key={i}>
                                    <h4>{cat.category}</h4>
                                    <div className="tp-chip-row">
                                        {cat.skills.map((s, j) => <span className="tp-chip" key={j}>{s}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.certifications?.length > 0 && (
                <section className="tp-section tp-section-shade">
                    <div className="tp-container">
                        <TPHead title="Certifications" />
                        <div className="tp-cert-grid">
                            {data.certifications.map((cert, i) => (
                                <div className="tp-cert-card tp-reveal" key={i}>
                                    <h4>{cert.name}</h4>
                                    <div className="tp-tl-sub">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>
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
                <section className="tp-section">
                    <div className="tp-container">
                        <TPHead title="Achievements" />
                        <div className="tp-cert-grid">
                            {data.achievements.map((ach, i) => (
                                <div className="tp-cert-card tp-reveal" key={i}>
                                    <h4>{ach.title}</h4>
                                    <p>{ach.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {data.projects?.length > 0 && (
                <section id="tp-work" className="tp-section tp-section-shade">
                    <div className="tp-container">
                        <TPHead title="Projects Done" />
                        <div className="tp-project-grid">
                            {data.projects.map((proj, i) => (
                                <div className="tp-project-card tp-reveal" key={i}>
                                    <h4>{proj.title}</h4>
                                    {proj.techStack && <div className="tp-tools-line">Tools used: {proj.techStack}</div>}
                                    <p>{proj.description}</p>
                                    {proj.link && (
                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="tp-project-link">View →</a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {otherPlatforms.length > 0 && (
                <section className="tp-section">
                    <div className="tp-container">
                        <TPHead title="Find Me Elsewhere" />
                        <div className="tp-link-row tp-reveal">
                            {otherPlatforms.map(([key, url], i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="tp-btn tp-btn-outline">
                                    {key}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section id="tp-contact" className="tp-section tp-section-shade">
                <div className="tp-container">
                    <TPHead title="Get in Touch" />
                    <form className="tp-contact-form tp-reveal" onSubmit={handleContactSubmit}>
                        <input type="text" placeholder="Name" required />
                        <input type="email" placeholder="Email" required />
                        <textarea placeholder="Message" required />
                        <button type="submit" className="tp-btn">Send</button>
                    </form>
                </div>
            </section>

            <footer className="tp-footer">
                <div className="tp-container">
                    © {new Date().getFullYear()} {data.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

function TPHead({ title }: { title: string }) {
    return (
        <div className="tp-section-head tp-reveal">
            <h2>{title}</h2>
            <div className="tp-underline" />
        </div>
    );
}

const tpStyles = `
.tp-root{
  --tp-bg:#ffffff; --tp-bg-shade:#f6f5f2; --tp-text:#20201d; --tp-text-dim:#6f6c63; --tp-accent:#c9a95c; --tp-border:#e7e4dc;
  background:var(--tp-bg); color:var(--tp-text); font-family:'Inter',sans-serif;
}
.tp-root h1,.tp-root h2,.tp-root h3,.tp-root h4{font-family:'Playfair Display',serif; color:var(--tp-text);}
.tp-root a{color:inherit; text-decoration:none;}
.tp-container{max-width:1120px; margin:0 auto; padding:0 26px; position:relative; z-index:1;}
.tp-header{padding:18px 0; border-bottom:1px solid var(--tp-border); position:sticky; top:0; background:rgba(255,255,255,0.9); backdrop-filter:blur(8px); z-index:50;}
.tp-nav{display:flex; justify-content:space-between; align-items:center;}
.tp-brand{font-family:'Playfair Display',serif; font-weight:700; font-size:17px;}
.tp-nav-links{display:flex; gap:26px; font-size:13.5px; font-weight:600;}
.tp-nav-links a:hover{color:var(--tp-accent);}
.tp-hero{position:relative; padding:100px 0 80px; overflow:hidden;}
.tp-hero-bg{position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; opacity:.05; z-index:0; pointer-events:none;}
.tp-hero-bg span{font-family:'Playfair Display',serif; font-size:110px; font-weight:800; white-space:nowrap; line-height:1;}
.tp-hero-inner{display:grid; grid-template-columns:1.3fr 0.8fr; gap:50px; align-items:center;}
.tp-eyebrow{text-transform:uppercase; letter-spacing:.12em; font-size:12px; color:var(--tp-accent); font-weight:700; margin-bottom:16px;}
.tp-root h1{font-size:clamp(28px,4.5vw,44px); margin-bottom:18px;}
.tp-summary{color:var(--tp-text-dim); font-size:15.5px; line-height:1.8; margin-bottom:26px; max-width:520px;}
.tp-btn{display:inline-block; padding:12px 26px; background:var(--tp-text); color:#fff; border-radius:8px; font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid var(--tp-text);}
.tp-btn-outline{background:transparent; color:var(--tp-text); text-transform:capitalize;}
.tp-profile-card{background:#fff; border:1px solid var(--tp-border); border-radius:18px; padding:32px; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.06);}
.tp-avatar{width:76px; height:76px; border-radius:50%; background:linear-gradient(135deg,var(--tp-accent),#e8cf94); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:#fff; margin:0 auto 16px;}
.tp-profile-card h3{font-size:18px; margin-bottom:4px;}
.tp-profile-title{color:var(--tp-text-dim); font-size:13px; margin-bottom:18px;}
.tp-profile-rows{display:flex; flex-direction:column; gap:10px; text-align:left; font-size:13px; color:var(--tp-text-dim); border-top:1px solid var(--tp-border); padding-top:16px;}
.tp-section{padding:76px 0;}
.tp-section-shade{background:var(--tp-bg-shade);}
.tp-section-head{margin-bottom:40px;}
.tp-section-head h2{font-size:26px; margin-bottom:10px;}
.tp-underline{width:50px; height:3px; background:var(--tp-accent);}
.tp-reveal{opacity:0; transform:translateY(22px); transition:opacity .6s ease, transform .6s ease;}
.tp-reveal.in-view{opacity:1; transform:translateY(0);}
.tp-timeline{display:flex; flex-direction:column; gap:0; max-width:800px;}
.tp-tl-item{display:grid; grid-template-columns:130px 1fr; gap:24px; padding:22px 0; border-bottom:1px solid var(--tp-border);}
.tp-tl-item:last-child{border-bottom:none;}
.tp-tl-year{font-size:13px; font-weight:700; color:var(--tp-accent);}
.tp-tl-body h4{font-size:17px; margin-bottom:4px; font-family:'Inter',sans-serif; font-weight:700;}
.tp-tl-sub{color:var(--tp-text-dim); font-size:14px;}
.tp-tl-score{color:var(--tp-accent); font-weight:700; font-size:13px; margin-top:6px;}
.tp-tl-body ul{margin:10px 0 0; padding-left:18px;}
.tp-tl-body ul li{color:var(--tp-text-dim); font-size:13.5px; line-height:1.7;}
.tp-skills-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:22px;}
.tp-skill-block{padding:22px; border:1px solid var(--tp-border); border-radius:14px; background:#fff;}
.tp-skill-block h4{font-size:14px; margin-bottom:14px; font-family:'Inter',sans-serif; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--tp-accent);}
.tp-chip-row{display:flex; flex-wrap:wrap; gap:8px;}
.tp-chip{padding:6px 13px; border-radius:8px; background:var(--tp-bg-shade); font-size:12px; font-weight:600; border:1px solid var(--tp-border);}
.tp-cert-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px;}
.tp-cert-card{padding:22px; border:1px solid var(--tp-border); border-radius:14px; background:#fff;}
.tp-cert-card h4{font-size:15px; margin-bottom:6px; font-family:'Inter',sans-serif; font-weight:700;}
.tp-cert-card p{color:var(--tp-text-dim); font-size:13.5px; line-height:1.6; margin-top:6px;}
.tp-cert-card a{color:var(--tp-accent); font-size:12.5px; font-weight:700;}
.tp-project-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px;}
.tp-project-card{padding:26px; border:1px solid var(--tp-border); border-radius:16px; background:#fff;}
.tp-project-card h4{font-size:17px; margin-bottom:8px; font-family:'Inter',sans-serif; font-weight:700;}
.tp-tools-line{font-size:11.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--tp-accent); font-weight:700; margin-bottom:10px;}
.tp-project-card p{color:var(--tp-text-dim); font-size:13.5px; line-height:1.7; margin-bottom:12px;}
.tp-project-link{color:var(--tp-accent); font-weight:700; font-size:13px;}
.tp-link-row{display:flex; gap:14px; flex-wrap:wrap;}
.tp-contact-form{display:flex; flex-direction:column; gap:14px; max-width:520px;}
.tp-contact-form input, .tp-contact-form textarea{padding:13px 16px; border-radius:10px; border:1px solid var(--tp-border); background:#fff; color:var(--tp-text); font-family:inherit; font-size:14px; outline:none;}
.tp-contact-form textarea{min-height:100px; resize:vertical;}
.tp-footer{padding:26px 0; border-top:1px solid var(--tp-border); text-align:center; color:var(--tp-text-dim); font-size:12.5px;}
@media(max-width:840px){
  .tp-hero-inner{grid-template-columns:1fr;}
  .tp-tl-item{grid-template-columns:1fr;}
  .tp-nav-links{display:none;}
  .tp-hero-bg span{font-size:70px;}
}
`;

export default TemplateProfile;