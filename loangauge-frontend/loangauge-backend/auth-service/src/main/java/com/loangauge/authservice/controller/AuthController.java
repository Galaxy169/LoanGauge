package com.loangauge.authservice.controller;

import com.loangauge.authservice.dto.ApiResponse;
import com.loangauge.authservice.dto.AuthResult;
import com.loangauge.authservice.dto.request.ForgotPasswordRequest;
import com.loangauge.authservice.dto.request.LoginRequest;
import com.loangauge.authservice.dto.request.RegisterRequest;
import com.loangauge.authservice.dto.request.ResetPasswordRequest;
import com.loangauge.authservice.dto.response.AuthResponse;
import com.loangauge.authservice.service.AuthService;
import com.loangauge.authservice.service.PasswordResetService;
import com.loangauge.authservice.util.CookieUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, refresh, logout, and password reset")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return buildAuthResponse(authService.register(request), "Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return buildAuthResponse(authService.login(request), "Login successful");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @CookieValue(name = "${app.refresh-token-cookie-name}", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(401).body(
                    ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Refresh token is missing")
                            .build());
        }

        return buildAuthResponse(authService.refreshAccessToken(refreshToken), "Token refreshed successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "${app.refresh-token-cookie-name}", required = false) String refreshToken) {

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        return ResponseEntity.ok()
                .header("Set-Cookie", cookieUtil.buildClearedRefreshTokenCookie().toString())
                .body(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.success("If that email is registered, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully"));
    }

    private ResponseEntity<ApiResponse<AuthResponse>> buildAuthResponse(AuthResult result, String message) {
        return ResponseEntity.ok()
                .header("Set-Cookie", cookieUtil.buildRefreshTokenCookie(result.getRefreshToken()).toString())
                .body(ApiResponse.success(message, result.getAuthResponse()));
    }
}