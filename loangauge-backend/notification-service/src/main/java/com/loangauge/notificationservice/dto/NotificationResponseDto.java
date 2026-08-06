package com.loangauge.notificationservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDto {
    private String id;
    private String type;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}