package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * TEMPORARY / STUB-ONLY — generates a signed JWT for local testing so the
 * assessment endpoints can be exercised through Swagger before auth-service is
 * integrated. Guarded by @Profile("stub"), so it does not exist unless the stub
 * profile is active. DELETE before integration; never expose in dev/main.
 */
@RestController
@RequestMapping("/api/test-token")
@RequiredArgsConstructor
@Profile("stub")
@Tag(name = "Test Token (STUB ONLY)", description = "Local-only JWT generator — remove before integration")
public class TestTokenController {

    private final JwtUtil jwtUtil;

    @GetMapping
    @Operation(summary = "Generate a signed test JWT (stub profile only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> generate(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "PREMIUM_USER") String role) {
        String token = jwtUtil.generateTestToken(userId, role, 3_600_000L); // 1 hour
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("token", token),
                "Test token generated — use as 'Bearer <token>'"));
    }
}