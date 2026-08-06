package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;

public interface PdfReportService {
    byte[] generateReport(AssessmentCompletedEvent event, java.util.List<String> recommendations);
}