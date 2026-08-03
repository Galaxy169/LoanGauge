package com.loangauge.authservice.service;

public interface EmailService {

    void sendPasswordResetEmail(String toEmail, String firstName, String resetLink);
}