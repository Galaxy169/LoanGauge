package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.dto.request.ChangePasswordRequest;
import com.loangauge.authservice.dto.request.ForgotPasswordRequest;
import com.loangauge.authservice.dto.request.ResetPasswordRequest;
import com.loangauge.authservice.entity.PasswordResetToken;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.exception.InvalidCredentialsException;
import com.loangauge.authservice.exception.InvalidTokenException;
import com.loangauge.authservice.exception.ResourceNotFoundException;
import com.loangauge.authservice.exception.TokenExpiredException;
import com.loangauge.authservice.repository.PasswordResetTokenRepository;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.service.EmailService;
import com.loangauge.authservice.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.reset-token-expiration-ms}")
    private long resetTokenExpirationMs;

    @Value("${app.frontend.reset-password-url}")
    private String resetPasswordUrl;

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        // Silent on unknown email — prevents user enumeration.
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        passwordResetTokenRepository.deleteByUser(user);

        String rawToken = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(rawToken)
                .user(user)
                .expiryDate(Instant.now().plusMillis(resetTokenExpirationMs))
                .used(false)
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = resetPasswordUrl + "?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), resetLink);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new TokenExpiredException("This reset token has expired, please request a new one");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}