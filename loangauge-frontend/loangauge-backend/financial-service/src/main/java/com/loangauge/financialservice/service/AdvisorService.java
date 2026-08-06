package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.AdvisorRemarksDto;
import com.loangauge.financialservice.dto.ConsultationRequestDto;
import com.loangauge.financialservice.dto.ConsultationResponseDto;

import java.util.List;

public interface AdvisorService {
    ConsultationResponseDto requestConsultation(Long userId, ConsultationRequestDto request);
    List<ConsultationResponseDto> getUserConsultations(Long userId);
    
    List<ConsultationResponseDto> getPendingConsultations();
    ConsultationResponseDto submitRemarks(Long advisorId, Long consultationId, AdvisorRemarksDto remarks);
}
