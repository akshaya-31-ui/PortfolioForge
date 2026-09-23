package com.resumeportfolio.backend.controller;

import com.resumeportfolio.backend.dto.ParsedResumeDto;
import com.resumeportfolio.backend.entity.Portfolio;
import com.resumeportfolio.backend.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    // NEW: saves the (possibly user-edited) parsed resume data
    @PostMapping
    public ResponseEntity<?> createPortfolio(@RequestBody CreatePortfolioRequest request) {
        try {
            Portfolio saved = portfolioService.saveFromParsedResume(request.data, request.template);

            return ResponseEntity.ok(Map.of(
                    "slug", saved.getSlug(),
                    "name", saved.getName(),
                    "message", "Portfolio created successfully"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to save portfolio: " + e.getMessage()));
        }
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getPortfolio(@PathVariable String slug) {
        try {
            ParsedResumeDto dto = portfolioService.findBySlugAsDto(slug);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Portfolio not found for slug: " + slug));
        }
    }

    // Small inner class to represent the JSON body: { "data": {...}, "template": "minimal" }
    public static class CreatePortfolioRequest {
        public ParsedResumeDto data;
        public String template;
    }
}