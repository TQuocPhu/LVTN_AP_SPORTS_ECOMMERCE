package com.web.ap_sports.dto.response.customer;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSummaryResponse {

    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalPrice;
}
