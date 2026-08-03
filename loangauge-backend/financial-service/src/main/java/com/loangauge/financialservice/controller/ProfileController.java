package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/financial-profile")
@RequiredArgsConstructor
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

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> createProfile(
            @RequestHeader("X-User-Id") Long userIdHeader,
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.createProfile(userId, requestDto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Financial profile created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> getProfile(
            @RequestHeader("X-User-Id") Long userIdHeader) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Financial profile retrieved successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponseDto>> updateProfile(
            @RequestHeader("X-User-Id") Long userIdHeader,
            @Valid @RequestBody ProfileRequestDto requestDto) {

        Long userId = resolveUserId(userIdHeader);
        ProfileResponseDto response = profileService.updateProfile(userId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("Financial profile updated successfully", response));
    }

    @GetMapping("/exists")
    public ResponseEntity<ApiResponse<Boolean>> profileExists(
            @RequestHeader("X-User-Id") Long userIdHeader) {

        Long userId = resolveUserId(userIdHeader);
        boolean exists = profileService.profileExists(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile existence checked", exists));
    }
}
