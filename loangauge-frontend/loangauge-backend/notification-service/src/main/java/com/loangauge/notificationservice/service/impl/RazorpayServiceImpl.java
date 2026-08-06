package com.loangauge.notificationservice.service.impl;

import com.loangauge.notificationservice.dto.RazorpayOrderResponseDto;
import com.loangauge.notificationservice.dto.RazorpayVerifyRequestDto;
import com.loangauge.notificationservice.service.RazorpayService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class RazorpayServiceImpl implements RazorpayService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Override
    public RazorpayOrderResponseDto createOrder(int amountInPaise) throws Exception {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "loangauge_" + System.currentTimeMillis());
        log.info("Creating Razorpay order for amount={}", amountInPaise);
        var order = client.orders.create(orderRequest);
        // com.razorpay.Order wraps a JSONObject and has no JavaBean properties;
        // extract the fields we need into a serializable DTO.
        return RazorpayOrderResponseDto.builder()
                .id(order.get("id"))
                .entity(order.get("entity"))
                .amount(order.get("amount"))
                .amountPaid(order.get("amount_paid"))
                .amountDue(order.get("amount_due"))
                .currency(order.get("currency"))
                .receipt(order.get("receipt"))
                .status(order.get("status"))
                .attempts(order.get("attempts"))
                .build();
    }

    @Override
    public boolean verifyPayment(RazorpayVerifyRequestDto dto) throws Exception {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", dto.getRazorpayOrderId());
        options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
        options.put("razorpay_signature", dto.getRazorpaySignature());

        boolean valid = Utils.verifyPaymentSignature(options, keySecret);
        log.info("Razorpay signature verification result={} for orderId={}", valid, dto.getRazorpayOrderId());
        return valid;
        // Never mark subscription active if this returns false — caller must check it.
    }
}