package com.loangauge.notificationservice.service;

public interface EmailService {
    void sendPlainEmail(String to, String subject, String body);
    void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename);
}