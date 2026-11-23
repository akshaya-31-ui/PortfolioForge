import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { parseResume, getErrorMessage } from "../api";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!document.getElementById("spinner-keyframes")) {
            const style = document.createElement("style");
            style.id = "spinner-keyframes";
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    const validateFile = (f: File): string | null => {
        const lowerName = f.name.toLowerCase();

        const hasValidExtension = ALLOWED_EXTENSIONS.some(
            (ext) => lowerName.endsWith(ext)
        );

        if (!hasValidExtension)
            return "Please upload a .pdf or .docx file.";

        if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
            return `That file is too large. Please upload a resume under ${MAX_FILE_SIZE_MB}MB.`;

        if (f.size === 0)
            return "That file appears to be empty. Please choose a different file.";

        return null;
    };

    const applyFile = (selected: File | null) => {
        setError(null);

        if (selected) {
            const validationError = validateFile(selected);

            if (validationError) {
                setError(validationError);
                setFile(null);
                return;
            }
        }

        setFile(selected);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        applyFile(e.target.files?.[0] ?? null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (isUploading) return;

        const dropped = e.dataTransfer.files?.[0] ?? null;
        applyFile(dropped);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a resume file first.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const parsed = await parseResume(file);
            navigate("/preview", { state: { parsed } });
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="up-page">
            <style>{sharedChromeStyles}</style>

            <div className="up-bg-blob up-blob-1" />
            <div className="up-bg-blob up-blob-2" />
            <div className="up-bg-blob up-blob-3" />

            <div className="up-shell">

                {/* Navigation */}
                <header className="up-navbar">
                    <div className="up-brand">
                        <div className="up-brand-icon">✦</div>
                        <span>PortfolioForge<span className="up-brand-dot">.</span></span>
                    </div>

                    <div className="up-nav-right">
                        <span className="up-nav-label">
                            <span className="up-status-dot" />
                            AI-powered portfolio builder
                        </span>
                        <div className="up-nav-pill">Simple. Smart. Professional.</div>
                    </div>
                </header>

                {/* Main content */}
                <main className="up-main">

                    {/* Left hero section */}
                    <section className="up-hero">
                        <div className="up-eyebrow">
                            <span>✧</span>
                            YOUR CAREER, REIMAGINED
                        </div>

                        <h1 className="up-hero-title">
                            Your resume deserves
                            <span className="up-gradient-text">
                                {" "}a better stage.
                            </span>
                        </h1>

                        <p className="up-hero-description">
                            Turn your resume into a beautiful personal
                            portfolio website. Showcase your skills,
                            experience and projects with just one upload.
                        </p>

                        <div className="up-feature-list">
                            <div className="up-feature">
                                <div className="up-feature-icon">✦</div>
                                <div>
                                    <strong>AI-powered extraction</strong>
                                    <span>Let AI organize your resume information.</span>
                                </div>
                            </div>

                            <div className="up-feature">
                                <div className="up-feature-icon">◈</div>
                                <div>
                                    <strong>Personalized portfolio</strong>
                                    <span>Transform your details into a portfolio.</span>
                                </div>
                            </div>

                            <div className="up-feature">
                                <div className="up-feature-icon">↗</div>
                                <div>
                                    <strong>Ready to share</strong>
                                    <span>Create a portfolio you can share online.</span>
                                </div>
                            </div>
                        </div>

                        <div className="up-trust-note">
                            <span className="up-trust-icon">✓</span>
                            A simpler way to present your professional journey.
                        </div>
                    </section>

                    {/* Upload card */}
                    <section className="up-card-wrap">
                        <div className="up-card">

                            <div className="up-card-top">
                                <div className="up-card-icon">✦</div>
                                <span className="up-card-tag">LET'S GET STARTED</span>
                            </div>

                            <h2 className="up-card-title">
                                Create your portfolio
                            </h2>

                            <p className="up-card-description">
                                Start by uploading your latest resume.
                                We'll take care of the rest.
                            </p>

                            <form onSubmit={handleSubmit}>

                                <div
                                    className={`up-dropzone ${
                                        isDragging ? "dragging" : ""
                                    } ${file ? "has-file" : ""} ${
                                        isUploading ? "upload-disabled" : ""
                                    }`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (!isUploading) setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        !isUploading && inputRef.current?.click()
                                    }
                                    role="button"
                                    tabIndex={isUploading ? -1 : 0}
                                    aria-label="Choose or drop your resume"
                                    onKeyDown={(e) => {
                                        if (
                                            !isUploading &&
                                            (e.key === "Enter" || e.key === " ")
                                        ) {
                                            e.preventDefault();
                                            inputRef.current?.click();
                                        }
                                    }}
                                >
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        style={{ display: "none" }}
                                    />

                                    {file ? (
                                        <>
                                            <div className="up-selected-icon">
                                                <span>✓</span>
                                            </div>

                                            <div className="up-file-name">
                                                {file.name}
                                            </div>

                                            <div className="up-dropzone-hint">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                {" "}· Click or drop to replace
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="up-upload-icon">
                                                <svg
                                                    viewBox="0 0 48 48"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M24 31V9m0 0L15 18m9-9 9 9"
                                                        stroke="currentColor"
                                                        strokeWidth="2.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M10 29v9a3 3 0 003 3h22a3 3 0 003-3v-9"
                                                        stroke="currentColor"
                                                        strokeWidth="2.8"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>

                                            <h3 className="up-dropzone-title">
                                                Drop your resume here
                                            </h3>

                                            <p className="up-dropzone-hint">
                                                or <span>browse files</span> from your device
                                            </p>
                                        </>
                                    )}

                                    <div className="up-file-types">
                                        <span className="up-file-type">PDF</span>
                                        <span className="up-file-type">DOCX</span>
                                        <span className="up-file-size">
                                            Maximum 10 MB
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="up-submit-btn"
                                >
                                    {isUploading ? (
                                        <span className="up-btn-content">
                                            <Spinner size={17} />
                                            Processing your resume...
                                        </span>
                                    ) : (
                                        <>
                                            Generate my portfolio
                                            <span className="up-btn-arrow">→</span>
                                        </>
                                    )}
                                </button>

                                {isUploading && (
                                    <p className="up-processing-note">
                                        Reading your resume with AI. This can take
                                        up to 30 seconds.
                                    </p>
                                )}
                            </form>

                            {error && (
                                <div className="up-error-banner" role="alert">
                                    <span>!</span>
                                    {error}
                                </div>
                            )}

                            <div className="up-card-footer">
                                <span>✧</span>
                                Your next professional chapter starts here.
                            </div>
                        </div>

                        <div className="up-card-decoration">
                            <span>✦</span>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="up-footer">
                    <span>© {new Date().getFullYear()} Portfolia</span>
                    <span>Made to showcase your potential <span className="up-heart">♥</span></span>
                </footer>
            </div>
        </div>
    );
}

function Spinner({ size = 16 }: { size?: number }) {
    return (
        <span
            className="up-spinner"
            style={{ width: size, height: size }}
        />
    );
}

const sharedChromeStyles = `
.up-page,
.up-page * {
    box-sizing: border-box;
}

.up-page {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 6%;
    background:
        radial-gradient(ellipse at 12% 12%, rgba(196,181,253,.38), transparent 32%),
        radial-gradient(ellipse at 88% 78%, rgba(232,121,249,.20), transparent 32%),
        linear-gradient(135deg, #f8f7ff 0%, #f5f3ff 48%, #fff8ff 100%);
    color: #20183b;
    font-family: 'Inter', 'Segoe UI', sans-serif;
}

.up-bg-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(85px);
    pointer-events: none;
    z-index: 0;
}

.up-blob-1 {
    width: 300px;
    height: 300px;
    background: rgba(129, 140, 248, .20);
    top: -130px;
    left: -110px;
}

.up-blob-2 {
    width: 360px;
    height: 360px;
    background: rgba(216, 180, 254, .24);
    bottom: -180px;
    right: -100px;
}

.up-blob-3 {
    width: 180px;
    height: 180px;
    background: rgba(196, 181, 253, .15);
    top: 42%;
    right: 36%;
}

.up-shell {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.up-navbar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 0;
    border-bottom: 1px solid rgba(139, 92, 246, .12);
}

.up-brand {
    display: flex;
    align-items: center;
    gap: 11px;
    color: #29204a;
    font-size: 22px;
    font-weight: 850;
    letter-spacing: -1px;
}

.up-brand-icon {
    width: 39px;
    height: 39px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    color: white;
    font-size: 22px;
    background: linear-gradient(135deg, #5545e8, #a044ed);
    box-shadow: 0 7px 18px rgba(104, 75, 226, .28);
}

.up-brand-dot {
    color: #9850ec;
}

.up-nav-right {
    display: flex;
    align-items: center;
    gap: 19px;
}

.up-nav-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #756d8e;
    font-size: 12px;
    font-weight: 600;
}

.up-status-dot {
    width: 7px;
    height: 7px;
    background: #36b98a;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(54,185,138,.12);
}

.up-nav-pill {
    padding: 8px 13px;
    border: 1px solid rgba(139,92,246,.17);
    border-radius: 30px;
    color: #7252bd;
    background: rgba(255,255,255,.55);
    font-size: 11px;
    font-weight: 650;
}

.up-main {
    min-height: 610px;
    display: grid;
    grid-template-columns: 1.05fr .95fr;
    align-items: center;
    gap: 75px;
    padding: 65px 0 55px;
}

.up-hero {
    max-width: 500px;
}

.up-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 9px 14px;
    margin-bottom: 24px;
    border-radius: 30px;
    color: #7552ce;
    background: rgba(255,255,255,.7);
    border: 1px solid rgba(139,92,246,.16);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
}

.up-eyebrow span {
    font-size: 17px;
}

.up-hero-title {
    margin: 0 0 22px;
    color: #251b42;
    font-size: clamp(38px, 4.3vw, 57px);
    font-weight: 850;
    line-height: 1.12;
    letter-spacing: -2.5px;
    text-align: left;
}

.up-gradient-text {
    display: inline;
    color: #8450e9;
    background: linear-gradient(100deg, #5745dc, #a04ce8);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.up-hero-description {
    max-width: 445px;
    margin: 0;
    color: #77708b;
    font-size: 15px;
    line-height: 1.85;
    text-align: left;
}

.up-feature-list {
    display: flex;
    flex-direction: column;
    gap: 21px;
    margin-top: 37px;
}

.up-feature {
    display: flex;
    align-items: center;
    gap: 15px;
    text-align: left;
}

.up-feature-icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(139,92,246,.13);
    border-radius: 14px;
    color: #8152db;
    background: rgba(255,255,255,.8);
    font-size: 19px;
    box-shadow: 0 5px 15px rgba(75,50,130,.05);
}

.up-feature strong {
    display: block;
    color: #35294e;
    font-size: 13px;
    font-weight: 750;
    margin-bottom: 4px;
}

.up-feature span {
    color: #8b849c;
    font-size: 11.5px;
}

.up-trust-note {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 38px;
    color: #8a819e;
    font-size: 11px;
}

.up-trust-icon {
    width: 19px;
    height: 19px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #389c7b;
    background: #e2f7ed;
    font-size: 11px;
    font-weight: 800;
}

.up-card-wrap {
    position: relative;
    width: 100%;
    max-width: 465px;
    justify-self: end;
}

.up-card {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 36px;
    border: 1px solid rgba(255,255,255,.9);
    border-radius: 25px;
    background: rgba(255,255,255,.91);
    box-shadow:
        0 25px 75px rgba(80, 54, 145, .11),
        0 5px 18px rgba(80, 54, 145, .04);
    backdrop-filter: blur(15px);
}

.up-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
}

.up-card-icon {
    width: 47px;
    height: 47px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    color: white;
    background: linear-gradient(135deg, #5745e7, #a34bec);
    box-shadow: 0 8px 20px rgba(112, 72, 219, .27);
    font-size: 23px;
}

.up-card-tag {
    padding: 7px 10px;
    border-radius: 20px;
    color: #8862ce;
    background: #f5f0ff;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.1px;
}

.up-card-title {
    margin: 0 0 9px;
    color: #29203e;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -.8px;
    text-align: left;
}

.up-card-description {
    margin: 0 0 26px;
    color: #888197;
    font-size: 12.5px;
    line-height: 1.7;
    text-align: left;
}

.up-dropzone {
    min-height: 225px;
    padding: 28px 17px 19px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1.7px dashed #c9b9ed;
    border-radius: 17px;
    background: linear-gradient(145deg, #fcfbff, #f8f5ff);
    text-align: center;
    cursor: pointer;
    transition: all .22s ease;
    margin-bottom: 20px;
}

.up-dropzone:hover {
    border-color: #8d65e6;
    background: #f7f3ff;
    transform: translateY(-2px);
}

.up-dropzone.dragging {
    border: 2px dashed #7047dc;
    background: #f0eaff;
    transform: scale(1.015);
}

.up-dropzone.has-file {
    border-style: solid;
    border-color: #9a78e5;
    background: #f7f3ff;
}

.up-dropzone.upload-disabled {
    cursor: not-allowed;
    opacity: .75;
}

.up-upload-icon {
    width: 57px;
    height: 57px;
    display: grid;
    place-items: center;
    margin-bottom: 15px;
    border-radius: 17px;
    color: #7953dc;
    background: #eee8ff;
}

.up-upload-icon svg {
    width: 31px;
    height: 31px;
}

.up-dropzone-title {
    margin: 0 0 8px;
    color: #332747;
    font-size: 14px;
    font-weight: 750;
}

.up-dropzone-hint {
    color: #9991a9;
    font-size: 11.5px;
    line-height: 1.6;
}

.up-dropzone-hint span {
    color: #8255dc;
    font-weight: 750;
    text-decoration: underline;
    text-underline-offset: 3px;
}

.up-file-types {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 21px;
}

.up-file-type {
    padding: 5px 9px;
    border: 1px solid #e9e1f8;
    border-radius: 6px;
    color: #7758b7;
    background: white;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .5px;
}

.up-file-size {
    margin-left: 4px;
    color: #a39bae;
    font-size: 10px;
}

.up-selected-icon {
    width: 49px;
    height: 49px;
    display: grid;
    place-items: center;
    margin-bottom: 13px;
    border-radius: 50%;
    color: #248c68;
    background: #e1f7ed;
    font-size: 24px;
    font-weight: 800;
}

.up-file-name {
    max-width: 100%;
    margin-bottom: 5px;
    color: #6043b6;
    font-size: 13px;
    font-weight: 750;
    overflow-wrap: anywhere;
}

.up-submit-btn {
    width: 100%;
    min-height: 53px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    border-radius: 12px;
    color: white;
    background: linear-gradient(105deg, #5543e6, #953ce5);
    box-shadow: 0 9px 22px rgba(107, 69, 211, .27);
    font-family: inherit;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: all .2s ease;
}

.up-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 13px 27px rgba(107, 69, 211, .35);
    filter: brightness(1.04);
}

.up-submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.up-submit-btn:disabled {
    opacity: .7;
    cursor: not-allowed;
}

.up-btn-arrow {
    font-size: 19px;
    transition: transform .2s ease;
}

.up-submit-btn:hover:not(:disabled) .up-btn-arrow {
    transform: translateX(4px);
}

.up-btn-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.up-spinner {
    display: inline-block;
    flex-shrink: 0;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin .7s linear infinite;
}

.up-processing-note {
    margin-top: 13px;
    color: #9188a1;
    font-size: 11px;
    line-height: 1.6;
    text-align: center;
}

.up-error-banner {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 16px;
    padding: 12px 13px;
    border: 1px solid #fecaca;
    border-radius: 10px;
    color: #b91c1c;
    background: #fef2f2;
    font-size: 11.5px;
    line-height: 1.6;
    text-align: left;
}

.up-error-banner span {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: white;
    background: #dc5555;
    font-size: 11px;
    font-weight: 800;
}

.up-card-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-top: 23px;
    padding-top: 18px;
    border-top: 1px solid #f0edf5;
    color: #aaa2b7;
    font-size: 10px;
}

.up-card-footer span {
    color: #a17ae6;
}

.up-card-decoration {
    position: absolute;
    z-index: 1;
    top: -16px;
    right: -15px;
    width: 55px;
    height: 55px;
    display: grid;
    place-items: center;
    border: 5px solid #f7f4ff;
    border-radius: 17px;
    color: white;
    background: linear-gradient(135deg, #a36aef, #694de1);
    box-shadow: 0 8px 18px rgba(102, 72, 183, .19);
    font-size: 19px;
}

.up-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 21px 0;
    border-top: 1px solid rgba(139, 92, 246, .12);
    color: #a19aaf;
    font-size: 10.5px;
}

.up-heart {
    color: #e58ba8;
    margin-left: 3px;
}

/* Tablet */
@media (max-width: 900px) {
    .up-page {
        padding: 0 5%;
    }

    .up-main {
        gap: 35px;
        padding: 55px 0;
    }

    .up-hero-title {
        font-size: 42px;
    }

    .up-card {
        padding: 27px;
    }

    .up-nav-pill {
        display: none;
    }
}

/* Mobile */
@media (max-width: 650px) {
    .up-page {
        padding: 0 19px;
    }

    .up-navbar {
        padding: 18px 0;
    }

    .up-brand {
        font-size: 20px;
    }

    .up-brand-icon {
        width: 35px;
        height: 35px;
    }

    .up-nav-label {
        font-size: 0;
    }

    .up-status-dot {
        width: 9px;
        height: 9px;
    }

    .up-main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 38px;
        padding: 43px 0 35px;
    }

    .up-hero {
        max-width: 100%;
    }

    .up-eyebrow {
        margin-bottom: 18px;
        font-size: 9px;
    }

    .up-hero-title {
        font-size: clamp(36px, 10vw, 46px);
        letter-spacing: -1.8px;
    }

    .up-hero-description {
        font-size: 13px;
    }

    .up-feature-list {
        gap: 16px;
        margin-top: 25px;
    }

    .up-feature-icon {
        width: 39px;
        height: 39px;
    }

    .up-trust-note {
        margin-top: 25px;
        font-size: 10px;
    }

    .up-card-wrap {
        max-width: 100%;
    }

    .up-card {
        padding: 25px 20px;
        border-radius: 20px;
    }

    .up-card-title {
        font-size: 22px;
    }

    .up-dropzone {
        min-height: 205px;
        padding: 23px 12px;
    }

    .up-footer {
        gap: 12px;
        font-size: 9px;
    }
}

/* Small mobile */
@media (max-width: 360px) {
    .up-card {
        padding: 21px 15px;
    }

    .up-hero-title {
        font-size: 34px;
    }

    .up-file-types {
        gap: 5px;
    }

    .up-file-size {
        font-size: 9px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .up-page *,
    .up-page *::before,
    .up-page *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
    }
}
`;

export default UploadPage;