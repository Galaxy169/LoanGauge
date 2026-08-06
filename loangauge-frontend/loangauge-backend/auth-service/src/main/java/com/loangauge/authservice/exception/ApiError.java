package com.loangauge.authservice.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    @Builder.Default
    private boolean success = false;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private int status;
    private String error;      // HTTP reason phrase, e.g. "Bad Request"
    private String message;
    private String path;

    private Map<String, String> validationErrors;  // present only on field-validation failures
}