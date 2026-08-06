package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.AdvisorRemarksDto;
import com.loangauge.financialservice.dto.ConsultationRequestDto;
import com.loangauge.financialservice.dto.ConsultationResponseDto;
import com.loangauge.financialservice.entity.AdvisorConsultation;
import com.loangauge.financialservice.entity.LoanAssessment;
import com.loangauge.financialservice.exception.ResourceNotFoundException;
import com.loangauge.financialservice.exception.ValidationFailedException;
import com.loangauge.financialservice.repository.AdvisorConsultationRepository;
import com.loangauge.financialservice.repository.LoanAssessmentRepository;
import com.loangauge.financialservice.service.AdvisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.loangauge.financialservice.config.RabbitMQConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvisorServiceImpl implements AdvisorService {

    private final AdvisorConsultationRepository consultationRepository;
    private final LoanAssessmentRepository assessmentRepository;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public ConsultationResponseDto requestConsultation(Long userId, ConsultationRequestDto request) {
        LoanAssessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        if (!assessment.getUserId().equals(userId)) {
            throw new ValidationFailedException("Cannot request consultation for an assessment that doesn't belong to you");
        }

        AdvisorConsultation consultation = AdvisorConsultation.builder()
                .assessment(assessment)
                .userId(userId)
                .advisorUserId(null)
                .status("PENDING")
                .build();

        return mapToResponse(consultationRepository.save(consultation));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultationResponseDto> getUserConsultations(Long userId) {
        return consultationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsultationResponseDto> getPendingConsultations() {
        return consultationRepository.findByStatus("PENDING").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConsultationResponseDto submitRemarks(Long advisorId, Long consultationId, AdvisorRemarksDto remarks) {
        AdvisorConsultation consultation = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));

        consultation.setAdvisorUserId(advisorId);
        consultation.setRemarks(remarks.getRemarks());
        consultation.setStatus("COMPLETED");

        AdvisorConsultation saved = consultationRepository.save(consultation);

        // Notify user via RabbitMQ
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.EXCHANGE_NAME, 
            "advisor.responded", 
            Map.of("consultationId", consultationId, "userId", consultation.getUserId())
        );

        return mapToResponse(saved);
    }

    private ConsultationResponseDto mapToResponse(AdvisorConsultation consultation) {
        return ConsultationResponseDto.builder()
                .id(consultation.getId())
                .assessmentId(consultation.getAssessment().getAssessmentId())
                .userId(consultation.getUserId())
                .advisorUserId(consultation.getAdvisorUserId())
                .remarks(consultation.getRemarks())
                .status(consultation.getStatus())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .build();
    }
}
