package com.loangauge.financialservice.service.impl;

import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;
import com.loangauge.financialservice.entity.FinancialProfile;
import com.loangauge.financialservice.exception.ResourceNotFoundException;
import com.loangauge.financialservice.exception.ValidationFailedException;
import com.loangauge.financialservice.mapper.ProfileMapper;
import com.loangauge.financialservice.repository.ProfileRepository;
import com.loangauge.financialservice.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    @Override
    @Transactional
    public ProfileResponseDto createProfile(Long userId, ProfileRequestDto requestDto) {
        if (profileRepository.existsByUserId(userId)) {
            throw new ValidationFailedException(
                    "Financial profile already exists for userId: " + userId);
        }

        FinancialProfile profile = profileMapper.toEntity(requestDto, userId);
        FinancialProfile saved = profileRepository.save(profile);
        return profileMapper.toResponseDto(saved);
    }

    @Override
    public ProfileResponseDto getProfileByUserId(Long userId) {
        FinancialProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Financial profile not found for userId: " + userId));
        return profileMapper.toResponseDto(profile);
    }

    @Override
    @Transactional
    public ProfileResponseDto updateProfile(Long userId, ProfileRequestDto requestDto) {
        FinancialProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Financial profile not found for userId: " + userId));

        profileMapper.applyToEntity(profile, requestDto);
        FinancialProfile updated = profileRepository.save(profile);
        return profileMapper.toResponseDto(updated);
    }

    @Override
    public boolean profileExists(Long userId) {
        return profileRepository.existsByUserId(userId);
    }
}
