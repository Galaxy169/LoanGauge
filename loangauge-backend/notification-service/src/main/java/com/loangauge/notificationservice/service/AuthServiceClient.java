package com.loangauge.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    private final RestTemplate loadBalancedRestTemplate;

    @Value("${internal.api-secret}")
    private String internalSecret;

    public void upgradeUserToPremium(Long userId) {
        String url = "http://auth-service/api/internal/users/" + userId + "/upgrade-premium";
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalSecret);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            loadBalancedRestTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            log.info("Requested premium upgrade for userId={}", userId);
        } catch (Exception e) {
            // Payment already succeeded — don't fail the response to the user,
            // just log loudly for manual follow-up.
            log.error("Payment verified but premium upgrade failed for userId={}: {}", userId, e.getMessage());
        }
    }
}
