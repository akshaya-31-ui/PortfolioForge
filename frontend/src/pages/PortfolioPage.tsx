import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import JSZip from "jszip";
import { getPortfolio, type ParsedResume } from "../api";
import { getTemplateById } from "../templates/templateRegistry";

function PortfolioPage() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<ParsedResume | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!slug) return;
        getPortfolio(slug)
            .then(setData)
            .catch(() => setError("Portfolio not found."));
    }, [slug]);

    const buildStandaloneHTML = (): string => {
        const markup = containerRef.current?.innerHTML || "";
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${data?.name || "Portfolio"} — Portfolio</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
  [class*="-reveal"] { opacity: 1 !important; transform: none !important; }
</style>
</head>
<body>
${markup}
</body>
</html>`;
    };

    const buildReadme = (): string => {
        return `${data?.name || "Your"}'s Portfolio — Deployment Guide
============================================================

This folder contains a complete, ready-to-host website. No build step,
no dependencies — just index.html.

DEPLOY IT LIVE IN UNDER A MINUTE — PICK ONE:

Option 1: Netlify Drop (fastest, no signup needed to try it)
--------------------------------------------------------------
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page
3. Netlify gives you a live URL instantly — share it with anyone
   (create a free account to keep the link permanently + add a custom domain)

Option 2: GitHub Pages (free, great if you already use GitHub)
--------------------------------------------------------------
1. Create a new GitHub repository
2. Upload index.html to the repo (keep the filename exactly "index.html")
3. Go to Settings -> Pages -> set source to your main branch, root folder
4. Your site goes live at https://<your-username>.github.io/<repo-name>/

Option 3: Vercel
--------------------------------------------------------------
1. Go to https://vercel.com/new
2. Import this folder as a new project
3. Vercel gives you a live URL immediately

A NOTE ON THE CONTACT FORM
--------------------------------------------------------------
This is a static snapshot, so the contact form won't send messages by
itself once it's off our platform (there's no backend attached to a
plain HTML file). If you want the form to work after deploying, connect
it to a free form service like:
  - Formspree: https://formspree.io
  - EmailJS:   https://www.emailjs.com
by updating the <form> tag in index.html to point at their endpoint.
`;
    };

    const handleDownloadDeploy = async () => {
        if (!containerRef.current || !data) return;
        setDownloading(true);

        try {
            const zip = new JSZip();
            zip.file("index.html", buildStandaloneHTML());
            zip.file("README.txt", buildReadme());

            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug || "portfolio"}-deploy.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    };

    if (error) return <p style={{ textAlign: "center", marginTop: 80 }}>{error}</p>;
    if (!data) return <p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>;

    const template = getTemplateById(data.template);
    const TemplateComponent = template.component;

    if (!TemplateComponent) {
        return <p style={{ textAlign: "center", marginTop: 80 }}>Template not available.</p>;
    }

    return (
        <>
            <div className="no-print" style={downloadBarStyle}>
                <button onClick={handleDownloadDeploy} disabled={downloading} style={downloadBtnStyle}>
                    {downloading ? "Preparing..." : "⬇ Download Deployable Site"}
                </button>
            </div>

            <div ref={containerRef}>
                <TemplateComponent data={data} slug={slug!} />
            </div>
        </>
    );
}

const downloadBarStyle: React.CSSProperties = {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 999,
    display: "flex",
    gap: 8,
};

const downloadBtnStyle: React.CSSProperties = {
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

export default PortfolioPage;