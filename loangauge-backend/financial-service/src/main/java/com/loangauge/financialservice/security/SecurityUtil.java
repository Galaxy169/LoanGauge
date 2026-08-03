package com.loangauge.financialservice.security;

import com.loangauge.financialservice.exception.ValidationFailedException;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil() {}

    public static Long getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long userId)) {
            throw new ValidationFailedException("No authenticated user found in request context");
        }
        return userId;
    }
}