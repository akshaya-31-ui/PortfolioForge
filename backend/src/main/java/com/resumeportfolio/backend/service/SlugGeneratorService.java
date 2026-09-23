package com.resumeportfolio.backend.service;

import com.resumeportfolio.backend.repository.PortfolioRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Random;

@Service
public class SlugGeneratorService {

    private final PortfolioRepository portfolioRepository;
    private final Random random = new Random();

    public SlugGeneratorService(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    /**
     * Generates a URL-friendly, unique slug from a person's name.
     * e.g. "Akshaya Balabhadra" -> "akshaya-balabhadra-x4f2"
     */
    public String generateUniqueSlug(String name) {
        String base = toSlugBase(name);
        String candidate;

        do {
            String suffix = randomSuffix();
            candidate = base + "-" + suffix;
        } while (portfolioRepository.existsBySlug(candidate));

        return candidate;
    }

    private String toSlugBase(String name) {
        if (name == null || name.isBlank()) {
            return "portfolio";
        }
        return name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")  // remove special characters
                .trim()
                .replaceAll("\\s+", "-");          // spaces -> hyphens
    }

    private String randomSuffix() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}