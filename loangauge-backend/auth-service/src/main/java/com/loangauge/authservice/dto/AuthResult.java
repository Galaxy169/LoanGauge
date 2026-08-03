package com.loangauge.authservice.dto;

import com.loangauge.authservice.dto.response.AuthResponse;
import lombok.*;

import java.time.Instant;

/**
 * Internal transport object — never returned directly by a controller.
 * Controller extracts refreshToken to set as an httpOnly cookie,
 * and returns only authResponse (accessToken + user) as the JSON body.
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