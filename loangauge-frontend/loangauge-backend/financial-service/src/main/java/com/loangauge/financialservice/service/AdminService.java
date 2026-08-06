package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.DashboardResponseDto;
import com.loangauge.financialservice.dto.LoanTypeRequestDto;
import com.loangauge.financialservice.dto.AdminLoanTypeResponseDto;

public interface AdminService {
    AdminLoanTypeResponseDto createLoanType(LoanTypeRequestDto request);
    AdminLoanTypeResponseDto updateLoanType(Long id, LoanTypeRequestDto request);
    DashboardResponseDto getDashboardStats();
}
