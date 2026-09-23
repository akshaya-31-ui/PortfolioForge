package com.resumeportfolio.backend.controller;

import com.resumeportfolio.backend.dto.ContactRequest;
import com.resumeportfolio.backend.dto.ParsedResumeDto;
import com.resumeportfolio.backend.service.EmailService;
import com.resumeportfolio.backend.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/portfolios")
public class ContactController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final PortfolioService portfolioService;
    private final EmailService emailService;

    public ContactController(PortfolioService portfolioService, EmailService emailService) {
        this.portfolioService = portfolioService;
        this.emailService = emailService;
    }

    @PostMapping("/{slug}/contact")
    public ResponseEntity<?> submitContactForm(@PathVariable String slug, @RequestBody ContactRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter your name."));
        }
        if (request.getEmail() == null || !EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter a valid email address."));
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please enter a message."));
        }

        ParsedResumeDto portfolio;
        try {
            portfolio = portfolioService.findBySlugAsDto(slug);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Portfolio not found."));
        }

        String ownerEmail = portfolio.getLinks() != null ? portfolio.getLinks().get("email") : null;
        if (ownerEmail == null || ownerEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "This portfolio owner hasn't set up a contact email yet."));
        }

        try {
            emailService.sendContactMessage(
                    ownerEmail,
                    portfolio.getName(),
                    request.getName().trim(),
                    request.getEmail().trim(),
                    request.getMessage().trim()
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "We couldn't send your message right now. Please try again later."));
        }

        return ResponseEntity.ok(Map.of("message", "Your message was sent successfully."));
    }
}