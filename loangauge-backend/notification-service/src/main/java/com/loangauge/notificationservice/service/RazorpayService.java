package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.dto.RazorpayOrderResponseDto;
import com.loangauge.notificationservice.dto.RazorpayVerifyRequestDto;

public interface RazorpayService {
    RazorpayOrderResponseDto createOrder(int amountInPaise) throws Exception;
    boolean verifyPayment(RazorpayVerifyRequestDto dto) throws Exception;
}