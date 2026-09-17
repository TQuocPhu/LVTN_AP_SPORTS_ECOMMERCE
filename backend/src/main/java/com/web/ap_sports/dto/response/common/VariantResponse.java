package com.web.ap_sports.dto.response.common;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantResponse {

    private Long id;
    private String sku;
    private String size;
    private String color;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private Long version;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
