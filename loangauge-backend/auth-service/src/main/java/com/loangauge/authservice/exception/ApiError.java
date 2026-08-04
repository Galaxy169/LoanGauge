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
    private LocalDateTime timestamp = LocalDateTime.now();

    private int status;
<<<<<<< HEAD
    private String error;      // HTTP reason phrase, e.g. "Bad Request"
    private String message;
    private String path;

    private Map<String, String> validationErrors;  // present only on field-validation failures
=======
    private String error;      // the HTTP reason phrase, e.g. "Bad Request"
    private String message;
    private String path;

    private Map<String, String> validationErrors;  // extra, only for field errors
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
}