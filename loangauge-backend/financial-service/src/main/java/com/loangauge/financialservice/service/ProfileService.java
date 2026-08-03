package com.loangauge.financialservice.service;

import com.loangauge.financialservice.dto.ProfileResponseDto;

public interface ProfileService {

    ProfileResponseDto getProfileByUserId(Long userId);
}