package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {
    private Long id;
    private String status;
    private String note;
    private Long changedByUserId;
    private String changedByName;
    private String changedByEmail;
    private String changedByRole;
    private LocalDateTime createdAt;
}
