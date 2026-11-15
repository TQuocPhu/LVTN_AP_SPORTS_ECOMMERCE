package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Trạng thái mới không được để trống!")
    private String status;

    private String note;

    /** ID tài xế giao hàng (GHN_SHIPPER) được phân công khi xuất phát giao hàng */
    private Long shipperId;
}
