package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.service.common.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoryTree() {
        List<CategoryResponse> tree = categoryService.getCategoryTree();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh mục theo cây thành công.", tree));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesFlat();
        return ResponseEntity.ok(ApiResponse.success("Lấy tất cả danh mục thành công.", categories));
    }
}
