import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    type ParsedResume,
    type SkillCategory,
    type Experience,
    type Education,
    type Project,
    type Certification,
    type Achievement,
    savePortfolio,
    getErrorMessage,
} from "../api";
import { templates } from "../templates/templateRegistry";

type FieldErrors = Partial<Record<"name" | "title" | "summary" | "phone", string>>;

const PHONE_PATTERN = /^[+\d][\d\s\-().]{6,}$/;
const KNOWN_LINK_KEYS = ["github", "linkedin", "portfolio", "email"];

function PreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialData = (location.state as { parsed?: ParsedResume })?.parsed;

    const [data, setData] = useState<ParsedResume | null>(initialData ?? null);
    const [selectedTemplate, setSelectedTemplate] = useState("bold");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    useEffect(() => {
        if (typeof document !== "undefined" && !document.getElementById("spinner-keyframes")) {
            const style = document.createElement("style");
            style.id = "spinner-keyframes";
            style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
    }, []);

    if (!data) {
        return (
            <div className="pv-empty-page">
                <style>{pvStyles}</style>
                <div className="rp-card pv-empty-card">
                    <div className="pv-empty-icon">📭</div>
                    <p>No resume data found. Please upload your resume first.</p>
                    <button onClick={() => navigate("/")} className="rp-btn-primary">Go back</button>
                </div>
            </div>
        );
    }

    const updateField = (field: keyof ParsedResume, value: string) => {
        setData((prev) => (prev ? { ...prev, [field]: value } : prev));
        if (field in fieldErrors) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field as keyof FieldErrors];
                return next;
            });
        }
    };

    const updateSkillCategory = (index: number, patch: Partial<SkillCategory>) => {
        setData((prev) => prev ? { ...prev, skillCategories: prev.skillCategories.map((c, i) => (i === index ? { ...c, ...patch } : c)) } : prev);
    };
    const removeSkillCategory = (index: number) => {
        setData((prev) => (prev ? { ...prev, skillCategories: prev.skillCategories.filter((_, i) => i !== index) } : prev));
    };
    const addSkillCategory = () => {
        setData((prev) => (prev ? { ...prev, skillCategories: [...prev.skillCategories, { category: "", skills: [] }] } : prev));
    };

    const updateExperience = (index: number, patch: Partial<Experience>) => {
        setData((prev) => prev ? { ...prev, experience: prev.experience.map((e, i) => (i === index ? { ...e, ...patch } : e)) } : prev);
    };
    const removeExperience = (index: number) => {
        setData((prev) => (prev ? { ...prev, experience: prev.experience.filter((_, i) => i !== index) } : prev));
    };
    const addExperience = () => {
        setData((prev) => prev ? { ...prev, experience: [...prev.experience, { company: "", role: "", duration: "", techStack: "", highlights: [] }] } : prev);
    };

    const updateEducation = (index: number, patch: Partial<Education>) => {
        setData((prev) => prev ? { ...prev, education: prev.education.map((e, i) => (i === index ? { ...e, ...patch } : e)) } : prev);
    };
    const removeEducation = (index: number) => {
        setData((prev) => (prev ? { ...prev, education: prev.education.filter((_, i) => i !== index) } : prev));
    };
    const addEducation = () => {
        setData((prev) => prev ? { ...prev, education: [...prev.education, { school: "", degree: "", year: "", score: "" }] } : prev);
    };

    const updateProject = (index: number, patch: Partial<Project>) => {
        setData((prev) => prev ? { ...prev, projects: prev.projects.map((p, i) => (i === index ? { ...p, ...patch } : p)) } : prev);
    };
    const removeProject = (index: number) => {
        setData((prev) => (prev ? { ...prev, projects: prev.projects.filter((_, i) => i !== index) } : prev));
    };
    const addProject = () => {
        setData((prev) => prev ? { ...prev, projects: [...prev.projects, { title: "", description: "", techStack: "", link: "" }] } : prev);
    };

    const updateCertification = (index: number, patch: Partial<Certification>) => {
        setData((prev) => prev ? { ...prev, certifications: prev.certifications.map((c, i) => (i === index ? { ...c, ...patch } : c)) } : prev);
    };
    const removeCertification = (index: number) => {
        setData((prev) => (prev ? { ...prev, certifications: prev.certifications.filter((_, i) => i !== index) } : prev));
    };
    const addCertification = () => {
        setData((prev) => prev ? { ...prev, certifications: [...prev.certifications, { name: "", issuer: "", date: "", credentialUrl: "" }] } : prev);
    };

    const updateAchievement = (index: number, patch: Partial<Achievement>) => {
        setData((prev) => prev ? { ...prev, achievements: prev.achievements.map((a, i) => (i === index ? { ...a, ...patch } : a)) } : prev);
    };
    const removeAchievement = (index: number) => {
        setData((prev) => (prev ? { ...prev, achievements: prev.achievements.filter((_, i) => i !== index) } : prev));
    };
    const addAchievement = () => {
        setData((prev) => (prev ? { ...prev, achievements: [...prev.achievements, { title: "", description: "" }] } : prev));
    };

    const updateKnownLink = (key: string, value: string) => {
        setData((prev) => (prev ? { ...prev, links: { ...prev.links, [key]: value } } : prev));
    };
    const otherLinkEntries = Object.entries(data.links || {}).filter(([key]) => !KNOWN_LINK_KEYS.includes(key.toLowerCase()));
    const updateOtherLinkKey = (oldKey: string, newKey: string) => {
        setData((prev) => {
            if (!prev) return prev;
            const links: Record<string, string> = {};
            Object.entries(prev.links).forEach(([k, v]) => { links[k === oldKey ? newKey : k] = v; });
            return { ...prev, links };
        });
    };
    const updateOtherLinkValue = (key: string, value: string) => {
        setData((prev) => (prev ? { ...prev, links: { ...prev.links, [key]: value } } : prev));
    };
    const removeOtherLink = (key: string) => {
        setData((prev) => {
            if (!prev) return prev;
            const links = { ...prev.links };
            delete links[key];
            return { ...prev, links };
        });
    };
    const addOtherLink = () => {
        setData((prev) => {
            if (!prev) return prev;
            let candidate = "platform";
            let i = 1;
            while (candidate in prev.links) { candidate = `platform${i}`; i++; }
            return { ...prev, links: { ...prev.links, [candidate]: "" } };
        });
    };

    const validate = (current: ParsedResume): FieldErrors => {
        const errors: FieldErrors = {};
        if (!current.name?.trim()) errors.name = "Name is required.";
        else if (current.name.trim().length < 2) errors.name = "Name looks too short.";
        if (!current.title?.trim()) errors.title = "Professional title is required.";
        if (!current.summary?.trim()) errors.summary = "A short summary is required.";
        else if (current.summary.trim().length < 20) errors.summary = "Summary is a bit short — add a sentence or two more.";
        if (current.phone?.trim() && !PHONE_PATTERN.test(current.phone.trim())) errors.phone = "That doesn't look like a valid phone number.";
        return errors;
    };

    const sanitizeForSave = (d: ParsedResume): ParsedResume => ({
        ...d,
        name: d.name?.trim() ?? "",
        title: d.title?.trim() ?? "",
        summary: d.summary?.trim() ?? "",
        phone: d.phone?.trim() ?? "",
        location: d.location?.trim() ?? "",
        skillCategories: (d.skillCategories || []).map((c) => ({ category: c.category?.trim() ?? "", skills: (c.skills || []).map((s) => s.trim()).filter(Boolean) })),
        experience: (d.experience || []).map((e) => ({ ...e, highlights: (e.highlights || []).map((h) => h.trim()).filter(Boolean) })),
        links: Object.fromEntries(Object.entries(d.links || {}).filter(([k]) => k.trim().length > 0)),
    });

    const handleConfirm = async () => {
        const sanitized = sanitizeForSave(data);
        const errors = validate(sanitized);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError("Please fix the highlighted fields before continuing.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const result = await savePortfolio(sanitized, selectedTemplate);
            navigate(`/portfolio/${result.slug}`);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pv-page">
            <style>{pvStyles}</style>

            <div className="pv-container">
                <div className="pv-header">
                    <div className="rp-logo-badge">📝</div>
                    <h1 className="rp-title">Review your portfolio</h1>
                    <p className="rp-subtitle">We used AI to extract this from your resume — edit anything below before continuing.</p>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🎨 Choose a template</h2>
                    <div className="pv-template-grid">
                        {templates.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                disabled={!t.available}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`pv-template-card ${selectedTemplate === t.id ? "selected" : ""}`}
                                style={{ borderColor: selectedTemplate === t.id ? t.accentColor : undefined }}
                            >
                                <div className="pv-template-swatch" style={{ background: t.accentColor }} />
                                <div className="pv-template-name">{t.name}</div>
                                <div className="pv-template-desc">{t.description}</div>
                                {selectedTemplate === t.id && t.available && (
                                    <div className="pv-template-selected" style={{ color: t.accentColor }}>✓ Selected</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">👤 Basic Info</h2>
                    <label className="pv-label">Full Name *</label>
                    <input className={fieldErrors.name ? "pv-input invalid" : "pv-input"} value={data.name} onChange={(e) => updateField("name", e.target.value)} />
                    {fieldErrors.name && <p className="pv-field-error">{fieldErrors.name}</p>}

                    <label className="pv-label">Professional Title *</label>
                    <input className={fieldErrors.title ? "pv-input invalid" : "pv-input"} value={data.title} onChange={(e) => updateField("title", e.target.value)} />
                    {fieldErrors.title && <p className="pv-field-error">{fieldErrors.title}</p>}

                    <label className="pv-label">Phone</label>
                    <input className={fieldErrors.phone ? "pv-input invalid" : "pv-input"} value={data.phone} onChange={(e) => updateField("phone", e.target.value)} />
                    {fieldErrors.phone && <p className="pv-field-error">{fieldErrors.phone}</p>}

                    <label className="pv-label">Location</label>
                    <input className="pv-input" value={data.location} onChange={(e) => updateField("location", e.target.value)} />

                    <label className="pv-label">Summary *</label>
                    <textarea className={fieldErrors.summary ? "pv-input invalid pv-textarea" : "pv-input pv-textarea"} value={data.summary} onChange={(e) => updateField("summary", e.target.value)} />
                    {fieldErrors.summary && <p className="pv-field-error">{fieldErrors.summary}</p>}
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🛠 Skills</h2>
                    {data.skillCategories.map((cat, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeSkillCategory(i)}>Remove</button></div>
                            <label className="pv-label-sm">Category</label>
                            <input className="pv-input" value={cat.category} onChange={(e) => updateSkillCategory(i, { category: e.target.value })} placeholder="e.g. Frontend" />
                            <label className="pv-label-sm">Skills (comma-separated)</label>
                            <input className="pv-input" value={cat.skills.join(", ")} onChange={(e) => updateSkillCategory(i, { skills: e.target.value.split(",").map((s) => s.trimStart()) })} placeholder="React, TypeScript, CSS" />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addSkillCategory}>+ Add skill category</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">💼 Experience</h2>
                    {data.experience.map((exp, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeExperience(i)}>Remove</button></div>
                            <label className="pv-label-sm">Role</label>
                            <input className="pv-input" value={exp.role} onChange={(e) => updateExperience(i, { role: e.target.value })} />
                            <label className="pv-label-sm">Company</label>
                            <input className="pv-input" value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} />
                            <label className="pv-label-sm">Duration</label>
                            <input className="pv-input" value={exp.duration} onChange={(e) => updateExperience(i, { duration: e.target.value })} placeholder="Jan 2024 – Present" />
                            <label className="pv-label-sm">Tech Stack</label>
                            <input className="pv-input" value={exp.techStack} onChange={(e) => updateExperience(i, { techStack: e.target.value })} />
                            <label className="pv-label-sm">Highlights (one per line)</label>
                            <textarea className="pv-input pv-textarea" value={(exp.highlights || []).join("\n")} onChange={(e) => updateExperience(i, { highlights: e.target.value.split("\n") })} />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addExperience}>+ Add experience</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🎓 Education</h2>
                    {data.education.map((edu, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeEducation(i)}>Remove</button></div>
                            <label className="pv-label-sm">Degree</label>
                            <input className="pv-input" value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} />
                            <label className="pv-label-sm">School</label>
                            <input className="pv-input" value={edu.school} onChange={(e) => updateEducation(i, { school: e.target.value })} />
                            <label className="pv-label-sm">Year</label>
                            <input className="pv-input" value={edu.year} onChange={(e) => updateEducation(i, { year: e.target.value })} />
                            <label className="pv-label-sm">Score (CGPA / %)</label>
                            <input className="pv-input" value={edu.score} onChange={(e) => updateEducation(i, { score: e.target.value })} />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addEducation}>+ Add education</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🚀 Projects</h2>
                    {data.projects.map((proj, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeProject(i)}>Remove</button></div>
                            <label className="pv-label-sm">Title</label>
                            <input className="pv-input" value={proj.title} onChange={(e) => updateProject(i, { title: e.target.value })} />
                            <label className="pv-label-sm">Description</label>
                            <textarea className="pv-input pv-textarea-sm" value={proj.description} onChange={(e) => updateProject(i, { description: e.target.value })} />
                            <label className="pv-label-sm">Tech Stack</label>
                            <input className="pv-input" value={proj.techStack} onChange={(e) => updateProject(i, { techStack: e.target.value })} />
                            <label className="pv-label-sm">Link</label>
                            <input className="pv-input" value={proj.link} onChange={(e) => updateProject(i, { link: e.target.value })} placeholder="https://..." />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addProject}>+ Add project</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🏅 Certifications</h2>
                    {data.certifications.map((cert, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeCertification(i)}>Remove</button></div>
                            <label className="pv-label-sm">Name</label>
                            <input className="pv-input" value={cert.name} onChange={(e) => updateCertification(i, { name: e.target.value })} />
                            <label className="pv-label-sm">Issuer</label>
                            <input className="pv-input" value={cert.issuer} onChange={(e) => updateCertification(i, { issuer: e.target.value })} />
                            <label className="pv-label-sm">Date</label>
                            <input className="pv-input" value={cert.date} onChange={(e) => updateCertification(i, { date: e.target.value })} />
                            <label className="pv-label-sm">Credential URL</label>
                            <input className="pv-input" value={cert.credentialUrl} onChange={(e) => updateCertification(i, { credentialUrl: e.target.value })} placeholder="https://..." />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addCertification}>+ Add certification</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🏆 Achievements</h2>
                    {data.achievements.map((ach, i) => (
                        <div className="pv-item-card" key={i}>
                            <div className="pv-item-header"><button type="button" className="pv-remove-btn" onClick={() => removeAchievement(i)}>Remove</button></div>
                            <label className="pv-label-sm">Title</label>
                            <input className="pv-input" value={ach.title} onChange={(e) => updateAchievement(i, { title: e.target.value })} />
                            <label className="pv-label-sm">Description</label>
                            <textarea className="pv-input pv-textarea-sm" value={ach.description} onChange={(e) => updateAchievement(i, { description: e.target.value })} />
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addAchievement}>+ Add achievement</button>
                </div>

                <div className="pv-section-card">
                    <h2 className="pv-section-title">🔗 Links</h2>
                    <div className="pv-item-card">
                        <label className="pv-label-sm">GitHub</label>
                        <input className="pv-input" value={data.links?.github || ""} onChange={(e) => updateKnownLink("github", e.target.value)} placeholder="https://github.com/username" />
                        <label className="pv-label-sm">LinkedIn</label>
                        <input className="pv-input" value={data.links?.linkedin || ""} onChange={(e) => updateKnownLink("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
                        <label className="pv-label-sm">Portfolio</label>
                        <input className="pv-input" value={data.links?.portfolio || ""} onChange={(e) => updateKnownLink("portfolio", e.target.value)} placeholder="https://yoursite.com" />
                        <label className="pv-label-sm">Email</label>
                        <input className="pv-input" value={data.links?.email || ""} onChange={(e) => updateKnownLink("email", e.target.value)} placeholder="you@example.com" />
                    </div>

                    <h3 className="pv-subheading">Other Links</h3>
                    {otherLinkEntries.map(([key, url], i) => (
                        <div className="pv-item-card pv-link-row" key={i}>
                            <div className="pv-link-field">
                                <label className="pv-label-sm">Label</label>
                                <input className="pv-input" value={key} onChange={(e) => updateOtherLinkKey(key, e.target.value)} placeholder="e.g. Behance" />
                            </div>
                            <div className="pv-link-field pv-link-field-wide">
                                <label className="pv-label-sm">URL</label>
                                <input className="pv-input" value={url} onChange={(e) => updateOtherLinkValue(key, e.target.value)} placeholder="https://..." />
                            </div>
                            <button type="button" className="pv-remove-btn pv-link-remove" onClick={() => removeOtherLink(key)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="pv-add-btn" onClick={addOtherLink}>+ Add other link</button>
                </div>

                {error && <div className="rp-error-banner pv-top-error">{error}</div>}
            </div>

            <div className="pv-sticky-bar">
                <button onClick={() => navigate("/")} className="pv-back-btn">← Back</button>
                <button onClick={handleConfirm} disabled={isSaving} className="rp-btn-primary pv-confirm-btn">
                    {isSaving ? (
                        <span className="rp-btn-content"><Spinner size={14} />Saving...</span>
                    ) : (
                        "Confirm & Create Portfolio →"
                    )}
                </button>
            </div>
        </div>
    );
}

function Spinner({ size = 16 }: { size?: number }) {
    return <span className="rp-spinner" style={{ width: size, height: size }} />;
}

const pvStyles = `
.rp-logo-badge{ width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#6366f1,#a855f7); display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 16px; box-shadow:0 8px 20px rgba(99,102,241,0.35); }
.rp-title{ font-family:'Inter',sans-serif; font-size:26px; font-weight:800; margin:0 0 8px; background:linear-gradient(135deg,#4338ca,#a855f7); -webkit-background-clip:text; background-clip:text; color:transparent; }
.rp-subtitle{ font-family:'Inter',sans-serif; color:#6b7280; font-size:14px; line-height:1.6; margin:0; }
.rp-btn-primary{ border:none; border-radius:12px; background:linear-gradient(135deg,#4f46e5,#9333ea); color:#fff; font-family:'Inter',sans-serif; font-weight:700; font-size:14.5px; cursor:pointer; box-shadow:0 10px 24px rgba(79,70,229,0.3); transition:transform .15s ease; }
.rp-btn-primary:hover{ transform:translateY(-1px); }
.rp-btn-primary:disabled{ opacity:.7; cursor:not-allowed; transform:none; }
.rp-btn-content{ display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.rp-spinner{ display:inline-block; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
.rp-error-banner{ padding:12px 14px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; border-radius:10px; font-family:'Inter',sans-serif; font-size:13.5px; }
.rp-card{ background:#fff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(76,29,149,0.12); }

.pv-page{ min-height:100vh; background:linear-gradient(160deg,#eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%); font-family:'Inter',sans-serif; padding:40px 20px 120px; }
.pv-container{ max-width:760px; margin:0 auto; }
.pv-header{ text-align:center; margin-bottom:28px; }
.pv-section-card{ background:#fff; border-radius:18px; padding:26px 28px; margin-bottom:20px; box-shadow:0 8px 24px rgba(76,29,149,0.06); }
.pv-section-title{ font-size:17px; font-weight:800; color:#1f2937; margin:0 0 18px; }
.pv-subheading{ font-size:14px; font-weight:700; color:#4b5563; margin:20px 0 12px; }
.pv-label{ display:block; font-weight:600; font-size:13px; color:#374151; margin:16px 0 6px; }
.pv-label-sm{ display:block; font-weight:600; font-size:12px; color:#6b7280; margin:10px 0 4px; }
.pv-input{ width:100%; padding:10px 13px; font-size:14px; font-family:inherit; border:1.5px solid #e5e7eb; border-radius:10px; box-sizing:border-box; outline:none; transition:border-color .15s ease, box-shadow .15s ease; background:#fff; color:#111827; }
.pv-input:focus{ border-color:#818cf8; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
.pv-input.invalid{ border-color:#f87171; }
.pv-textarea{ min-height:80px; resize:vertical; }
.pv-textarea-sm{ min-height:60px; resize:vertical; }
.pv-field-error{ color:#dc2626; font-size:12px; margin:4px 0 0; }
.pv-template-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
.pv-template-card{ border:2px solid #e5e7eb; border-radius:14px; padding:14px; background:#fafafa; text-align:left; cursor:pointer; transition:border-color .15s ease, transform .15s ease; }
.pv-template-card:hover{ transform:translateY(-2px); }
.pv-template-card.selected{ background:#fff; box-shadow:0 6px 16px rgba(0,0,0,0.08); }
.pv-template-card:disabled{ opacity:.5; cursor:not-allowed; }
.pv-template-swatch{ width:100%; height:36px; border-radius:8px; margin-bottom:10px; }
.pv-template-name{ font-weight:700; font-size:13.5px; color:#1f2937; }
.pv-template-desc{ font-size:11.5px; color:#9ca3af; margin-top:2px; }
.pv-template-selected{ font-size:11px; font-weight:700; margin-top:6px; }
.pv-item-card{ border:1px solid #eef0f3; border-radius:12px; padding:16px; margin-bottom:14px; background:#fbfbfd; }
.pv-item-header{ display:flex; justify-content:flex-end; margin-bottom:2px; }
.pv-add-btn{ padding:9px 18px; font-size:13px; font-weight:600; border:1.5px dashed #c7c9f5; background:#fff; color:#4f46e5; border-radius:10px; cursor:pointer; }
.pv-add-btn:hover{ background:#f5f5ff; }
.pv-remove-btn{ padding:5px 12px; font-size:12px; font-weight:600; border:none; background:#fee2e2; color:#dc2626; border-radius:8px; cursor:pointer; }
.pv-link-row{ display:flex; gap:12px; align-items:flex-end; }
.pv-link-field{ flex:1; }
.pv-link-field-wide{ flex:2; }
.pv-link-remove{ margin-bottom:1px; }
.pv-top-error{ margin-bottom:20px; }
.pv-sticky-bar{ position:fixed; bottom:0; left:0; right:0; background:rgba(255,255,255,0.92); backdrop-filter:blur(10px); border-top:1px solid #ececf5; padding:14px 20px; display:flex; justify-content:center; gap:12px; z-index:50; }
.pv-back-btn{ padding:13px 22px; font-size:14px; font-weight:600; border:1.5px solid #e5e7eb; background:#fff; color:#374151; border-radius:12px; cursor:pointer; }
.pv-confirm-btn{ padding:13px 26px; min-width:230px; }
.pv-empty-page{ min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(160deg,#eef2ff, #fdf4ff); font-family:'Inter',sans-serif; }
.pv-empty-card{ text-align:center; max-width:360px; }
.pv-empty-icon{ font-size:40px; margin-bottom:14px; }
.pv-empty-card p{ color:#6b7280; margin-bottom:20px; }
@media(max-width:640px){
  .pv-sticky-bar{ flex-direction:column; }
  .pv-confirm-btn, .pv-back-btn{ width:100%; }
}
`;

export default PreviewPage;