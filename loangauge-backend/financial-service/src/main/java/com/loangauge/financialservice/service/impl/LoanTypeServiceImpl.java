package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.LoanTypeResponseDto;
import com.loangauge.financialservice.mapper.LoanTypeMapper;
import com.loangauge.financialservice.repository.LoanTypeRepository;
import com.loangauge.financialservice.service.LoanTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanTypeServiceImpl implements LoanTypeService {

    private final LoanTypeRepository loanTypeRepository;
    private final LoanTypeMapper loanTypeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<LoanTypeResponseDto> getActiveLoanTypes() {
        return loanTypeRepository.findByIsActiveTrue()
                .stream()
                .map(loanTypeMapper::toResponseDto)
                .toList();
    }
}