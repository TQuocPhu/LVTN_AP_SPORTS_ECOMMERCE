package com.web.ap_sports.service.common.impl;

import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.service.common.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        List<Category> allCategories = categoryRepository.findAll();

        Map<Long, List<Category>> childrenMap = allCategories.stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        Map<Long, Long> directCountMap = new HashMap<>();
        List<Object[]> primaryCounts = productRepository.countInStockProductsGroupedByPrimaryCategory();
        for (Object[] row : primaryCounts) {
            Long catId = (Long) row[0];
            Long count = (Long) row[1];
            if (catId != null && count != null) {
                directCountMap.merge(catId, count, Long::sum);
            }
        }

        List<Object[]> secondaryCounts = productRepository.countInStockProductsGroupedBySecondaryCategory();
        for (Object[] row : secondaryCounts) {
            Long catId = (Long) row[0];
            Long count = (Long) row[1];
            if (catId != null && count != null) {
                directCountMap.merge(catId, count, Long::sum);
            }
        }

        return rootCategories.stream()
                .map(root -> mapToResponseTree(root, childrenMap, directCountMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesFlat() {
        List<Category> allCategories = categoryRepository.findAll();
        return allCategories.stream()
                .map(this::mapToResponseFlat)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponseTree(Category category, Map<Long, List<Category>> childrenMap, Map<Long, Long> directCountMap) {
        List<Category> children = childrenMap.getOrDefault(category.getId(), Collections.emptyList());
        List<CategoryResponse> childResponses = children.stream()
                .map(child -> mapToResponseTree(child, childrenMap, directCountMap))
                .collect(Collectors.toList());

        long directCount = directCountMap.getOrDefault(category.getId(), 0L);
        long totalCount = directCount + childResponses.stream()
                .mapToLong(c -> c.getProductCount() != null ? c.getProductCount() : 0L)
                .sum();

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .image(category.getImage())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .productCount(totalCount)
                .children(childResponses)
                .build();
    }

    private CategoryResponse mapToResponseFlat(Category category) {
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
