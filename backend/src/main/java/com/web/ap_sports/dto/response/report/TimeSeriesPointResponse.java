package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesPointResponse {
    private String date;
    private String label;
    private BigDecimal revenue;
    private long orderCount;
    private long completedCount;
    private long cancelledCount;
}
