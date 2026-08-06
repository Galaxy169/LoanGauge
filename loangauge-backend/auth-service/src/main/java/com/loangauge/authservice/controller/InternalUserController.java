package com.loangauge.authservice.controller;

import com.loangauge.authservice.dto.ApiResponse;
import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.exception.InvalidTokenException;
import com.loangauge.authservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final AdminService adminService;

    @Value("${internal.api-secret}")
    private String internalSecret;

    @PostMapping("/{userId}/upgrade-premium")
    public ApiResponse<UserResponse> upgradeToPremium(
            @PathVariable Long userId,
            @RequestHeader("X-Internal-Secret") String secret) {
        if (internalSecret == null || !internalSecret.equals(secret)) {
            throw new InvalidTokenException("Invalid internal service secret");
        }
        UserResponse updated = adminService.upgradeUserToPremium(userId);
        return ApiResponse.success("User upgraded to premium", updated);
    }
}
