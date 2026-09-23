package com.resumeportfolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeportfolio.backend.dto.ParsedResumeDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;
import java.util.Set;

@Service
public class GeminiApiService {

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final Duration RETRY_BASE_DELAY = Duration.ofSeconds(2);
    private static final Set<Integer> RETRYABLE_STATUS_CODES = Set.of(429, 500, 503, 504);

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    public GeminiApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public ParsedResumeDto extractStructuredResume(String resumeText) {

        String prompt = buildPrompt(resumeText);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                },
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        String responseBody;
        try {
            responseBody = webClient.post()
                    .uri("/v1beta/models/" + model + ":generateContent")
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(Retry.backoff(MAX_RETRY_ATTEMPTS, RETRY_BASE_DELAY)
                            .filter(this::isRetryable)
                            .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                    .block();
        } catch (WebClientResponseException e) {
            throw new RuntimeException(mapStatusToFriendlyMessage(e.getStatusCode().value()), e);
        } catch (WebClientRequestException e) {
            throw new RuntimeException(
                    "Couldn't reach the AI service. Please check your connection and try again.", e);
        }

        return parseGeminiResponse(responseBody);
    }

    private boolean isRetryable(Throwable throwable) {
        if (throwable instanceof WebClientResponseException wcre) {
            return RETRYABLE_STATUS_CODES.contains(wcre.getStatusCode().value());
        }
        // Network-level issues (connection reset, DNS blip, etc.) are also worth a retry
        return throwable instanceof WebClientRequestException;
    }

    private String mapStatusToFriendlyMessage(int status) {
        return switch (status) {
            case 429 -> "Our AI service is receiving a lot of requests right now. Please try again in a moment.";
            case 503, 500, 504 -> "Our AI service is temporarily unavailable. Please try again in a moment.";
            case 400 -> "We couldn't process this resume's content. Please try a different file.";
            case 401, 403 -> "We're having trouble authenticating with our AI service. Please try again later.";
            default -> "Something went wrong while analyzing your resume. Please try again.";
        };
    }

    private String buildPrompt(String resumeText) {
        return """
                You are a resume parser. Extract information from the resume text below
                and return ONLY a JSON object with this exact structure, no markdown, no explanation:

                {
                  "name": "string",
                  "title": "string (their professional title/role)",
                  "summary": "string (2-3 sentence professional summary)",
                  "phone": "string (empty string if not found)",
                  "location": "string (city/region, empty string if not found)",
                  "skillCategories": [
                    { "category": "string (e.g. Frontend, Backend, Tools)", "skills": ["string"] }
                  ],
                  "experience": [
                    { "company": "string", "role": "string", "duration": "string", "techStack": "string", "highlights": ["string (one bullet point per achievement)"] }
                  ],
                  "education": [
                    { "school": "string", "degree": "string", "year": "string", "score": "string (CGPA or percentage, empty if not found)" }
                  ],
                  "projects": [
                    { "title": "string", "description": "string", "techStack": "string", "link": "string" }
                  ],
                  "certifications": [
                    { "name": "string", "issuer": "string", "date": "string", "credentialUrl": "string (empty if not found)" }
                  ],
                  "achievements": [
                    { "title": "string", "description": "string" }
                  ],
                  "links": { "github": "string", "linkedin": "string", "portfolio": "string" }
                }

                If a field isn't present in the resume, use an empty string or empty array - never omit a key.
                Group skills into logical categories based on how they appear in the resume (e.g. "Programming Languages", "Frontend", "Backend", "Databases", "Tools").

                RESUME TEXT:
                %s
                """.formatted(resumeText);
    }

    private ParsedResumeDto parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);

            String jsonText = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();

            return objectMapper.readValue(jsonText, ParsedResumeDto.class);

        } catch (Exception e) {
            throw new RuntimeException(
                    "We received a response from our AI service but couldn't understand it. Please try again.", e);
        }
    }
}