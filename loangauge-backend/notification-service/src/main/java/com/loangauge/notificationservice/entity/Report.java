package com.loangauge.notificationservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    private String assessmentId;
    private String userId;
    private LocalDateTime generatedAt;
}