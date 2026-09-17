package com.web.ap_sports.dto.response.common;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private String image;
    private Long parentId;
    private String parentName;
    private Integer level; // 1 = Cấp 1 (Gốc), 2 = Cấp 2, 3 = Cấp 3 (Cấp cuối)

    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();
}
