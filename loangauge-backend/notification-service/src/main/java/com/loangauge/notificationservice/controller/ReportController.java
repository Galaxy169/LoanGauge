package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.dto.ApiResponse;
import com.loangauge.notificationservice.service.EmailService;
import com.loangauge.notificationservice.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;
    private final EmailService emailService;

    // wire actual recommendation + assessment lookups here based on your final DTO/data-fetch approach
}