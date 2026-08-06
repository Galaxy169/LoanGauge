package com.loangauge.financialservice.exception;

import java.time.LocalDateTime;

public record ApiError(
        boolean success,
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {
    public ApiError(LocalDateTime timestamp, int status, String error, String message, String path) {
        this(false, timestamp, status, error, message, path);
    }
}