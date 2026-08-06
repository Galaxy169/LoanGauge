package com.loangauge.authservice.exception;
public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException(String message) { super(message); }
}