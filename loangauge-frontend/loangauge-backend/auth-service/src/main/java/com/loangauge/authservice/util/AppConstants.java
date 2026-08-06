package com.loangauge.authservice.util;

public final class AppConstants {

    private AppConstants() {}

    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String ROLE_PREFIX = "ROLE_";

    public static final String REFRESH_COOKIE_PATH = "/api/auth";
    public static final String SAME_SITE_STRICT = "Strict";
}