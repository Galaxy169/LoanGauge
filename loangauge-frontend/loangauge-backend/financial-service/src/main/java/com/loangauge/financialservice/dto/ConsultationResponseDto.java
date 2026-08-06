package com.loangauge.financialservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponseDto {
    private Long id;
    private Long assessmentId;
    private Long userId;
    private Long advisorUserId;
    private String remarks;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
