package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO tạo đánh giá giao hàng / shipper cho một đơn hàng đã hoàn tất.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeliveryReviewRequest {

    @NotNull(message = "Vui lòng chọn số sao đánh giá giao hàng")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    private List<String> tags;

    @Size(max = 1000, message = "Nhận xét không được vượt quá 1000 ký tự")
    private String comment;
}
