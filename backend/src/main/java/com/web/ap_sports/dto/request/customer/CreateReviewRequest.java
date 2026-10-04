package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequest {

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "ID mục đơn hàng không được để trống")
    private Long orderItemId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    @Size(min = 10, max = 2000, message = "Nội dung nhận xét từ 10 đến 2000 ký tự")
    private String comment;

    @Size(max = 5, message = "Đính kèm tối đa 5 hình ảnh thực tế")
    private List<String> imageUrls;
}
