package com.loangauge.authservice.service;

import com.loangauge.authservice.dto.AuthResult;
import com.loangauge.authservice.dto.request.LoginRequest;
import com.loangauge.authservice.dto.request.RegisterRequest;

public interface AuthService {
    AuthResult register(RegisterRequest request);
    AuthResult login(LoginRequest request);
    AuthResult refreshAccessToken(String refreshToken);
    void logout(String refreshToken);
}