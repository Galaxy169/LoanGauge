package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.dto.*;
import com.loangauge.notificationservice.service.RazorpayService;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    @PostMapping("/order")
    public ApiResponse<Order> createOrder(@RequestBody @jakarta.validation.Valid RazorpayOrderRequestDto dto) throws Exception {
        return ApiResponse.success(razorpayService.createOrder(dto.getAmount()));
    }

    @PostMapping("/verify")
    public ApiResponse<Boolean> verifyPayment(@RequestBody @jakarta.validation.Valid RazorpayVerifyRequestDto dto) throws Exception {
        boolean valid = razorpayService.verifyPayment(dto);
        // TODO: on valid=true, call financial-service via gateway to upgrade user to PREMIUM
        return ApiResponse.success(valid);
    }
}