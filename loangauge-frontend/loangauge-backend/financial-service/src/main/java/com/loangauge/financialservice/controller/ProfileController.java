package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.security.SecurityUtil;
import com.loangauge.financialservice.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/financial-profile")
@RequiredArgsConstructor
@Tag(name = "Financial Profile", description = "CRUD operations for a user's financial profile")
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Create a financial profile",
            description = "Creates a new financial profile for the authenticated user. Fails if one already exists.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> createProfile(
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = SecurityUtil.getCurrentUserId();
        ProfileResponseDto response = profileService.createProfile(userId, requestDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Financial profile created successfully"));
    }

    @Operation(summary = "Get a financial profile",
            description = "Retrieves the authenticated user's financial profile.")
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getProfile() {

        Long userId = SecurityUtil.getCurrentUserId();
        ProfileResponseDto response = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Financial profile retrieved successfully"));
    }

    @Operation(summary = "Update a financial profile",
            description = "Updates the authenticated user's existing financial profile.")
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateProfile(
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = SecurityUtil.getCurrentUserId();
        ProfileResponseDto response = profileService.updateProfile(userId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Financial profile updated successfully"));
    }

    @Operation(summary = "Check if a financial profile exists",
            description = "Returns true if the authenticated user already has a financial profile.")
    @GetMapping("/exists")
    public ResponseEntity<ApiResponse<Boolean>> profileExists() {

        Long userId = SecurityUtil.getCurrentUserId();
        boolean exists = profileService.profileExists(userId);
        return ResponseEntity.ok(ApiResponse.success(exists, "Profile existence checked"));
    }
}