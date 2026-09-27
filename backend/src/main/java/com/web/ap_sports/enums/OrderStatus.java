package com.web.ap_sports.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum OrderStatus {
    pending("pending"),
    confirmed("confirmed"),
    processing("processing"),
    shipping("shipping"),
    shipped("shipped"),
    delivered("delivered"),
    completed("completed"),
    cancelled("cancelled"),
    returned("returned"),
    payment_failed("payment_failed");

    private final String value;

    OrderStatus(String value) {
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
    public static OrderStatus fromString(String text) {
        if (text == null || text.isBlank()) return null;
        String trimmed = text.trim().toLowerCase();
        for (OrderStatus b : OrderStatus.values()) {
            if (b.value.equalsIgnoreCase(trimmed)) {
                return b;
            }
        }
        if ("canceled".equals(trimmed)) {
            return cancelled;
        }
        return null;
    }
}
