package com.loangauge.authservice.service;

import com.loangauge.authservice.dto.request.ChangePasswordRequest;
import com.loangauge.authservice.dto.request.ForgotPasswordRequest;
import com.loangauge.authservice.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);
}