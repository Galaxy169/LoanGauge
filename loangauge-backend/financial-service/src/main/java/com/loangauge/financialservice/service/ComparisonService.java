package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.ComparisonRequestDto;
import com.loangauge.financialservice.dto.ComparisonResponseDto;

public interface ComparisonService {

    ComparisonResponseDto compareAssessments(Long userId, ComparisonRequestDto request);
}
