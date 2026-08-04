package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.dto.AuthResult;
import com.loangauge.authservice.dto.request.LoginRequest;
import com.loangauge.authservice.dto.request.RegisterRequest;
import com.loangauge.authservice.dto.response.AuthResponse;
import com.loangauge.authservice.entity.RefreshToken;
import com.loangauge.authservice.entity.Role;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.exception.*;
import com.loangauge.authservice.mapper.AuthMapper;
import com.loangauge.authservice.repository.RefreshTokenRepository;
import com.loangauge.authservice.repository.RoleRepository;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.security.JwtUtil;
import com.loangauge.authservice.service.AuthService;
import com.loangauge.authservice.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String STATUS_ACTIVE = "ACTIVE";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthMapper authMapper;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Override
    @Transactional
    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        Role defaultRole = roleRepository.findByRoleName(RoleConstants.USER)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Default role '" + RoleConstants.USER + "' is not configured"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(defaultRole)
                .status(STATUS_ACTIVE)
                .build();

        user = userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!STATUS_ACTIVE.equals(user.getStatus())) {
            throw new AccountDisabledException("This account is not active");
        }

        refreshTokenRepository.deleteByUser(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResult refreshAccessToken(String refreshToken) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (storedToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(storedToken);
            throw new TokenExpiredException("Refresh token has expired, please log in again");
        }

        User user = storedToken.getUser();
        refreshTokenRepository.delete(storedToken);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResult issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString() + UUID.randomUUID();
        Instant refreshExpiry = Instant.now().plusMillis(refreshTokenExpirationMs);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(rawRefreshToken)
                .user(user)
                .expiryDate(refreshExpiry)
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        AuthResponse authResponse = authMapper.toAuthResponse(accessToken, user);

        return AuthResult.builder()
                .authResponse(authResponse)
                .refreshToken(rawRefreshToken)
                .refreshTokenExpiry(refreshExpiry)
                .build();
    }
}