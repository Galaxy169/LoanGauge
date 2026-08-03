package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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

    // TODO(JWT): Replace this header-based userId with extraction from the
    // authenticated JWT (SecurityContext) once Auth/Member 2's token is ready.
    // This is the ONLY place that needs to change — every method below
    // already takes userId as a parameter, not from the request body.
    private Long resolveUserId(Long userIdHeader) {
        if (userIdHeader == null) {
            throw new IllegalArgumentException(
                    "X-User-Id header is required until JWT auth is wired in");
        }
        return userIdHeader;
    }

    @Operation(summary = "Create a financial profile",
            description = "Creates a new financial profile for the given user. Fails if one already exists.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> createProfile(
            @Parameter(description = "Temporary stand-in for JWT-derived userId", required = true)
            @RequestHeader("X-User-Id") Long userIdHeader,
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.createProfile(userId, requestDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Financial profile created successfully"));
    }

    @Operation(summary = "Get a financial profile",
            description = "Retrieves the financial profile for the given user.")
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getProfile(
            @Parameter(description = "Temporary stand-in for JWT-derived userId", required = true)
            @RequestHeader("X-User-Id") Long userIdHeader) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Financial profile retrieved successfully"));
    }

    @Operation(summary = "Update a financial profile",
            description = "Updates the existing financial profile for the given user.")
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateProfile(
            @Parameter(description = "Temporary stand-in for JWT-derived userId", required = true)
            @RequestHeader("X-User-Id") Long userIdHeader,
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.updateProfile(userId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response, "Financial profile updated successfully"));
    }

    @Operation(summary = "Check if a financial profile exists",
            description = "Returns true if a financial profile already exists for the given user.")
    @GetMapping("/exists")
    public ResponseEntity<ApiResponse<Boolean>> profileExists(
            @Parameter(description = "Temporary stand-in for JWT-derived userId", required = true)
            @RequestHeader("X-User-Id") Long userIdHeader) {

        Long userId = resolveUserId(userIdHeader);
        boolean exists = profileService.profileExists(userId);
        return ResponseEntity.ok(ApiResponse.success(exists, "Profile existence checked"));
    }
}
