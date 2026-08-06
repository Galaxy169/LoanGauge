package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.dto.request.UpdateProfileRequest;
import com.loangauge.authservice.dto.response.UserResponse;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.exception.ResourceNotFoundException;
import com.loangauge.authservice.mapper.UserMapper;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }
}