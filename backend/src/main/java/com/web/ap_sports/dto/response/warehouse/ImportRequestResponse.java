package com.web.ap_sports.dto.response.warehouse;

import com.web.ap_sports.enums.ImportRequestStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response thông tin Yêu Cầu Nhập Kho
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportRequestResponse {

    private Long id;
    private String code;
    private Long productId;
    private String productName;
    private String productMainImage;
    private Long supplierId;
    private String supplierName;
    private ImportRequestStatus status;
    private Long requestedByUserId;
    private String requestedByUserName;
    private String requestedByUserEmail;
    private String requestedByUserRole;
    private Long approvedByUserId;
    private String approvedByUserName;
    private String note;
    private String rejectionReason;
    private String importTicketCode;
    private Integer totalRequestedQuantity;
    private Integer totalApprovedQuantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    @Builder.Default
    private List<ImportRequestItemResponse> items = new ArrayList<>();
}
