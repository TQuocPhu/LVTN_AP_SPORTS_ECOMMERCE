package com.web.ap_sports.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus {
    pending("pending"),
    completed("completed"),
    failed("failed"),
    refunded("refunded");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    @JsonCreator
    public static PaymentStatus fromString(String text) {
        if (text == null || text.isBlank()) return null;
        String trimmed = text.trim().toLowerCase();
        for (PaymentStatus b : PaymentStatus.values()) {
            if (b.value.equalsIgnoreCase(trimmed)) {
                return b;
            }
        }
        return null;
    }
}
