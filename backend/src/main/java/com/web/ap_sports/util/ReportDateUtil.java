package com.web.ap_sports.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class ReportDateUtil {

    private ReportDateUtil() {}

    public static LocalDateTime[] parseDateRange(String timeRange, LocalDate customStart, LocalDate customEnd) {
        LocalDateTime now = LocalDateTime.now();
        if (timeRange == null || timeRange.isBlank()) {
            timeRange = "LAST_30_DAYS";
        }

        switch (timeRange.toUpperCase()) {
            case "TODAY":
                return new LocalDateTime[]{now.toLocalDate().atStartOfDay(), now.toLocalDate().atTime(LocalTime.MAX)};
            case "LAST_7_DAYS":
                return new LocalDateTime[]{now.minusDays(7).toLocalDate().atStartOfDay(), now};
            case "LAST_30_DAYS":
                return new LocalDateTime[]{now.minusDays(30).toLocalDate().atStartOfDay(), now};
            case "THIS_MONTH":
                return new LocalDateTime[]{now.withDayOfMonth(1).toLocalDate().atStartOfDay(), now};
            case "LAST_MONTH":
                LocalDateTime firstDayLastMonth = now.minusMonths(1).withDayOfMonth(1);
                LocalDateTime lastDayLastMonth = firstDayLastMonth.plusMonths(1).minusDays(1).toLocalDate().atTime(LocalTime.MAX);
                return new LocalDateTime[]{firstDayLastMonth.toLocalDate().atStartOfDay(), lastDayLastMonth};
            case "THIS_QUARTER":
                int currentMonth = now.getMonthValue();
                int quarterFirstMonth = ((currentMonth - 1) / 3) * 3 + 1;
                return new LocalDateTime[]{now.withMonth(quarterFirstMonth).withDayOfMonth(1).toLocalDate().atStartOfDay(), now};
            case "ALL_TIME":
                return new LocalDateTime[]{null, null};
            case "CUSTOM":
            default:
                LocalDateTime start = customStart != null ? customStart.atStartOfDay() : null;
                LocalDateTime end = customEnd != null ? customEnd.atTime(LocalTime.MAX) : null;
                return new LocalDateTime[]{start, end};
        }
    }
}
