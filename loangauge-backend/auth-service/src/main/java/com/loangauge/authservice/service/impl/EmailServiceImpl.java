package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("LoanGauge - Reset Your Password");
            helper.setText(buildResetEmailHtml(firstName, resetLink), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    private String buildResetEmailHtml(String firstName, String resetLink) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Hi %s,</h2>
                    <p>We received a request to reset your LoanGauge account password.</p>
                    <p>
                        <a href="%s" style="background-color:#2563eb;color:#fff;padding:10px 20px;
                        text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a>
                    </p>
                    <p>This link will expire shortly. If you didn't request this, you can ignore this email.</p>
                    <p>— The LoanGauge Team</p>
                </div>
                """.formatted(firstName, resetLink);
    }
}