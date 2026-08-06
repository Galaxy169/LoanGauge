package com.loangauge.authservice.service.impl;

import com.loangauge.authservice.service.EmailService;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;
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

    @Value("${app.mail.from}")
    private String fromEmail;

    @Override
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail, "LoanGauge Team");
            helper.setTo(toEmail);
            helper.setSubject("LoanGauge - Reset Your Password");
            helper.setText(buildResetEmailHtml(firstName, resetLink), true);

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    @Override
    public void sendRegistrationEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail, "LoanGauge Team");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to LoanGauge!");
            helper.setText(buildRegistrationEmailHtml(firstName), true);

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send registration email to {}", toEmail, e);
            // Non-blocking error, we don't throw exception to avoid rolling back user creation
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

    private String buildRegistrationEmailHtml(String firstName) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Welcome to LoanGauge, %s!</h2>
                    <p>We are thrilled to have you on board.</p>
                    <p>You can now log in to your account and start your financial assessment journey.</p>
                    <p>If you have any questions, our support team is here to help.</p>
                    <p>— The LoanGauge Team</p>
                </div>
                """.formatted(firstName);
    }
}