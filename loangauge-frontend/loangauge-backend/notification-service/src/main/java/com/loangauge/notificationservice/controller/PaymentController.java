package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.dto.*;
import com.loangauge.notificationservice.service.AuthServiceClient;
import com.loangauge.notificationservice.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final AuthServiceClient authServiceClient;

    @PostMapping("/order")
    public ApiResponse<RazorpayOrderResponseDto> createOrder(@RequestBody @jakarta.validation.Valid RazorpayOrderRequestDto dto) throws Exception {
        return ApiResponse.success(razorpayService.createOrder(dto.getAmount()));
    }

    @PostMapping("/verify")
    public ApiResponse<Boolean> verifyPayment(@RequestBody @jakarta.validation.Valid RazorpayVerifyRequestDto dto) throws Exception {
        boolean valid = razorpayService.verifyPayment(dto);
        if (valid) {
            authServiceClient.upgradeUserToPremium(dto.getUserId());
        }
        return ApiResponse.success(valid);
    }
}