package com.loangauge.notificationservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String type; // ASSESSMENT_COMPLETE, REPORT_READY, ADVISOR_RESPONSE, SUBSCRIPTION_CONFIRMED
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}