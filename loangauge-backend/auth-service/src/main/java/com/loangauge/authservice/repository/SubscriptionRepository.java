package com.loangauge.authservice.repository;

import com.loangauge.authservice.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByPlanName(String planName);
    boolean existsByPlanName(String planName);
}
