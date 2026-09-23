package com.resumeportfolio.backend.repository;

import com.resumeportfolio.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    // Spring Data JPA auto-generates the query from the method name - no SQL needed
    Optional<Portfolio> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
