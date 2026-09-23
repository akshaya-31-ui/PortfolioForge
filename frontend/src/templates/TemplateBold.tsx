import { useEffect, useState } from "react";
import type {ParsedResume} from "../api";
import { sendContactMessage, getErrorMessage } from "../api";

interface Props {
    data: ParsedResume;
    slug: string;
}
function TemplateBold({ data, slug}: Props) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [contactError, setContactError] = useState<string | null>(null);
    const initial = data.name?.trim()?.charAt(0)?.toUpperCase() || "?";

    const knownLinkKeys = ["github", "linkedin", "portfolio"];
    const otherPlatforms = Object.entries(data.links || {}).filter(
        ([key, value]) => !knownLinkKeys.includes(key.toLowerCase()) && value
    );

    useEffect(() => {
        const headerEl = document.querySelector(".tb-header");
        const onScroll = () => {
            headerEl?.classList.toggle("scrolled", window.scrollY > 30);
        };
        window.addEventListener("scroll", onScroll);

        const revealEls = document.querySelectorAll(".tb-reveal, .tb-reveal-left, .tb-reveal-right");
        const parentCounters = new WeakMap<Element, number>();
        revealEls.forEach((el) => {
            const parent = el.parentElement as Element;
            const n = parentCounters.get(parent) || 0;
            (el as HTMLElement).style.setProperty("--d", String(n));
            parentCounters.set(parent, n + 1);
        });

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );
        revealEls.forEach((el) => io.observe(el));

        const particleWrap = document.getElementById("tb-particles");
        if (particleWrap) {
            const count = window.innerWidth < 700 ? 14 : 26;
            for (let i = 0; i < count; i++) {
                const p = document.createElement("div");
                p.className = "tb-particle";
                const size = 3 + Math.random() * 6;
                p.style.width = size + "px";
                p.style.height = size + "px";
                p.style.left = Math.random() * 100 + "%";
                p.style.setProperty("--drift", Math.random() * 80 - 40 + "px");
                p.style.animationDuration = 8 + Math.random() * 10 + "s";
                p.style.animationDelay = Math.random() * 10 + "s";
                particleWrap.appendChild(p);
            }
        }

        const tiltCards = document.querySelectorAll<HTMLElement>(".tb-tilt");
        const tiltHandler = (e: MouseEvent, card: HTMLElement) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `translateY(-6px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
        };
        const leaveHandler = (card: HTMLElement) => {
            card.style.transform = "";
        };
        tiltCards.forEach((card) => {
            const move = (e: MouseEvent) => tiltHandler(e, card);
            const leave = () => leaveHandler(card);
            card.addEventListener("mousemove", move);
            card.addEventListener("mouseleave", leave);
        });

        const btns = document.querySelectorAll<HTMLElement>(".tb-btn");
        const rippleHandler = (e: MouseEvent, btn: HTMLElement) => {
            const r = btn.getBoundingClientRect();
            const ripple = document.createElement("span");
            const size = Math.max(r.width, r.height);
            ripple.className = "tb-ripple";
            ripple.style.width = ripple.style.height = size + "px";
            ripple.style.left = e.clientX - r.left - size / 2 + "px";
            ripple.style.top = e.clientY - r.top - size / 2 + "px";
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        };
        btns.forEach((btn) => {
            const handler = (e: MouseEvent) => rippleHandler(e, btn);
            btn.addEventListener("click", handler);
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
            io.disconnect();
        };
    }, [data]);

    const toggleTheme = () => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    };

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
    <form className="tb-contact-form tb-glass tb-reveal-right" onSubmit={handleContactSubmit}>
        <h3>Send a Message</h3>
        <div className="tb-form-row">
            <label>Name</label>
            <input type="text" name="name" placeholder="John Doe" required />
        </div>
        <div className="tb-form-row">
            <label>Email</label>
            <input type="email" name="email" placeholder="john@example.com" required />
        </div>
        <div className="tb-form-row">
            <label>Message</label>
            <textarea name="message" placeholder={`Hello ${data.name?.split(" ")[0] || ""}...`} required />
        </div>
        <button type="submit" className="tb-submit-btn tb-btn" disabled={contactStatus === "sending"}>
            {contactStatus === "sending" ? "Sending..." : "Send Message ➤"}
        </button>
        {contactStatus === "success" && <p style={{ color: "#39d353", fontSize: 13, marginTop: 10 }}>Message sent! Thanks for reaching out.</p>}
        {contactStatus === "error" && <p style={{ color: "#ff5d5d", fontSize: 13, marginTop: 10 }}>{contactError}</p>}
    </form>
    return (
        <div data-theme={theme} className="tb-root">
            <style>{tbStyles}</style>

            <div className="tb-bg-fallback" />
            <div className="tb-bg-overlay" />

            <header className="tb-header">
                <nav>
                    <div className="tb-brand">
                        <div className="tb-mark">{initial}</div>
                        <div>
                            <div className="tb-name">{data.name}</div>
                            <div className="tb-tag">{data.title?.toUpperCase()}</div>
                        </div>
                    </div>
                    <ul className="tb-nav-links">
                        <li><a href="#tb-skills">Skills</a></li>
                        <li><a href="#tb-education">Education</a></li>
                        <li><a href="#tb-experience">Experience</a></li>
                        <li><a href="#tb-projects">Projects</a></li>
                        <li><a href="#tb-certifications">Certifications</a></li>
                        <li><a href="#tb-contact">Contact</a></li>
                    </ul>
                    <div className="tb-nav-icons">
                        <button className="tb-icon-btn" onClick={toggleTheme} title="Toggle theme">
                            {theme === "dark" ? "☀" : "🌙"}
                        </button>
                        {data.links?.github && (
                            <a className="tb-icon-btn" href={data.links.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                                ⌥
                            </a>
                        )}
                        {data.links?.linkedin && (
                            <a className="tb-icon-btn" href={data.links.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                in
                            </a>
                        )}
                        {data.links?.portfolio && (
                            <a className="tb-icon-btn" href={data.links.portfolio} target="_blank" rel="noopener noreferrer" title="Portfolio">
                                🌐
                            </a>
                        )}
                    </div>
                </nav>
            </header>

            <section className="tb-hero" id="tb-home">
                <div className="tb-particles" id="tb-particles" />
                <div className="tb-container tb-hero-grid">
                    <div>
                        <div className="tb-eyebrow tb-hero-anim tb-d1">{data.title}</div>
                        <h1 className="tb-hero-anim tb-d2">{data.name}</h1>
                        <div className="tb-role tb-hero-anim tb-d3">{data.title}</div>
                        <p className="tb-lead tb-hero-anim tb-d4">{data.summary}</p>
                        <div className="tb-btn-row tb-hero-anim tb-d5">
                            <a href="#tb-projects" className="tb-btn tb-btn-primary">View Projects →</a>
                            <a href="#tb-contact" className="tb-btn tb-btn-outline">Contact Me ✉</a>
                        </div>
                    </div>
                    <div className="tb-hero-photo tb-hero-anim tb-d6">
                        <div className="tb-photo-ring">
                            <div className="tb-inner">
                                <div className="tb-monogram">{initial}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <WaveDivider />

            {data.skillCategories?.length > 0 && (
                <>
                    <section id="tb-skills">
                        <div className="tb-container">
                            <SectionHead title="Technical Skills" />
                            <div className="tb-skills-grid">
                                {data.skillCategories.map((cat, i) => (
                                    <div className="tb-skill-card tb-glass tb-reveal" key={i}>
                                        <h3>{cat.category}</h3>
                                        <ul>
                                            {cat.skills.map((s, j) => (
                                                <li key={j}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider flip />
                </>
            )}

            {data.education?.length > 0 && (
                <>
                    <section id="tb-education">
                        <div className="tb-container">
                            <SectionHead title="Education" />
                            <div className="tb-edu-grid">
                                {data.education.map((edu, i) => (
                                    <div className="tb-edu-card tb-glass tb-reveal" key={i}>
                                        <div className="tb-years">{edu.year}</div>
                                        <h3>{edu.degree}</h3>
                                        <div className="tb-place">{edu.school}</div>
                                        {edu.score && <div className="tb-score">{edu.score}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider />
                </>
            )}

            {data.experience?.length > 0 && (
                <>
                    <section id="tb-experience">
                        <div className="tb-container">
                            <SectionHead title="Experience" />
                            <div className="tb-timeline">
                                {data.experience.map((exp, i) => (
                                    <div className="tb-tl-item tb-glass tb-reveal" key={i}>
                                        <h3>{exp.role}</h3>
                                        <div className="tb-org">{exp.company}</div>
                                        <div className="tb-stack">
                                            {exp.duration}{exp.techStack ? ` · ${exp.techStack}` : ""}
                                        </div>
                                        {exp.highlights?.length > 0 && (
                                            <ul>
                                                {exp.highlights.map((h, j) => (
                                                    <li key={j}>{h}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider flip />
                </>
            )}

            {data.projects?.length > 0 && (
                <>
                    <section id="tb-projects">
                        <div className="tb-container">
                            <SectionHead title="Projects" />
                            <div className="tb-projects-grid">
                                {data.projects.map((proj, i) => (
                                    <div className="tb-project-card tb-glass tb-reveal tb-tilt" key={i}>
                                        <div className="tb-project-thumb">🚀</div>
                                        <h3>{proj.title}</h3>
                                        {proj.techStack && <div className="tb-stack">{proj.techStack}</div>}
                                        <p style={{ fontSize: 13, color: "var(--tb-text-dim)", lineHeight: 1.6 }}>
                                            {proj.description}
                                        </p>
                                        {proj.link && (
                                            <a className="tb-live-demo" href={proj.link} target="_blank" rel="noopener noreferrer">
                                                View Project →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider />
                </>
            )}

            {data.certifications?.length > 0 && (
                <>
                    <section id="tb-certifications">
                        <div className="tb-container">
                            <SectionHead title="Certifications" />
                            <div className="tb-cert-grid">
                                {data.certifications.map((cert, i) => (
                                    <div className="tb-cert-card tb-glass tb-reveal" key={i}>
                                        <div className="tb-cert-icon">🏅</div>
                                        <div>
                                            <h4>{cert.name}</h4>
                                            <div className="tb-meta">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</div>
                                            {cert.credentialUrl ? (
                                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                                                    View Credential ↗
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: 12.5, color: "var(--tb-text-dim)" }}>No credential link added</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider flip />
                </>
            )}

            {otherPlatforms.length > 0 && (
                <>
                    <section id="tb-platform">
                        <div className="tb-container">
                            <SectionHead title="Find me on Platforms" />
                            <div className="tb-projects-grid">
                                {otherPlatforms.map(([key, url], i) => (
                                    <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tb-project-card tb-glass tb-reveal tb-tilt"
                                    style={{ textDecoration: "none", textAlign: "center", justifyContent: "center" }}
                                    >
                                    <h3 style={{ textTransform: "capitalize" }}>{key}</h3>
                                    </a>
                                    ))}
                            </div>
                        </div>
                    </section>
                    <WaveDivider />
                </>
            )}

{data.achievements?.length > 0 && (
    <>
        <section id="tb-achievements">
            <div className="tb-container">
                <SectionHead title="Achievements" />
                <div className="tb-ach-grid">
                    {data.achievements.map((ach, i) => (
                        <div className="tb-ach-card tb-glass tb-reveal" key={i}>
                            <div className="tb-ach-icon">🎖️</div>
                            <div>
                                <h4>{ach.title}</h4>
                                <p>{ach.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
        <WaveDivider flip />
    </>
)}

<section id="tb-contact">
    <div className="tb-container">
        <div className="tb-section-head tb-reveal">
            <h2>Let's Connect</h2>
            <div className="tb-underline" />
            <p>Whether it's a project, opportunity, or a conversation about technology, I'd be happy to connect.</p>
        </div>
        <div className="tb-contact-wrap">
            <div className="tb-contact-info tb-glass tb-reveal-left">
                <h3>Contact Information</h3>
                {data.links?.email && (
                    <ContactRow icon="✉" label="Email" value={data.links.email} href={`mailto:${data.links.email}`} />
                )}
                {data.phone && <ContactRow icon="📞" label="Phone" value={data.phone} href={`tel:${data.phone}`} />}
                {data.location && <ContactRow icon="📍" label="Location" value={data.location} />}
                <div className="tb-social-title">Social Profiles</div>
                <div className="tb-social-row">
                    {data.links?.linkedin && (
                        <a className="tb-social-btn tb-li" href={data.links.linkedin} target="_blank" rel="noopener noreferrer">in LinkedIn</a>
                    )}
                    {data.links?.github && (
                        <a className="tb-social-btn tb-gh" href={data.links.github} target="_blank" rel="noopener noreferrer">⌥ GitHub</a>
                    )}
                    {data.links?.portfolio && (
                        <a className="tb-social-btn" href={data.links.portfolio} target="_blank" rel="noopener noreferrer">🌐 Portfolio</a>
                    )}
                </div>
            </div>
            <form className="tb-contact-form tb-glass tb-reveal-right" onSubmit={handleContactSubmit}>
                <h3>Send a Message</h3>
                <div className="tb-form-row">
                    <label>Name</label>
                    <input type="text" placeholder="John Doe" required />
                </div>
                <div className="tb-form-row">
                    <label>Email</label>
                    <input type="email" placeholder="john@example.com" required />
                </div>
                <div className="tb-form-row">
                    <label>Message</label>
                    <textarea placeholder={`Hello ${data.name?.split(" ")[0] || ""}...`} />
                </div>
                <button type="submit" className="tb-submit-btn tb-btn">Send Message ➤</button>
            </form>
        </div>
    </div>
</section>

<footer className="tb-footer">
    &copy; {new Date().getFullYear()} {data.name}. Built with <a href="#tb-home">passion &amp; code</a>.
</footer>
</div>
);
}

function SectionHead({ title }: { title: string }) {
    return (
        <div className="tb-section-head tb-reveal">
            <h2>{title}</h2>
            <div className="tb-underline" />
        </div>
    );
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
    return (
        <div className="tb-cinfo-row">
            <div className="tb-ic">{icon}</div>
            <div>
                <div className="tb-lbl">{label}</div>
                <div className="tb-val">{href ? <a href={href}>{value}</a> : value}</div>
            </div>
        </div>
    );
}

function WaveDivider({ flip = false }: { flip?: boolean }) {
    return (
        <div className="tb-wave-divider">
            <svg viewBox="0 0 1200 90" preserveAspectRatio="none" className={flip ? "tb-wave2" : "tb-wave1"}>
                <path
                    d={flip
                        ? "M0,50 C150,10 300,90 450,50 C600,10 750,90 900,50 C1050,10 1200,90 1350,50 L1350,90 L0,90 Z"
                        : "M0,45 C150,90 300,0 450,45 C600,90 750,0 900,45 C1050,90 1200,0 1350,45 L1350,90 L0,90 Z"}
                    fill="none"
                    stroke="#f2b705"
                    strokeWidth={flip ? 1 : 1.5}
                />
            </svg>
        </div>
    );
}

const tbStyles = `
.tb-root{
  --tb-gold:#f2b705; --tb-gold-soft:#ffd75e; --tb-gold-dim:rgba(242,183,5,0.18);
  --tb-text:#f5f6f8; --tb-text-dim:#cfd3db;
  --tb-panel:rgba(20,22,30,0.55); --tb-panel-strong:rgba(15,17,24,0.7); --tb-panel-border:rgba(255,255,255,0.14);
  color:var(--tb-text); font-family:'Inter',sans-serif; position:relative; overflow-x:hidden;
}
.tb-root[data-theme="light"]{
  --tb-text:#141518; --tb-text-dim:#3a3d44;
  --tb-panel:rgba(255,255,255,0.55); --tb-panel-strong:rgba(255,255,255,0.7); --tb-panel-border:rgba(20,20,20,0.14);
}
.tb-root h1,.tb-root h2,.tb-root h3,.tb-name{font-family:'Poppins',sans-serif;}
.tb-root a{color:inherit; text-decoration:none;}
.tb-root ul{list-style:none; margin:0; padding:0;}
.tb-container{max-width:1180px; margin:0 auto; padding:0 28px;}
.tb-bg-fallback{position:fixed; inset:0; z-index:-2;
  background:radial-gradient(circle at 30% 20%, #2a2f3d, #0e1016 60%);}
.tb-root[data-theme="light"] .tb-bg-fallback{background:radial-gradient(circle at 30% 20%, #fdf6e3, #ffffff 60%);}
.tb-bg-overlay{position:fixed; inset:0; z-index:-1;}
.tb-header{position:sticky; top:0; z-index:100; background:rgba(10,12,18,0.5); backdrop-filter:blur(16px) saturate(140%); border-bottom:1px solid var(--tb-panel-border); transition:padding .3s ease;}
.tb-root[data-theme="light"] .tb-header{background:rgba(255,255,255,0.5);}
.tb-header nav{display:flex; align-items:center; justify-content:space-between; max-width:1180px; margin:0 auto; padding:14px 28px;}
.tb-header.scrolled nav{padding:9px 28px;}
.tb-brand{display:flex; align-items:center; gap:12px;}
.tb-mark{width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,var(--tb-gold-soft),var(--tb-gold)); display:flex; align-items:center; justify-content:center; font-weight:800; color:#141518; font-size:16px; box-shadow:0 0 0 3px var(--tb-gold-dim);}
.tb-name{font-weight:700; font-size:15px;}
.tb-tag{font-size:10px; letter-spacing:.08em; color:var(--tb-text-dim); font-weight:600;}
.tb-nav-links{display:flex; gap:28px;}
.tb-nav-links a{font-size:14px; font-weight:500; color:var(--tb-text-dim);}
.tb-nav-links a:hover{color:var(--tb-gold);}
.tb-nav-icons{display:flex; gap:14px;}
.tb-icon-btn{width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid var(--tb-panel-border); color:var(--tb-text-dim); cursor:pointer; background:var(--tb-panel); font-size:13px;}
.tb-icon-btn:hover{color:var(--tb-gold); border-color:var(--tb-gold);}
.tb-hero{position:relative; min-height:90vh; display:flex; align-items:center; padding:80px 0 60px;}
.tb-hero-grid{display:grid; grid-template-columns:1.3fr 0.7fr; gap:60px; align-items:center; position:relative; z-index:1;}
.tb-eyebrow{display:inline-flex; align-items:center; gap:8px; padding:6px 16px; border:1px solid var(--tb-gold); border-radius:999px; color:var(--tb-gold-soft); font-size:12px; font-weight:600; margin-bottom:22px; background:var(--tb-panel);}
.tb-root h1{font-size:clamp(26px,4.2vw,46px); font-weight:800; line-height:1.15; margin-bottom:16px;}
.tb-role{color:var(--tb-gold); font-weight:700; font-size:18px; margin-bottom:18px;}
.tb-lead{color:var(--tb-text-dim); font-size:16px; line-height:1.7; max-width:540px; margin-bottom:34px;}
.tb-btn-row{display:flex; flex-wrap:wrap; gap:14px;}
.tb-btn{display:inline-flex; align-items:center; gap:8px; padding:13px 26px; border-radius:10px; font-weight:600; font-size:14.5px; cursor:pointer; border:1px solid transparent; position:relative; overflow:hidden;}
.tb-btn-primary{background:linear-gradient(135deg,var(--tb-gold-soft),var(--tb-gold)); color:#141518;}
.tb-btn-outline{border-color:var(--tb-panel-border); color:var(--tb-text); background:var(--tb-panel);}
.tb-ripple{position:absolute; border-radius:50%; background:rgba(255,255,255,.55); transform:scale(0); animation:tb-rippleAnim .6s ease-out forwards; pointer-events:none;}
@keyframes tb-rippleAnim{to{transform:scale(2.6); opacity:0;}}
.tb-hero-photo{display:flex; justify-content:center;}
.tb-photo-ring{width:240px; height:240px; border-radius:50%; background:linear-gradient(135deg,var(--tb-gold-soft),transparent 60%); padding:5px; box-shadow:0 0 60px var(--tb-gold-dim);}
.tb-inner{width:100%; height:100%; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; background:var(--tb-panel-strong);}
.tb-monogram{font-size:80px; font-weight:800; color:var(--tb-gold);}
.tb-particles{position:absolute; inset:0; overflow:hidden; pointer-events:none;}
.tb-particle{position:absolute; bottom:-20px; border-radius:50%; background:radial-gradient(circle, var(--tb-gold-soft), transparent 70%); opacity:.5; animation:tb-riseUp linear infinite;}
@keyframes tb-riseUp{0%{transform:translateY(0); opacity:0;} 10%{opacity:.5;} 90%{opacity:.3;} 100%{transform:translateY(-100vh) translateX(var(--drift,20px)); opacity:0;}}
.tb-hero-anim{opacity:0; transform:translateY(24px); animation:tb-heroIn .8s ease forwards;}
.tb-d1{animation-delay:.05s;} .tb-d2{animation-delay:.18s;} .tb-d3{animation-delay:.32s;} .tb-d4{animation-delay:.46s;} .tb-d5{animation-delay:.6s;} .tb-d6{animation-delay:.3s;}
@keyframes tb-heroIn{to{opacity:1; transform:translateY(0);}}
.tb-wave-divider{position:relative; height:60px; overflow:hidden;}
.tb-wave-divider svg{position:absolute; top:0; left:0; width:200%; height:100%;}
.tb-wave1{animation:tb-waveMove 18s linear infinite; opacity:.5;}
.tb-wave2{animation:tb-waveMove 12s linear infinite reverse; opacity:.3;}
@keyframes tb-waveMove{from{transform:translateX(0);} to{transform:translateX(-50%);}}
.tb-root section{padding:70px 0;}
.tb-section-head{text-align:center; margin-bottom:48px;}
.tb-section-head h2{font-size:clamp(24px,3.2vw,34px); font-weight:800; margin-bottom:12px;}
.tb-underline{width:60px; height:3px; background:var(--tb-gold); margin:0 auto;}
.tb-section-head p{color:var(--tb-text-dim); max-width:560px; margin:14px auto 0; font-size:15px;}
.tb-glass{background:var(--tb-panel); border:1px solid var(--tb-panel-border); border-radius:16px; backdrop-filter:blur(14px) saturate(140%);}
.tb-reveal{opacity:0; transform:translateY(40px) scale(.95); transition:opacity .6s ease, transform .6s ease; transition-delay:calc(var(--d,0) * 80ms);}
.tb-reveal.in-view{opacity:1; transform:translateY(0) scale(1);}
.tb-reveal-left{opacity:0; transform:translateX(-50px); transition:opacity .7s ease, transform .7s ease;}
.tb-reveal-left.in-view{opacity:1; transform:translateX(0);}
.tb-reveal-right{opacity:0; transform:translateX(50px); transition:opacity .7s ease, transform .7s ease;}
.tb-reveal-right.in-view{opacity:1; transform:translateX(0);}
.tb-skills-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:20px;}
.tb-skill-card{padding:24px 20px;}
.tb-skill-card h3{font-size:16px; margin-bottom:14px; color:var(--tb-gold-soft);}
.tb-skill-card ul li{color:var(--tb-text-dim); font-size:14px; padding:6px 0; border-bottom:1px dashed var(--tb-panel-border);}
.tb-skill-card ul li:last-child{border-bottom:none;}
.tb-edu-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px;}
.tb-edu-card{padding:22px 20px;}
.tb-years{font-size:12px; color:var(--tb-gold-soft); font-weight:700; margin-bottom:10px;}
.tb-edu-card h3{font-size:15px; margin-bottom:6px;}
.tb-place{font-size:13px; color:var(--tb-text-dim); margin-bottom:10px;}
.tb-score{font-size:13.5px; font-weight:700; color:var(--tb-gold);}
.tb-timeline{max-width:800px; margin:0 auto;}
.tb-tl-item{padding:22px 24px; margin-bottom:20px;}
.tb-tl-item h3{font-size:17px; margin-bottom:4px;}
.tb-org{color:var(--tb-gold); font-weight:600; font-size:13.5px;}
.tb-stack{font-size:12px; color:var(--tb-text-dim); margin-bottom:12px; font-style:italic;}
.tb-tl-item ul li{color:var(--tb-text-dim); font-size:14px; line-height:1.7; padding-left:16px; position:relative; margin-bottom:5px;}
.tb-tl-item ul li::before{content:"›"; position:absolute; left:0; color:var(--tb-gold);}
.tb-projects-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:22px;}
.tb-project-card{padding:24px; display:flex; flex-direction:column; gap:12px; transition:transform .25s;}
.tb-project-thumb{height:100px; border-radius:10px; background:linear-gradient(135deg, rgba(242,183,5,.2), rgba(242,183,5,.03)); display:flex; align-items:center; justify-content:center; font-size:28px;}
.tb-project-card h3{font-size:16px;}
.tb-live-demo{color:var(--tb-gold); font-weight:600; font-size:13.5px; margin-top:auto;}
.tb-cert-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px;}
.tb-cert-card{padding:18px 20px; display:flex; gap:12px;}
.tb-cert-icon{width:36px; height:36px; min-width:36px; border-radius:50%; background:var(--tb-gold-dim); display:flex; align-items:center; justify-content:center; font-size:15px;}
.tb-cert-card h4{font-size:14px; margin-bottom:6px;}
.tb-meta{font-size:12px; color:var(--tb-text-dim); margin-bottom:6px;}
.tb-cert-card a{font-size:12.5px; color:var(--tb-gold-soft); font-weight:600;}
.tb-ach-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:20px; max-width:800px; margin:0 auto;}
.tb-ach-card{padding:22px 24px; display:flex; gap:14px;}
.tb-ach-icon{font-size:20px; color:var(--tb-gold);}
.tb-ach-card h4{font-size:14.5px; margin-bottom:6px;}
.tb-ach-card p{font-size:13px; color:var(--tb-text-dim);}
.tb-contact-wrap{display:grid; grid-template-columns:0.85fr 1.15fr; gap:32px;}
.tb-contact-info, .tb-contact-form{padding:28px;}
.tb-contact-info h3, .tb-contact-form h3{font-size:18px; margin-bottom:22px;}
.tb-cinfo-row{display:flex; gap:14px; margin-bottom:20px;}
.tb-ic{width:36px; height:36px; border-radius:10px; background:var(--tb-gold-dim); color:var(--tb-gold); display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0;}
.tb-lbl{font-size:12px; color:var(--tb-text-dim);}
.tb-val{font-size:14px; font-weight:600;}
.tb-social-title{font-size:13px; color:var(--tb-text-dim); margin:16px 0 10px;}
.tb-social-row{display:flex; gap:10px; flex-wrap:wrap;}
.tb-social-btn{display:flex; align-items:center; gap:8px; padding:9px 16px; border-radius:9px; font-size:13px; font-weight:600; border:1px solid var(--tb-panel-border);}
.tb-social-btn.tb-li{background:#0a66c2; color:#fff; border-color:#0a66c2;}
.tb-form-row{margin-bottom:16px;}
.tb-form-row label{display:block; font-size:12px; color:var(--tb-text-dim); margin-bottom:6px; font-weight:600;}
.tb-form-row input, .tb-form-row textarea{width:100%; padding:11px 13px; border-radius:9px; border:1px solid var(--tb-panel-border); background:rgba(255,255,255,0.06); color:var(--tb-text); font-family:inherit; font-size:14px; outline:none; box-sizing:border-box;}
.tb-form-row textarea{resize:vertical; min-height:90px;}
.tb-submit-btn{width:100%; padding:13px; border:none; border-radius:9px; background:linear-gradient(135deg,var(--tb-gold-soft),var(--tb-gold)); color:#141518; font-weight:700; font-size:14px;}
.tb-footer{text-align:center; padding:26px 20px; color:var(--tb-text-dim); font-size:13px; border-top:1px solid var(--tb-panel-border);}
.tb-footer a{color:var(--tb-gold); font-weight:600;}
@media(max-width:900px){
  .tb-hero-grid{grid-template-columns:1fr; text-align:center;}
  .tb-lead{margin:0 auto 34px;}
  .tb-btn-row{justify-content:center;}
  .tb-nav-links{display:none;}
  .tb-contact-wrap{grid-template-columns:1fr;}
}
`;

export default TemplateBold;