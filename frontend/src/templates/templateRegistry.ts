import type { ComponentType } from "react";
import TemplateBold from "./TemplateBold";
import TemplateTerminal from "./TemplateTerminal";
import TemplateProfile from "./TemplateProfile";
import TemplateVibrant from "./TemplateVibrant";
import type { ParsedResume } from "../api";

export interface TemplateDefinition {
    id: string;
    name: string;
    description: string;
    accentColor: string;
    component: ComponentType<{ data: ParsedResume; slug: string}> | null;
    available: boolean;
}

export const templates: TemplateDefinition[] = [
    {
        id: "bold",
        name: "Bold Gold",
        description: "Glass-morphism cards, gold accents, scroll animations",
        accentColor: "#f2b705",
        component: TemplateBold,
        available: true,
    },
    {
        id: "developer",
        name: "Developer",
        description: "Terminal-inspired, typing intro, numbered sections",
        accentColor: "#39d353",
        component: TemplateTerminal,
        available: true,
    },
    {
        id: "profile",
        name: "Profile",
        description: "Editorial profile-card layout with timeline sections",
        accentColor: "#c9a95c",
        component: TemplateProfile,
        available: true,
    },
    {
        id: "creative",
        name: "Creative",
        description: "Bold gradients, color-coded cards, playful energy",
        accentColor: "#6c5ce7",
        component: TemplateVibrant,
        available: true,
    },
];

export function getTemplateById(id: string): TemplateDefinition {
    return templates.find((t) => t.id === id && t.available) ?? templates[0];
}