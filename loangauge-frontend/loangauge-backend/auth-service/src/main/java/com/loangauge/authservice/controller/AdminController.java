package com.loangauge.authservice.controller;

import com.loangauge.authservice.dto.ApiResponse;
import com.loangauge.authservice.dto.request.SubscriptionRequest;
import com.loangauge.authservice.dto.response.SubscriptionResponse;
import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrator endpoints for users and subscriptions")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminService.getAllUsers()));
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update a user's role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long userId, @RequestParam String roleName) {
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", adminService.updateUserRole(userId, roleName)));
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update a user's status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", adminService.updateUserStatus(userId, status)));
    }

    @GetMapping("/subscriptions")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "List all subscription plans")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getAllSubscriptions() {
        return ResponseEntity.ok(ApiResponse.success("Subscriptions fetched successfully", adminService.getAllSubscriptions()));
    }

    @PostMapping("/subscriptions")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create a new subscription plan")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(
            @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subscription created successfully", adminService.createSubscription(request)));
    }

    @PutMapping("/subscriptions/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update an existing subscription plan")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateSubscription(
            @PathVariable Long id, @Valid @RequestBody SubscriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subscription updated successfully", adminService.updateSubscription(id, request)));
    }
}
