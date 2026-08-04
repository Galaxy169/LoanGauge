package com.loangauge.authservice.exception;
public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException(String message) { super(message); }
}