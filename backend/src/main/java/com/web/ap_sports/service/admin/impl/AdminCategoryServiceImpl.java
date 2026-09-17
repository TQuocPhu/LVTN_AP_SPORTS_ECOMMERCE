package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.CategoryFilterRequest;
import com.web.ap_sports.dto.request.admin.CreateCategoryRequest;
import com.web.ap_sports.dto.request.admin.UpdateCategoryRequest;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.service.admin.AdminCategoryService;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.specification.CategorySpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private static final String CATEGORIES_CLOUDINARY_FOLDER = "ap-sports-e-commerce/categories";

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(CategoryFilterRequest filter, Pageable pageable) {
        Page<Category> categoryPage = categoryRepository.findAll(
                CategorySpecifications.filterCategories(filter),
                pageable
        );
        return categoryPage.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy danh mục với ID: " + id, HttpStatus.NOT_FOUND));
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String categoryName = request.getName().trim();
        if (categoryRepository.existsByName(categoryName)) {
            throw new AppException("Tên danh mục '" + categoryName + "' đã tồn tại trên hệ thống. Vui lòng nhập tên khác.", HttpStatus.BAD_REQUEST);
        }

        String slug = StringUtils.hasText(request.getSlug())
                ? toSlug(request.getSlug())
                : generateUniqueSlug(categoryName, null);

        if (categoryRepository.existsBySlug(slug)) {
            slug = generateUniqueSlug(categoryName, null);
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy danh mục cha với ID: " + request.getParentId(), HttpStatus.BAD_REQUEST));
            
            int parentDepth = getCategoryDepth(parent);
            if (parentDepth >= 3) {
                throw new AppException("Hệ thống chỉ hỗ trợ tối đa 3 cấp danh mục (Gốc -> Cấp 2 -> Cấp 3). Danh mục '" + parent.getName() + "' đã ở Cấp " + parentDepth + " nên không thể tạo thêm danh mục con.", HttpStatus.BAD_REQUEST);
            }
        }

        // Quy tắc ảnh: CHỈ LƯU/TẢI ẢNH CHO DANH MỤC GỐC (parent == null)
        String imageUrl = null;
        if (parent == null && StringUtils.hasText(request.getImage())) {
            imageUrl = cloudinaryService.uploadBase64OrUrl(request.getImage(), CATEGORIES_CLOUDINARY_FOLDER);
        }

        Category category = Category.builder()
                .name(categoryName)
                .slug(slug)
                .description(request.getDescription())
                .image(imageUrl)
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Đã tạo thành công danh mục mới ID: {}, Slug: {}", saved.getId(), saved.getSlug());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy danh mục với ID: " + id, HttpStatus.NOT_FOUND));

        String categoryName = request.getName().trim();
        if (categoryRepository.existsByNameAndIdNot(categoryName, id)) {
            throw new AppException("Tên danh mục '" + categoryName + "' đã trùng với một danh mục khác.", HttpStatus.BAD_REQUEST);
        }

        String slug = StringUtils.hasText(request.getSlug())
                ? toSlug(request.getSlug())
                : generateUniqueSlug(categoryName, id);

        if (categoryRepository.existsBySlugAndIdNot(slug, id)) {
            slug = generateUniqueSlug(categoryName, id);
        }

        Category parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new AppException("Danh mục không thể tự đặt chính nó làm danh mục cha.", HttpStatus.BAD_REQUEST);
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy danh mục cha với ID: " + request.getParentId(), HttpStatus.BAD_REQUEST));
            
            int parentDepth = getCategoryDepth(parent);
            if (parentDepth >= 3) {
                throw new AppException("Hệ thống chỉ hỗ trợ tối đa 3 cấp danh mục (Gốc -> Cấp 2 -> Cấp 3). Danh mục '" + parent.getName() + "' đã ở Cấp " + parentDepth + " nên không thể chọn làm danh mục cha.", HttpStatus.BAD_REQUEST);
            }
        }

        // Quy tắc ảnh: CHỈ LƯU/TẢI ẢNH CHO DANH MỤC GỐC (parent == null)
        String imageUrl = null;
        if (parent == null) {
            if (StringUtils.hasText(request.getImage())) {
                imageUrl = cloudinaryService.uploadBase64OrUrl(request.getImage(), CATEGORIES_CLOUDINARY_FOLDER);
            } else {
                imageUrl = category.getImage(); // Giữ ảnh cũ nếu không thay đổi
            }
        }

        category.setName(categoryName);
        category.setSlug(slug);
        category.setDescription(request.getDescription());
        category.setImage(imageUrl);
        category.setParent(parent);

        Category saved = categoryRepository.save(category);
        log.info("Đã cập nhật danh mục ID: {}, Name: {}", saved.getId(), saved.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy danh mục với ID: " + id, HttpStatus.NOT_FOUND));

        // 1. Chặn xóa nếu danh mục đang chứa các danh mục con
        if (categoryRepository.existsByParentId(id)) {
            throw new AppException("Không thể xóa danh mục '" + category.getName() + "' vì đang chứa các danh mục con. Vui lòng xóa các danh mục con trước.", HttpStatus.BAD_REQUEST);
        }

        // 2. Chặn xóa nếu đang có sản phẩm thuộc danh mục này (danh mục chính hoặc danh mục phụ)
        boolean hasPrimaryProducts = productRepository.existsByCategoryId(id);
        boolean hasSecondaryProducts = productRepository.existsByCategoriesId(id);
        if (hasPrimaryProducts || hasSecondaryProducts) {
            throw new AppException("Không thể xóa danh mục '" + category.getName() + "' vì đang có các sản phẩm thuộc danh mục này. Vui lòng chuyển hoặc xóa sản phẩm trước.", HttpStatus.BAD_REQUEST);
        }

        categoryRepository.delete(category);
        log.info("Đã xóa thành công danh mục ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponse(Category category) {
        int level = getCategoryDepth(category);
        CategoryResponse.CategoryResponseBuilder builder = CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .image(category.getImage())
                .level(level);

        if (category.getParent() != null) {
            builder.parentId(category.getParent().getId())
                    .parentName(category.getParent().getName());
        }

        List<Category> children = categoryRepository.findByParentId(category.getId());
        if (children != null && !children.isEmpty()) {
            builder.children(children.stream().map(this::mapToResponse).collect(Collectors.toList()));
        }

        return builder.build();
    }

    private int getCategoryDepth(Category category) {
        int depth = 1;
        Category current = category;
        while (current.getParent() != null) {
            depth++;
            current = current.getParent();
            if (depth > 10) break; // Guard against potential loop
        }
        return depth;
    }

    private String generateUniqueSlug(String name, Long currentId) {
        String baseSlug = toSlug(name);
        String uid5 = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 5).toLowerCase();
        String candidate = baseSlug + "-" + uid5;

        boolean exists = currentId == null
                ? categoryRepository.existsBySlug(candidate)
                : categoryRepository.existsBySlugAndIdNot(candidate, currentId);

        if (exists) {
            String retryUid5 = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 5).toLowerCase();
            return baseSlug + "-" + retryUid5;
        }
        return candidate;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        slug = slug.toLowerCase().replaceAll("[đĐ]", "d").replaceAll("[^a-z0-9-]", "");
        return slug.replaceAll("-+", "-");
    }
}
