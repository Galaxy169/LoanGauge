package com.loangauge.notificationservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "recommendations")
public class Recommendation {
    @Id
    private String id;
    private String assessmentId;
    private String userId;
    private String source; // "GEMINI" or "RULE_BASED"
    private List<String> recommendations;
    private LocalDateTime createdAt;
}