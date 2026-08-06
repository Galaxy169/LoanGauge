package com.loangauge.financialservice.security;

import com.loangauge.financialservice.exception.ValidationFailedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

public class SecurityUtil {

    private SecurityUtil() {}

    public static Long getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Long userId)) {
            throw new ValidationFailedException("No authenticated user found in request context");
        }
        return userId;
    }
    
    public static String getCurrentUserRole() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().isEmpty()) {
            throw new ValidationFailedException("No authenticated role found in request context");
        }
        // Authorities are stored as "ROLE_<role>" (see JwtAuthFilter) — strip the prefix
        String authority = auth.getAuthorities().iterator().next().getAuthority();
        return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
    }

    public static String getCurrentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof String email) {
            return email;
        }
        return null;
    }
    
}