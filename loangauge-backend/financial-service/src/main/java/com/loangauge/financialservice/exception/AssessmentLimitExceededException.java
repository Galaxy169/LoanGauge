package com.loangauge.financialservice.exception;

public class AssessmentLimitExceededException extends RuntimeException {
    public AssessmentLimitExceededException(String message) {
        super(message);
    }
}