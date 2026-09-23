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
        if (typeof document !== "undefined" && !document.getElementById("spinner-keyframes")) {
            const style = document.createElement("style");
            style.id = "spinner-keyframes";
            style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }
    }, []);

    const validateFile = (f: File): string | null => {
        const lowerName = f.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
        if (!hasValidExtension) return "Please upload a .pdf or .docx file.";
        if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `That file is too large. Please upload a resume under ${MAX_FILE_SIZE_MB}MB.`;
        if (f.size === 0) return "That file appears to be empty. Please choose a different file.";
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <div className="rp-card up-card">
                <div className="rp-logo-badge">✨</div>
                <h1 className="rp-title">Resume → Portfolio</h1>
                <p className="rp-subtitle">Upload your resume and we'll turn it into a live, shareable portfolio site in seconds.</p>

                <form onSubmit={handleSubmit}>
                    <div
                        className={`up-dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); if (!isUploading) setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && inputRef.current?.click()}
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
                                <div className="up-dropzone-icon">📄</div>
                                <div className="up-file-name">{file.name}</div>
                                <div className="up-dropzone-hint">Click or drop to replace</div>
                            </>
                        ) : (
                            <>
                                <div className="up-dropzone-icon">⬆️</div>
                                <div className="up-dropzone-title">Drop your resume here</div>
                                <div className="up-dropzone-hint">or click to browse — PDF or DOCX, up to {MAX_FILE_SIZE_MB}MB</div>
                            </>
                        )}
                    </div>

                    <button type="submit" disabled={isUploading} className="rp-btn-primary up-submit-btn">
                        {isUploading ? (
                            <span className="rp-btn-content">
                                <Spinner size={14} />
                                Processing...
                            </span>
                        ) : (
                            "Generate Portfolio →"
                        )}
                    </button>

                    {isUploading && <p className="up-processing-note">Reading your resume with AI — this can take up to 30 seconds.</p>}
                </form>

                {error && <div className="rp-error-banner">{error}</div>}
            </div>
        </div>
    );
}

function Spinner({ size = 16 }: { size?: number }) {
    return <span className="rp-spinner" style={{ width: size, height: size }} />;
}

const sharedChromeStyles = `
.rp-card{ background:#fff; border-radius:20px; padding:40px; box-shadow:0 20px 60px rgba(76,29,149,0.12); position:relative; z-index:1; }
.rp-logo-badge{ width:52px; height:52px; border-radius:16px; background:linear-gradient(135deg,#6366f1,#a855f7); display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:20px; box-shadow:0 8px 20px rgba(99,102,241,0.35); }
.rp-title{ font-family:'Inter',sans-serif; font-size:28px; font-weight:800; margin:0 0 10px; background:linear-gradient(135deg,#4338ca,#a855f7); -webkit-background-clip:text; background-clip:text; color:transparent; }
.rp-subtitle{ font-family:'Inter',sans-serif; color:#6b7280; font-size:14.5px; line-height:1.6; margin:0 0 28px; }
.rp-btn-primary{ width:100%; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#4f46e5,#9333ea); color:#fff; font-family:'Inter',sans-serif; font-weight:700; font-size:14.5px; cursor:pointer; box-shadow:0 10px 24px rgba(79,70,229,0.35); transition:transform .15s ease, box-shadow .15s ease; }
.rp-btn-primary:hover{ transform:translateY(-1px); box-shadow:0 14px 30px rgba(79,70,229,0.4); }
.rp-btn-primary:disabled{ opacity:.7; cursor:not-allowed; transform:none; }
.rp-btn-content{ display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.rp-spinner{ display:inline-block; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
.rp-error-banner{ margin-top:16px; padding:12px 14px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; border-radius:10px; font-family:'Inter',sans-serif; font-size:13.5px; }

.up-page{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; position:relative; overflow:hidden;
  background:linear-gradient(160deg,#eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%); }
.up-bg-blob{ position:absolute; border-radius:50%; filter:blur(90px); opacity:.35; z-index:0; }
.up-blob-1{ width:380px; height:380px; background:#a5b4fc; top:-100px; left:-100px; }
.up-blob-2{ width:340px; height:340px; background:#f0abfc; bottom:-100px; right:-80px; }
.up-card{ max-width:480px; width:100%; }
.up-dropzone{ border:2px dashed #d1d5db; border-radius:16px; padding:36px 20px; text-align:center; cursor:pointer; transition:border-color .15s ease, background .15s ease; background:#fafafa; margin-bottom:22px; }
.up-dropzone:hover{ border-color:#a5b4fc; background:#f5f5ff; }
.up-dropzone.dragging{ border-color:#6366f1; background:#eef2ff; }
.up-dropzone.has-file{ border-color:#8b5cf6; background:#f5f3ff; border-style:solid; }
.up-dropzone-icon{ font-size:30px; margin-bottom:10px; }
.up-dropzone-title{ font-family:'Inter',sans-serif; font-weight:700; font-size:15px; color:#111827; margin-bottom:6px; }
.up-dropzone-hint{ font-family:'Inter',sans-serif; font-size:12.5px; color:#9ca3af; }
.up-file-name{ font-family:'Inter',sans-serif; font-weight:700; font-size:14px; color:#4338ca; margin-bottom:4px; word-break:break-all; }
.up-submit-btn{ margin-top:4px; }
.up-processing-note{ font-family:'Inter',sans-serif; font-size:12.5px; color:#9ca3af; text-align:center; margin-top:14px; }
`;

export default UploadPage;