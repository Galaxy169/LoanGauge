package com.loangauge.authservice.dto;

import java.time.LocalDateTime;

/**
 * Standard success response envelope — every successful response from this
 * service returns this shape. Pairs with ApiError, which covers the failure case.
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Request successful");
    }
}