package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "Vui lòng chọn địa chỉ giao hàng.")
    private Long shippingAddressId;

    @NotNull(message = "Vui lòng chọn phương thức thanh toán.")
    private String paymentMethod; // COD hoặc VNPAY

    private String couponCode;
    private String note;
    private java.math.BigDecimal shippingFee;

    private java.util.List<Long> cartItemIds;
}
