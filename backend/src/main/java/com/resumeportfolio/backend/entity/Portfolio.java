package com.resumeportfolio.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolios")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 150)
    private String slug;

    @Column(length = 150)
    private String name;

    @Column(length = 150)
    private String title;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String location;

    @Column(columnDefinition = "LONGTEXT")
    private String summary;

    @Column(columnDefinition = "LONGTEXT")
    private String skillCategoriesJson;

    @Column(columnDefinition = "LONGTEXT")
    private String experienceJson;

    @Column(columnDefinition = "LONGTEXT")
    private String educationJson;

    @Column(columnDefinition = "LONGTEXT")
    private String projectsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String certificationsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String achievementsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String linksJson;

    @Column(length = 50)
    private String template = "minimal";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Portfolio() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getSkillCategoriesJson() { return skillCategoriesJson; }
    public void setSkillCategoriesJson(String skillCategoriesJson) { this.skillCategoriesJson = skillCategoriesJson; }
    public String getExperienceJson() { return experienceJson; }
    public void setExperienceJson(String experienceJson) { this.experienceJson = experienceJson; }
    public String getEducationJson() { return educationJson; }
    public void setEducationJson(String educationJson) { this.educationJson = educationJson; }
    public String getProjectsJson() { return projectsJson; }
    public void setProjectsJson(String projectsJson) { this.projectsJson = projectsJson; }
    public String getCertificationsJson() { return certificationsJson; }
    public void setCertificationsJson(String certificationsJson) { this.certificationsJson = certificationsJson; }
    public String getAchievementsJson() { return achievementsJson; }
    public void setAchievementsJson(String achievementsJson) { this.achievementsJson = achievementsJson; }
    public String getLinksJson() { return linksJson; }
    public void setLinksJson(String linksJson) { this.linksJson = linksJson; }
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}