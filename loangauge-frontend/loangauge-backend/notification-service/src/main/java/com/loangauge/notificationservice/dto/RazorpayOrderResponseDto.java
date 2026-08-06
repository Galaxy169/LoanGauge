package com.loangauge.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponseDto {
    private String id;
    private String entity;
    private int amount;
    private int amountPaid;
    private int amountDue;
    private String currency;
    private String receipt;
    private String status;
    private int attempts;
}
