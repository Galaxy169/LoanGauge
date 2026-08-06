package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.ComparisonRequestDto;
import com.loangauge.financialservice.dto.ComparisonResponseDto;
import com.loangauge.financialservice.security.SecurityUtil;
import com.loangauge.financialservice.service.ComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparisons")
@RequiredArgsConstructor
@Tag(name = "Assessment Comparison", description = "Compare past assessments and view trends")
public class ComparisonController {

    private final ComparisonService comparisonService;

    @PostMapping
    @Operation(summary = "Compare 2-5 of the caller's past assessments and get metric trends")
    public ResponseEntity<ApiResponse<ComparisonResponseDto>> compare(
            @Valid @RequestBody ComparisonRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ComparisonResponseDto result = comparisonService.compareAssessments(userId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Comparison generated"));
    }
}
