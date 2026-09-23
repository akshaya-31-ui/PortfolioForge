package com.resumeportfolio.backend.dto;

import java.util.List;
import java.util.Map;

public class ParsedResumeDto {

    private String name;
    private String title;
    private String summary;
    private String phone;
    private String location;
    private String template;

    private List<SkillCategory> skillCategories;
    private List<Experience> experience;
    private List<Education> education;
    private List<Project> projects;
    private List<Certification> certifications;
    private List<Achievement> achievements;
    private Map<String, String> links;
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public static class SkillCategory {
        private String category;
        private List<String> skills;

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    public static class Experience {
        private String company;
        private String role;
        private String duration;
        private String techStack;
        private List<String> highlights;

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        public String getTechStack() { return techStack; }
        public void setTechStack(String techStack) { this.techStack = techStack; }
        public List<String> getHighlights() { return highlights; }
        public void setHighlights(List<String> highlights) { this.highlights = highlights; }
    }

    public static class Education {
        private String school;
        private String degree;
        private String year;
        private String score;

        public String getSchool() { return school; }
        public void setSchool(String school) { this.school = school; }
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
        public String getScore() { return score; }
        public void setScore(String score) { this.score = score; }
    }

    public static class Project {
        private String title;
        private String description;
        private String techStack;
        private String link;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTechStack() { return techStack; }
        public void setTechStack(String techStack) { this.techStack = techStack; }
        public String getLink() { return link; }
        public void setLink(String link) { this.link = link; }
    }

    public static class Certification {
        private String name;
        private String issuer;
        private String date;
        private String credentialUrl;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIssuer() { return issuer; }
        public void setIssuer(String issuer) { this.issuer = issuer; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getCredentialUrl() { return credentialUrl; }
        public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
    }

    public static class Achievement {
        private String title;
        private String description;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<SkillCategory> getSkillCategories() { return skillCategories; }
    public void setSkillCategories(List<SkillCategory> skillCategories) { this.skillCategories = skillCategories; }
    public List<Experience> getExperience() { return experience; }
    public void setExperience(List<Experience> experience) { this.experience = experience; }
    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }
    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
    public List<Certification> getCertifications() { return certifications; }
    public void setCertifications(List<Certification> certifications) { this.certifications = certifications; }
    public List<Achievement> getAchievements() { return achievements; }
    public void setAchievements(List<Achievement> achievements) { this.achievements = achievements; }
    public Map<String, String> getLinks() { return links; }
    public void setLinks(Map<String, String> links) { this.links = links; }
}