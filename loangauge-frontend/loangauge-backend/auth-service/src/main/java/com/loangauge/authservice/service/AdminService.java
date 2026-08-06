package com.loangauge.authservice.service;

import com.loangauge.authservice.dto.request.SubscriptionRequest;
import com.loangauge.authservice.dto.response.SubscriptionResponse;
import com.loangauge.authservice.dto.response.UserResponse;

import java.util.List;

public interface AdminService {
    List<UserResponse> getAllUsers();
    UserResponse updateUserRole(Long userId, String roleName);
    UserResponse updateUserStatus(Long userId, String status);
    UserResponse upgradeUserToPremium(Long userId);

    List<SubscriptionResponse> getAllSubscriptions();
    SubscriptionResponse createSubscription(SubscriptionRequest request);
    SubscriptionResponse updateSubscription(Long id, SubscriptionRequest request);
}
