package com.loangauge.notificationservice.entity;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
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
    // Full assessment snapshot stored for on-demand PDF generation
    // without needing to call financial-service at report time.
    private AssessmentCompletedEvent assessmentSnapshot;
}