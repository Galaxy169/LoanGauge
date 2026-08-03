package com.loangauge.notificationservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RazorpayOrderRequestDto {
    @NotNull
    @Positive
    private Integer amount; // in paise
}