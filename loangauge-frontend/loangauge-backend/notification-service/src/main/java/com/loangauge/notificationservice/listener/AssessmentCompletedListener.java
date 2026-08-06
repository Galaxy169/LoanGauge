package com.loangauge.notificationservice.listener;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.service.NotificationService;
import com.loangauge.notificationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AssessmentCompletedListener {

    private final RecommendationService recommendationService;
    private final NotificationService notificationService;

    @RabbitListener(queues = "assessment.completed")
    public void handleAssessmentCompleted(AssessmentCompletedEvent event) {
        log.info("Received assessment.completed event for assessmentId={} role={}",
                event.getAssessmentId(), event.getUserRole());
        try {
            var rec = recommendationService.generateAndSave(event);
            String message = (rec != null)
                ? "Your financial assessment is complete. View your personalized recommendations now."
                : "Your financial assessment is complete.";

            notificationService.notify(
                event.getUserId(),
                "ASSESSMENT_COMPLETE",
                message
            );
        } catch (Exception e) {
            log.error("Failed to process assessment.completed event for assessmentId={}: {}",
                    event.getAssessmentId(), e.getMessage());
        }
    }
}