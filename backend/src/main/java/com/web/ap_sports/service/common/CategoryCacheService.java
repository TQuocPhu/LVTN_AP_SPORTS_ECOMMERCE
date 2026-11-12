package com.web.ap_sports.service.common;

import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service chuyên trách quản lý Redis Cache cho Khung Danh mục sản phẩm tĩnh (Static Category Skeleton).
 *
 * Nguyên lý thiết kế an toàn tồn kho:
 * - Chỉ lưu trữ cấu trúc Danh mục tĩnh (ID, tên, slug, mô tả, ảnh, phân cấp Cha - Con) lên Redis.
 * - TUYỆT ĐỐI KHÔNG lưu cứng số lượng tồn kho hay danh sách sản phẩm vào Redis.
 * - Khi khách hàng xem Trang chủ hoặc Bộ lọc trang sản phẩm, hệ thống lấy khung danh mục từ Redis
 *   và ghép số lượng sản phẩm còn hàng (in_stock) trực tiếp theo thời gian thực (Real-time) từ Database.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryCacheService {

    private final CategoryRepository categoryRepository;

    /**
     * Lấy khung cây danh mục phân cấp tĩnh từ Redis Cache.
     * Nếu chưa có trong Redis (Cache Miss), truy vấn bảng categories và lưu với key 'lvtn:dev:catalog:category:tree_skeleton'.
     */
    @Transactional(readOnly = true)
    @Cacheable(
            value = "categories",
            key = "'lvtn:dev:catalog:category:tree_skeleton'",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<CategoryResponse> getCachedCategoryTreeSkeleton() {
        log.debug("[Redis Cache Miss] Nạp khung cây danh mục tĩnh từ Database vào Redis...");
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        List<Category> allCategories = categoryRepository.findAll();

        Map<Long, List<Category>> childrenMap = allCategories.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        return rootCategories.stream()
                .map(root -> mapToSkeletonTree(root, childrenMap))
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách danh mục phẳng (Flat) từ Redis Cache.
     * Lưu trữ dưới key chuẩn 'lvtn:dev:catalog:category:flat'.
     */
    @Transactional(readOnly = true)
    @Cacheable(
            value = "categories",
            key = "'lvtn:dev:catalog:category:flat'",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<CategoryResponse> getCachedAllCategoriesFlat() {
        log.debug("[Redis Cache Miss] Nạp danh sách danh mục phẳng từ Database vào Redis...");
        List<Category> allCategories = categoryRepository.findAll();
        return allCategories.stream()
                .map(this::mapToSkeletonFlat)
                .collect(Collectors.toList());
    }

    /**
     * Xóa toàn bộ dữ liệu cache thuộc vùng 'categories' khi Admin thêm, cập nhật hoặc xóa danh mục.
     */
    @CacheEvict(value = "categories", allEntries = true)
    public void evictAllCategoryCaches() {
        log.info("[Redis Cache Evict] Đã làm sạch bộ nhớ đệm danh mục sản phẩm trên Redis.");
    }

    /**
     * Hàm đệ quy dựng khung cây danh mục tĩnh (chưa gắn số lượng tồn kho động).
     */
    private CategoryResponse mapToSkeletonTree(Category category, Map<Long, List<Category>> childrenMap) {
        List<Category> children = childrenMap.getOrDefault(category.getId(), Collections.emptyList());
        List<CategoryResponse> childResponses = children.stream()
                .map(child -> mapToSkeletonTree(child, childrenMap))
                .collect(Collectors.toList());

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .image(category.getImage())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .productCount(0L)
                .children(childResponses)
                .build();
    }

    /**
     * Ánh xạ thực thể Category sang DTO phẳng.
     */
    private CategoryResponse mapToSkeletonFlat(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .image(category.getImage())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .children(new ArrayList<>())
                .build();
    }
}

