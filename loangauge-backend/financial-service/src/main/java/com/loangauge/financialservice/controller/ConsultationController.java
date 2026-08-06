package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.ConsultationRequestDto;
import com.loangauge.financialservice.dto.ConsultationResponseDto;
import com.loangauge.financialservice.service.AdvisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultation", description = "User endpoints for financial consultations")
public class ConsultationController {

    private final AdvisorService advisorService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PREMIUM_USER', 'ADMINISTRATOR')")
    @Operation(summary = "Request an advisor consultation")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> requestConsultation(
            @Valid @RequestBody ConsultationRequestDto request) {
        
        Long userId = com.loangauge.financialservice.security.SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(advisorService.requestConsultation(userId, request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PREMIUM_USER', 'ADMINISTRATOR')")
    @Operation(summary = "List user's consultations")
    public ResponseEntity<ApiResponse<List<ConsultationResponseDto>>> getUserConsultations() {
        
        Long userId = com.loangauge.financialservice.security.SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(advisorService.getUserConsultations(userId)));
    }
}
