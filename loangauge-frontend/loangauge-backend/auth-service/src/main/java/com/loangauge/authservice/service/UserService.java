package com.loangauge.authservice.service;

import com.loangauge.authservice.dto.request.UpdateProfileRequest;
import com.loangauge.authservice.dto.response.UserResponse;

public interface UserService {
    UserResponse getProfile(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}