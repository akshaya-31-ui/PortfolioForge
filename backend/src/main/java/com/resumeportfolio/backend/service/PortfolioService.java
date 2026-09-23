package com.resumeportfolio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeportfolio.backend.dto.ParsedResumeDto;
import com.resumeportfolio.backend.entity.Portfolio;
import com.resumeportfolio.backend.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final SlugGeneratorService slugGeneratorService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PortfolioService(PortfolioRepository portfolioRepository,
                            SlugGeneratorService slugGeneratorService) {
        this.portfolioRepository = portfolioRepository;
        this.slugGeneratorService = slugGeneratorService;
    }

    public Portfolio saveFromParsedResume(ParsedResumeDto parsed, String template) {
        try {
            Portfolio portfolio = new Portfolio();

            portfolio.setSlug(slugGeneratorService.generateUniqueSlug(parsed.getName()));
            portfolio.setName(parsed.getName());
            portfolio.setTitle(parsed.getTitle());
            portfolio.setPhone(parsed.getPhone());
            portfolio.setLocation(parsed.getLocation());
            portfolio.setSummary(parsed.getSummary());
            portfolio.setSkillCategoriesJson(objectMapper.writeValueAsString(parsed.getSkillCategories()));
            portfolio.setExperienceJson(objectMapper.writeValueAsString(parsed.getExperience()));
            portfolio.setEducationJson(objectMapper.writeValueAsString(parsed.getEducation()));
            portfolio.setProjectsJson(objectMapper.writeValueAsString(parsed.getProjects()));
            portfolio.setCertificationsJson(objectMapper.writeValueAsString(parsed.getCertifications()));
            portfolio.setAchievementsJson(objectMapper.writeValueAsString(parsed.getAchievements()));
            portfolio.setLinksJson(objectMapper.writeValueAsString(parsed.getLinks()));
            portfolio.setTemplate(template != null ? template : "minimal");

            return portfolioRepository.save(portfolio);

        } catch (Exception e) {
            throw new RuntimeException("Failed to save portfolio: " + e.getMessage(), e);
        }
    }

    public ParsedResumeDto findBySlugAsDto(String slug) {
        Portfolio p = portfolioRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("No portfolio found for slug: " + slug));

        try {
            ParsedResumeDto dto = new ParsedResumeDto();
            dto.setName(p.getName());
            dto.setTemplate(p.getTemplate());
            dto.setTitle(p.getTitle());
            dto.setPhone(p.getPhone());
            dto.setLocation(p.getLocation());
            dto.setSummary(p.getSummary());
            dto.setSkillCategories(objectMapper.readValue(p.getSkillCategoriesJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.SkillCategory.class)));
            dto.setExperience(objectMapper.readValue(p.getExperienceJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.Experience.class)));
            dto.setEducation(objectMapper.readValue(p.getEducationJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.Education.class)));
            dto.setProjects(objectMapper.readValue(p.getProjectsJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.Project.class)));
            dto.setCertifications(objectMapper.readValue(p.getCertificationsJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.Certification.class)));
            dto.setAchievements(objectMapper.readValue(p.getAchievementsJson(),
                    objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, ParsedResumeDto.Achievement.class)));
            dto.setLinks(objectMapper.readValue(p.getLinksJson(),
                    objectMapper.getTypeFactory().constructMapType(java.util.Map.class, String.class, String.class)));

            return dto;

        } catch (Exception e) {
            throw new RuntimeException("Failed to load portfolio data: " + e.getMessage(), e);
        }
    }
}