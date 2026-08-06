package com.loangauge.authservice.mapper;

import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getRoleName())
                .status(user.getStatus())
                .subscriptionPlan(user.getSubscription() != null ? user.getSubscription().getPlanName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}