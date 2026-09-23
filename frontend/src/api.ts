import axios, { AxiosError } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
    timeout: 30000,
});

export interface SkillCategory {
    category: string;
    skills: string[];
}

export interface Experience {
    company: string;
    role: string;
    duration: string;
    techStack: string;
    highlights: string[];
}

export interface Education {
    school: string;
    degree: string;
    year: string;
    score: string;
}

export interface Project {
    title: string;
    description: string;
    techStack: string;
    link: string;
}

export interface Certification {
    name: string;
    issuer: string;
    date: string;
    credentialUrl: string;
}

export interface Achievement {
    title: string;
    description: string;
}

export interface ParsedResume {
    name: string;
    title: string;
    summary: string;
    phone: string;
    location: string;
    template: string;
    skillCategories: SkillCategory[];
    experience: Experience[];
    education: Education[];
    projects: Project[];
    certifications: Certification[];
    achievements: Achievement[];
    links: Record<string, string>;
}

export interface SavePortfolioResponse {
    slug: string;
    name: string;
    message: string;
}
export interface ContactMessageInput {
    name: string;
    email: string;
    message: string;
}

export async function sendContactMessage(
    slug: string,
    payload: ContactMessageInput
): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/portfolios/${slug}/contact`, payload);
    return response.data;
}
export async function parseResume(file: File): Promise<ParsedResume> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ParsedResume>("/resumes/parse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
}

export async function savePortfolio(
    data: ParsedResume,
    template: string = "bold"
): Promise<SavePortfolioResponse> {
    const response = await api.post<SavePortfolioResponse>("/portfolios", {
        data,
        template,
    });

    return response.data;
}

export async function getPortfolio(slug: string): Promise<ParsedResume> {
    const response = await api.get<ParsedResume>(`/portfolios/${slug}`);
    return response.data;
}

/**
 * Extracts a human-readable message from any error thrown by an api.ts call.
 * Use this in every catch block instead of a hardcoded generic string, so the
 * user actually sees what went wrong (bad file, server down, timeout, etc.)
 */
export function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error?: string }>;

        // Backend responded with our { "error": "..." } shape
        if (axiosErr.response?.data?.error) {
            return axiosErr.response.data.error;
        }

        // Request timed out
        if (axiosErr.code === "ECONNABORTED") {
            return "This is taking longer than expected. Please check your connection and try again.";
        }

        // Backend unreachable (server down, CORS blocked, no network)
        if (!axiosErr.response) {
            return "Can't reach the server right now. Make sure the backend is running and try again.";
        }

        // Backend responded but without our expected error shape
        if (axiosErr.response.status >= 500) {
            return "Something went wrong on our end. Please try again in a moment.";
        }

        return "Something went wrong with that request. Please try again.";
    }

    return "An unexpected error occurred. Please try again.";
}

export default api;