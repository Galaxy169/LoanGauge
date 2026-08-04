package com.loangauge.authservice.mapper;

import com.loangauge.authservice.dto.response.AuthResponse;
import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthMapper {

    private final UserMapper userMapper;

    public AuthResponse toAuthResponse(String accessToken, User user) {
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}