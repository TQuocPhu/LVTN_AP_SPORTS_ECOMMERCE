package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

/**
 * DTO yêu cầu xác thực kiểm đếm Barcode đóng gói đơn hàng trước khi xuất kho.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOrderPackRequest {

    @NotEmpty(message = "Danh sách sản phẩm quét mã kiểm đếm không được để trống")
    private List<ScannedItem> scannedItems;

    private String note;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScannedItem {
        private Long variantId;
        private String barcode;
        private Integer scannedQuantity;
    }
}
