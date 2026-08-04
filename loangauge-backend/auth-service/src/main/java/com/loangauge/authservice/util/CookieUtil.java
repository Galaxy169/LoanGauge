package com.loangauge.authservice.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class CookieUtil {

    @Value("${app.refresh-token-cookie-name}")
    private String cookieName;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(cookieName, refreshToken)
                .httpOnly(true)
                .secure(true)
                .path(AppConstants.REFRESH_COOKIE_PATH)
                .sameSite(AppConstants.SAME_SITE_STRICT)
                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                .build();
    }

    public ResponseCookie buildClearedRefreshTokenCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(true)
                .path(AppConstants.REFRESH_COOKIE_PATH)
                .sameSite(AppConstants.SAME_SITE_STRICT)
                .maxAge(0)
                .build();
    }
}