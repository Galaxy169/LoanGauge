package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.entity.Recommendation;
import com.loangauge.notificationservice.service.EmailService;
import com.loangauge.notificationservice.service.PdfReportService;
import com.loangauge.notificationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;
    private final EmailService emailService;
    private final RecommendationService recommendationService;

    /**
     * GET /api/reports/{assessmentId}/download
     *
     * Returns the assessment PDF as an application/pdf byte stream.
     * The browser triggers a file download automatically when the
     * Content-Disposition header is set to "attachment".
     * Frontend: open this URL in a new tab or use fetch + createObjectURL.
     */
    @GetMapping("/{assessmentId}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String assessmentId) {
        Recommendation rec = recommendationService.getByAssessmentId(assessmentId);

        byte[] pdf = pdfReportService.generateReport(
                rec.getAssessmentSnapshot(),
                rec.getRecommendations()
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"loangauge-report-" + assessmentId + ".pdf\"")
                .body(pdf);
    }

    /**
     * POST /api/reports/{assessmentId}/email
     *
     * Generates the PDF and emails it to the user's registered email address.
     * The email address is embedded in the stored AssessmentCompletedEvent snapshot.
     */
    @PostMapping("/{assessmentId}/email")
    public ResponseEntity<String> emailReport(@PathVariable String assessmentId) {
        Recommendation rec = recommendationService.getByAssessmentId(assessmentId);

        byte[] pdf = pdfReportService.generateReport(
                rec.getAssessmentSnapshot(),
                rec.getRecommendations()
        );

        String userEmail = rec.getAssessmentSnapshot() != null ? rec.getAssessmentSnapshot().getUserEmail() : null;
        if (userEmail == null || userEmail.trim().isEmpty()) {
            throw new com.loangauge.notificationservice.exception.ValidationFailedException(
                    "Recipient email not found for assessment " + assessmentId + ". Please create a new assessment to send reports.");
        }

        emailService.sendReportEmail(userEmail, pdf, assessmentId);
        log.info("PDF report emailed to {} for assessmentId={}", userEmail, assessmentId);

        return ResponseEntity.ok("Report emailed to " + userEmail);
    }
}