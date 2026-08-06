package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.LoanTypeResponseDto;

import java.util.List;

public interface LoanTypeService {

    List<LoanTypeResponseDto> getActiveLoanTypes();
}