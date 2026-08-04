package com.loangauge.authservice.dto;

import com.loangauge.authservice.dto.response.AuthResponse;
import lombok.*;

import java.time.Instant;

/**
 * Internal transport — never serialized directly by a controller.
 * The controller pulls refreshToken out to set an httpOnly cookie,
 * and returns only authResponse (accessToken + user) as JSON.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResult {
    private AuthResponse authResponse;
    private String refreshToken;
    private Instant refreshTokenExpiry;
}