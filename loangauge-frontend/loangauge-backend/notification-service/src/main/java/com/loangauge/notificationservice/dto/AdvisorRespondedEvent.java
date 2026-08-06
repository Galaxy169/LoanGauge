package com.loangauge.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvisorRespondedEvent {
    private Long consultationId;
    private Long userId;
}
