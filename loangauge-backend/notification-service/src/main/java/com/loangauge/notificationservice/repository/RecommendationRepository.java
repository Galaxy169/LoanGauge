package com.loangauge.notificationservice.repository;

import com.loangauge.notificationservice.entity.Recommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    Optional<Recommendation> findByAssessmentId(String assessmentId);
}