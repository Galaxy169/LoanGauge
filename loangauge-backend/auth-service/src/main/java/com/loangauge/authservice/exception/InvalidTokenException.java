package com.loangauge.authservice.exception;
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) { super(message); }
}