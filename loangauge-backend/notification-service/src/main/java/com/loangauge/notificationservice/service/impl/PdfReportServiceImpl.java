package com.loangauge.notificationservice.service.impl;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.service.PdfReportService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfReportServiceImpl implements PdfReportService {

    @Override
    public byte[] generateReport(AssessmentCompletedEvent event, List<String> recommendations) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc)) {

            document.add(new Paragraph("LoanGauge — Financial Assessment Report").setBold().setFontSize(18));
            document.add(new Paragraph("Loan Type: " + event.getLoanType()));
            document.add(new Paragraph("Loan Amount: " + event.getLoanAmount()));
            document.add(new Paragraph("FOIR: " + event.getFoir() + "%"));
            document.add(new Paragraph("DTI: " + event.getDti() + "%"));
            document.add(new Paragraph("Financial Readiness Score: " + event.getFinancialReadinessScore()));
            document.add(new Paragraph("Risk Category: " + event.getRiskCategory()));
            document.add(new Paragraph("Eligible Loan Amount: " + event.getEligibleAmount()));

            document.add(new Paragraph("\nRecommendations:").setBold());
            for (String tip : recommendations) {
                document.add(new Paragraph("• " + tip));
            }
        } catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        return out.toByteArray();
    }
}