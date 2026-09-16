package com.web.ap_sports.service.common;

import com.web.ap_sports.dto.response.common.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getCategoryTree();

    List<CategoryResponse> getAllCategoriesFlat();
}
