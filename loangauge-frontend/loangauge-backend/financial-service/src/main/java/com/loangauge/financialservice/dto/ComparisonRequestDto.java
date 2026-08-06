package com.loangauge.financialservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ComparisonRequestDto(

        @NotNull(message = "Assessment IDs are required")
        @Size(min = 2, max = 5, message = "Select between 2 and 5 assessments to compare")
        List<Long> assessmentIds
) {
}
