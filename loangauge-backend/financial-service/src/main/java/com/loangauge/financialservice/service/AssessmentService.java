package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.AssessmentRequestDto;
import com.loangauge.financialservice.dto.AssessmentResponseDto;

import java.util.List;

public interface AssessmentService {

    AssessmentResponseDto createAssessment(Long userId, AssessmentRequestDto request);

    AssessmentResponseDto getAssessmentById(Long userId, Long assessmentId);

    List<AssessmentResponseDto> getAssessmentHistory(Long userId);
}