package com.web.ap_sports.dto.request.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryFilterRequest {

    private String keyword;
    
    /**
     * parentId filter:
     * - null hoặc -1: Lấy tất cả
     * - 0: Lấy danh mục gốc (parent == null)
     * - > 0: Lấy danh mục con của parentId này
     */
    private Long parentId;
}
