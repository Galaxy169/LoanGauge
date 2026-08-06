package com.loangauge.notificationservice.exception;

public class AiServiceException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}