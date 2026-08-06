package com.loangauge.financialservice.controller;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.DashboardResponseDto;
import com.loangauge.financialservice.dto.LoanTypeRequestDto;
import com.loangauge.financialservice.dto.AdminLoanTypeResponseDto;
import com.loangauge.financialservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrator endpoints for loan types and dashboard")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/loan-types")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create a new loan type")
    public ResponseEntity<ApiResponse<AdminLoanTypeResponseDto>> createLoanType(
            @Valid @RequestBody LoanTypeRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createLoanType(request), "Loan type created successfully"));
    }

    @PutMapping("/loan-types/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update an existing loan type")
    public ResponseEntity<ApiResponse<AdminLoanTypeResponseDto>> updateLoanType(
            @PathVariable Long id, @Valid @RequestBody LoanTypeRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateLoanType(id, request), "Loan type updated successfully"));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get platform dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardResponseDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats(), "Dashboard stats fetched successfully"));
    }
}
