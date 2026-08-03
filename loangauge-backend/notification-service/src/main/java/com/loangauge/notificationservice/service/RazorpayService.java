package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.dto.RazorpayVerifyRequestDto;
import com.razorpay.Order;

public interface RazorpayService {
    Order createOrder(int amountInPaise) throws Exception;
    boolean verifyPayment(RazorpayVerifyRequestDto dto) throws Exception;
}