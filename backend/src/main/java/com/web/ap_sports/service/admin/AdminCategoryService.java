package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.CategoryFilterRequest;
import com.web.ap_sports.dto.request.admin.CreateCategoryRequest;
import com.web.ap_sports.dto.request.admin.UpdateCategoryRequest;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminCategoryService {

    Page<CategoryResponse> getCategories(CategoryFilterRequest filter, Pageable pageable);

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);

    void deleteCategory(Long id);

    List<CategoryResponse> getRootCategories();
}
