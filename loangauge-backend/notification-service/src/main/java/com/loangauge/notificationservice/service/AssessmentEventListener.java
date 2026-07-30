package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AssessmentEventListener {

    private static final Logger log = LoggerFactory.getLogger(AssessmentEventListener.class);

    @RabbitListener(queues = RabbitMQConfig.ASSESSMENT_COMPLETED_QUEUE)
    public void onAssessmentCompleted(Map<String, Object> event) {
        log.info("Received assessment.completed event for assessmentId={}", event.get("assessmentId"));
        // TODO: call GeminiRecommendationService, ReportService, NotificationService
    }
}