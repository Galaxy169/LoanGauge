package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.dto.request.SubscriptionRequest;
import com.loangauge.authservice.dto.response.SubscriptionResponse;
import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.entity.Role;
import com.loangauge.authservice.entity.Subscription;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.exception.ResourceNotFoundException;
import com.loangauge.authservice.mapper.UserMapper;
import com.loangauge.authservice.repository.RoleRepository;
import com.loangauge.authservice.repository.SubscriptionRepository;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    private Long getCurrentUserId() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.loangauge.authservice.security.UserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long userId, String roleName) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot change your own administrative role.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        // Guardrail: Protect the last administrator from demotion
        if ("ADMINISTRATOR".equalsIgnoreCase(user.getRole().getRoleName()) && !"ADMINISTRATOR".equalsIgnoreCase(roleName)) {
            long adminCount = userRepository.countByRole_RoleName("ADMINISTRATOR");
            if (adminCount <= 1) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot demote the last active administrator.");
            }
        }

        user.setRole(role);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long userId, String status) {
        Long currentUserId = getCurrentUserId();
        if (currentUserId != null && currentUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot change your own account status.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Guardrail: Protect the last administrator from deactivation
        if ("ADMINISTRATOR".equalsIgnoreCase(user.getRole().getRoleName()) && !"ACTIVE".equalsIgnoreCase(status)) {
            long activeAdminCount = userRepository.countByRole_RoleNameAndStatus("ADMINISTRATOR", "ACTIVE");
            if (activeAdminCount <= 1) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot deactivate the last active administrator.");
            }
        }

        user.setStatus(status);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse upgradeUserToPremium(Long userId) {
        return updateUserRole(userId, com.loangauge.authservice.util.RoleConstants.PREMIUM_USER);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest request) {
        Subscription subscription = Subscription.builder()
                .planName(request.getPlanName())
                .price(request.getPrice())
                .status(request.getStatus())
                .build();
        
        return mapToResponse(subscriptionRepository.save(subscription));
    }

    @Override
    @Transactional
    public SubscriptionResponse updateSubscription(Long id, SubscriptionRequest request) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        subscription.setPlanName(request.getPlanName());
        subscription.setPrice(request.getPrice());
        subscription.setStatus(request.getStatus());

        return mapToResponse(subscriptionRepository.save(subscription));
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .planName(subscription.getPlanName())
                .price(subscription.getPrice())
                .status(subscription.getStatus())
                .build();
    }
}
