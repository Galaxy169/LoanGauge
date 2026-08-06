package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.ProfileRequestDto;
import com.loangauge.financialservice.dto.ProfileResponseDto;

public interface ProfileService {

    ProfileResponseDto createProfile(Long userId, ProfileRequestDto requestDto);

    ProfileResponseDto getProfileByUserId(Long userId);

    ProfileResponseDto updateProfile(Long userId, ProfileRequestDto requestDto);

    boolean profileExists(Long userId);
}
