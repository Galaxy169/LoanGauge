package com.loangauge.notificationservice.listener;

import com.loangauge.notificationservice.dto.AdvisorRespondedEvent;
import com.loangauge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdvisorRespondedListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "advisor.responded")
    public void handleAdvisorResponded(AdvisorRespondedEvent event) {
        log.info("Received advisor.responded event for consultationId={}", event.getConsultationId());
        try {
            notificationService.notify(
                event.getUserId().toString(),
                "ADVISOR_RESPONSE",
                "A financial advisor has reviewed your assessment and submitted their recommendations."
            );
        } catch (Exception e) {
            log.error("Failed to process advisor.responded event: {}", e.getMessage());
        }
    }
}
