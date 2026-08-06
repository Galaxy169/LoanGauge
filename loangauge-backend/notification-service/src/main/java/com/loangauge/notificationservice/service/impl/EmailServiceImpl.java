package com.loangauge.notificationservice.service.impl;

import com.loangauge.notificationservice.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Override
    public void sendPlainEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.info("Sent plain email to {}", to);
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String body, byte[] attachment, String filename) {
        if (to == null || to.trim().isEmpty()) {
            log.error("Failed to send email: recipient address 'to' is null or empty");
            throw new IllegalArgumentException("Recipient email address cannot be null or empty");
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setFrom(fromEmail, "LoanGauge Team");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(attachment));
            mailSender.send(mimeMessage);
            log.info("Sent email with attachment to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email with attachment to {}", to);
            throw new RuntimeException("Email sending failed", e);
        }
    }

    @Override
    public void sendReportEmail(String to, byte[] pdfBytes, String assessmentId) {
        String subject = "Your LoanGauge Assessment Report";
        String body = "Hi,\n\nPlease find your financial assessment report attached.\n\n" +
                "Assessment ID: " + assessmentId + "\n\n" +
                "Thank you for using LoanGauge.\n\nTeam LoanGauge";
        String filename = "loangauge-report-" + assessmentId + ".pdf";
        sendEmailWithAttachment(to, subject, body, pdfBytes, filename);
    }
}