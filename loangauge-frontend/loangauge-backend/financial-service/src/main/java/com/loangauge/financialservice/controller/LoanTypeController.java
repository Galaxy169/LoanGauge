package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.LoanTypeResponseDto;
import com.loangauge.financialservice.service.LoanTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/loan-types")
@RequiredArgsConstructor
@Tag(name = "Loan Types", description = "Available loan products")
public class LoanTypeController {

    private final LoanTypeService loanTypeService;

    
    /*
     * URL: /api/loan-types/
     * Method: GET
     */
    @GetMapping
    @Operation(summary = "List all active loan types")
    public ResponseEntity<ApiResponse<List<LoanTypeResponseDto>>> getActiveLoanTypes() {
        return ResponseEntity.ok(ApiResponse.success(loanTypeService.getActiveLoanTypes()));
    }
}