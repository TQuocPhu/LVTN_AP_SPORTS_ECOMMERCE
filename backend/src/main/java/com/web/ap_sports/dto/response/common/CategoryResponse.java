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

    @Builder.Default
    private List<CategoryResponse> children = new ArrayList<>();
}
