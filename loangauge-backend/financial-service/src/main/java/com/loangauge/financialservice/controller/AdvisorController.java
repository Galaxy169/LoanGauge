package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.AdvisorRemarksDto;
import com.loangauge.financialservice.dto.ApiResponse;
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
@RequestMapping("/api/advisor/consultations")
@RequiredArgsConstructor
@Tag(name = "Advisor", description = "Financial Advisor endpoints")
public class AdvisorController {

    private final AdvisorService advisorService;

    @GetMapping
    @PreAuthorize("hasRole('FINANCIAL_ADVISOR')")
    @Operation(summary = "List all pending consultations")
    public ResponseEntity<ApiResponse<List<ConsultationResponseDto>>> getPendingConsultations() {
        return ResponseEntity.ok(ApiResponse.success(advisorService.getPendingConsultations()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FINANCIAL_ADVISOR')")
    @Operation(summary = "Submit remarks for a consultation request")
    public ResponseEntity<ApiResponse<ConsultationResponseDto>> submitRemarks(
            @PathVariable Long id,
            @Valid @RequestBody AdvisorRemarksDto remarks) {
        
        Long advisorId = com.loangauge.financialservice.security.SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(advisorService.submitRemarks(advisorId, id, remarks)));
    }
}
