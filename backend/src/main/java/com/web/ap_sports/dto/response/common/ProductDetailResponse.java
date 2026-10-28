package com.web.ap_sports.dto.response.common;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer totalStock;
    private String status;
    private String unit;
    private Integer weight; // Trọng lượng tính bằng grams
    private String mainImage;
    private Long primaryCategoryId;
    private String primaryCategoryName;

    @Builder.Default
    private List<CategoryResponse> categories = new ArrayList<>();

    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    @Builder.Default
    private List<VariantResponse> variants = new ArrayList<>();

    @Builder.Default
    private List<String> allImages = new ArrayList<>();

    // Thông tin Phiếu nhập kho nhanh trực tiếp (nếu ADMIN chọn DIRECT_IMPORT)
    private String initialImportTicketCode;
    private com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse initialImportTransaction;

    // Thông tin Yêu Cầu Nhập Kho (nếu ADMIN hoặc STAFF chọn IMPORT_REQUEST)
    private String initialImportRequestCode;
    private com.web.ap_sports.dto.response.warehouse.ImportRequestResponse initialImportRequest;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
