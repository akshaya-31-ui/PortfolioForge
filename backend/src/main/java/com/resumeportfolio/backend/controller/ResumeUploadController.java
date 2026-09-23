package com.resumeportfolio.backend.controller;

import com.resumeportfolio.backend.dto.ParsedResumeDto;
import com.resumeportfolio.backend.service.GeminiApiService;
import com.resumeportfolio.backend.service.TextExtractionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeUploadController {

    private final TextExtractionService textExtractionService;
    private final GeminiApiService geminiApiService;

    public ResumeUploadController(TextExtractionService textExtractionService,
                                  GeminiApiService geminiApiService) {
        this.textExtractionService = textExtractionService;
        this.geminiApiService = geminiApiService;
    }

    // Renamed from /upload to /parse - this ONLY extracts + parses, does NOT save
    @PostMapping("/parse")
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No file was uploaded."));
        }

        try {
            String extractedText = textExtractionService.extractText(file);

            if (extractedText == null || extractedText.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Could not extract any text from this file. It may be a scanned/image-based document."));
            }

            ParsedResumeDto structuredResume = geminiApiService.extractStructuredResume(extractedText);

            return ResponseEntity.ok(structuredResume);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to read the uploaded file. Please try again."));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to parse resume with AI: " + e.getMessage()));
        }
    }
}