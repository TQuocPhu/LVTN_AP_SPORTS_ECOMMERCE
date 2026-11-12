package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.dto.response.common.VariantResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.enums.ProductVariantStatus;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.ReviewRepository;
import com.web.ap_sports.search.HybridSearchEngineService;
import com.web.ap_sports.service.common.CategoryCacheService;
import com.web.ap_sports.service.customer.CustomerProductService;
import com.web.ap_sports.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CustomerProductServiceImpl implements CustomerProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final HybridSearchEngineService hybridSearchEngineService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired(required = false)
    private ReviewRepository reviewRepository;

    @Autowired(required = false)
    private CategoryRepository categoryRepository;

    @Autowired(required = false)
    private CategoryCacheService categoryCacheService;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getPublicProducts(ProductFilterRequest filterRequest) {
        int page = Math.max(0, filterRequest.getPage());
        int size = filterRequest.getSize() <= 0 ? 12 : filterRequest.getSize();

        // Mở rộng categoryId của danh mục cha thành danh sách gồm cả danh mục cha + toàn bộ danh mục con/cháu
        if (filterRequest.getCategoryId() != null) {
            List<Long> expandedCategoryIds = expandCategoryAndDescendantIds(filterRequest.getCategoryId());
            if (!expandedCategoryIds.isEmpty()) {
                filterRequest.setCategoryIds(expandedCategoryIds);
            }
        }

        Sort sort = Sort.by(
                "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC,
                StringUtils.hasText(filterRequest.getSortBy()) ? filterRequest.getSortBy() : "createdAt"
        );

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Product> spec = ProductSpecifications.filterProducts(filterRequest);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> responses = mapToProductResponseList(productPage.getContent(), null);

        return new PageImpl<>(responses, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductBySlugOrId(String slugOrId) {
        Product product = productRepository.findBySlug(slugOrId)
                .orElseGet(() -> {
                    try {
                        Long id = Long.parseLong(slugOrId);
                        return productRepository.findById(id).orElse(null);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                });

        if (product == null) {
            throw new AppException("Không tìm thấy sản phẩm với thông tin: " + slugOrId, HttpStatus.NOT_FOUND);
        }

        return mapToProductDetailResponse(product);
    }

    /**
     * Tìm kiếm sản phẩm thông minh bằng thuật toán Hybrid (Attribute Matching + TF-IDF Vector Cosine Similarity)
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProductsByRelevance(String keyword, int page, int size) {
        if (!StringUtils.hasText(keyword) || keyword.trim().length() < 1) {
            return new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        }

        int validPage = Math.max(0, page);
        int validSize = size <= 0 ? 10 : size;

        // BƯỚC 1: Lấy tất cả sản phẩm đang kinh doanh (in_stock) làm tập dữ liệu Corpus
        List<Product> corpus = productRepository.findAllInStockProductsWithCategories();

        if (corpus.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), PageRequest.of(validPage, validSize), 0);
        }

        // BƯỚC 2: Trích xuất danh sách Biến thể (Variants: SKU, Color, Size) của các sản phẩm trong Corpus
        List<Long> productIds = corpus.stream().map(Product::getId).collect(Collectors.toList());
        List<ProductVariant> allVariants = variantRepository.findByProductIdIn(productIds);
        Map<Long, List<ProductVariant>> variantMap = allVariants != null
                ? allVariants.stream()
                        .filter(v -> v.getProduct() != null && v.getProduct().getId() != null)
                        .collect(Collectors.groupingBy(v -> v.getProduct().getId()))
                : Collections.emptyMap();

        // BƯỚC 3: Thực thi Thuật toán Hybrid Search Engine (Bóc tách từ tiếng Việt, TF-IDF Vector, Cosine Similarity & Ngưỡng lọc THRESHOLD)
        List<Product> rankedProducts = hybridSearchEngineService.rankProducts(keyword, corpus, variantMap);

        // BƯỚC 4: Xử lý Phân trang (Pagination) trên tập kết quả đã được lọc và sắp xếp giảm dần theo điểm độ phù hợp
        int totalElements = rankedProducts.size();
        int fromIndex = Math.min(validPage * validSize, totalElements);
        int toIndex = Math.min(fromIndex + validSize, totalElements);

        List<Product> pageContent = (fromIndex < toIndex) ? rankedProducts.subList(fromIndex, toIndex) : Collections.emptyList();

        List<ProductResponse> responses = mapToProductResponseList(pageContent, variantMap);

        Pageable pageable = PageRequest.of(validPage, validSize);
        return new PageImpl<>(responses, pageable, totalElements);
    }

    private List<ProductResponse> mapToProductResponseList(List<Product> products, Map<Long, List<ProductVariant>> preloadedVariantMap) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> productIds = products.stream()
                .map(Product::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<Long, List<ProductVariant>> variantMap = preloadedVariantMap;
        if (variantMap == null) {
            List<ProductVariant> batchVariants = variantRepository.findByProductIdIn(productIds);
            variantMap = batchVariants != null
                    ? batchVariants.stream()
                            .filter(v -> v.getProduct() != null && v.getProduct().getId() != null)
                            .collect(Collectors.groupingBy(v -> v.getProduct().getId()))
                    : Collections.emptyMap();
        }

        List<ProductImage> batchImages = imageRepository.findByProductIdIn(productIds);
        Map<Long, List<ProductImage>> imageMap = batchImages != null
                ? batchImages.stream()
                        .filter(img -> img.getProduct() != null && img.getProduct().getId() != null)
                        .collect(Collectors.groupingBy(img -> img.getProduct().getId()))
                : Collections.emptyMap();

        // Nạp hàng loạt (Batch) thống kê đánh giá thực tế (rating trung bình & tổng lượt đánh giá đã duyệt)
        Map<Long, Double> ratingMap = new HashMap<>();
        Map<Long, Long> reviewCountMap = new HashMap<>();
        if (reviewRepository != null && !productIds.isEmpty()) {
            List<Object[]> reviewStats = reviewRepository.findReviewStatsByProductIds(productIds);
            if (reviewStats != null) {
                for (Object[] row : reviewStats) {
                    Long prodId = (Long) row[0];
                    Double avgRating = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                    if (prodId != null) {
                        ratingMap.put(prodId, Math.round(avgRating * 10.0) / 10.0);
                        reviewCountMap.put(prodId, count);
                    }
                }
            }
        }

        Map<Long, List<ProductVariant>> finalVariantMap = variantMap;
        return products.stream()
                .map(p -> mapToProductResponse(
                        p,
                        finalVariantMap.getOrDefault(p.getId(), Collections.emptyList()),
                        imageMap.getOrDefault(p.getId(), Collections.emptyList()),
                        ratingMap.getOrDefault(p.getId(), 0.0),
                        reviewCountMap.getOrDefault(p.getId(), 0L)
                ))
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(
            Product product,
            List<ProductVariant> variants,
            List<ProductImage> images,
            Double rating,
            Long reviewsCount
    ) {
        String mainImage = images.stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImagePath)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getImagePath());

        List<CategoryResponse> catResponses = (product.getCategories() != null ? product.getCategories() : Collections.<Category>emptySet()).stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .rating(rating)
                .reviewsCount(reviewsCount)
                .totalStock(product.getStock())
                .status(product.getStatus())
                .unit(product.getUnit())
                .weight(product.getWeight())
                .mainImage(mainImage)
                .primaryCategoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .primaryCategoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categories(catResponses)
                .variantCount(variants.size())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductDetailResponse mapToProductDetailResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<ProductImage> images = imageRepository.findByProductId(product.getId());

        String mainImage = images.stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImagePath)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getImagePath());

        List<CategoryResponse> catResponses = (product.getCategories() != null ? product.getCategories() : Collections.<Category>emptySet()).stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .build())
                .collect(Collectors.toList());

        List<VariantResponse> variantResponses = variants.stream()
                .map(v -> {
                    List<String> vImgs = images.stream()
                            .filter(img -> img.getVariant() != null && img.getVariant().getId().equals(v.getId()))
                            .map(ProductImage::getImagePath)
                            .collect(Collectors.toList());

                    String attributesJson = v.getAttributes();
                    if (!StringUtils.hasText(attributesJson)) {
                        Map<String, String> attrMap = new LinkedHashMap<>();
                        if (StringUtils.hasText(v.getColor())) {
                            attrMap.put("Màu sắc", v.getColor().trim());
                        }
                        if (StringUtils.hasText(v.getSize())) {
                            String sizeStr = v.getSize().trim();
                            if (sizeStr.contains("|")) {
                                String[] parts = sizeStr.split("\\|");
                                if (parts.length >= 1 && StringUtils.hasText(parts[0])) {
                                    attrMap.put("Kích thước / Size", parts[0].trim());
                                }
                                if (parts.length >= 2 && StringUtils.hasText(parts[1])) {
                                    attrMap.put("Thuộc tính bổ sung", parts[1].trim());
                                }
                                for (int i = 2; i < parts.length; i++) {
                                    if (StringUtils.hasText(parts[i])) {
                                        attrMap.put("Thuộc tính " + (i + 1), parts[i].trim());
                                    }
                                }
                            } else {
                                attrMap.put("Kích thước / Size", sizeStr);
                            }
                        }
                        try {
                            attributesJson = objectMapper.writeValueAsString(attrMap);
                        } catch (Exception e) {
                            attributesJson = null;
                        }
                    }

                    String variantName = null;
                    if (StringUtils.hasText(attributesJson)) {
                        try {
                            Map<String, String> parsedMap = objectMapper.readValue(attributesJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
                            variantName = String.join(" | ", parsedMap.values());
                        } catch (Exception e) {
                            variantName = attributesJson;
                        }
                    } else {
                        List<String> parts = new ArrayList<>();
                        if (v.getSize() != null && !v.getSize().isBlank()) parts.add("Size: " + v.getSize());
                        if (v.getColor() != null && !v.getColor().isBlank()) parts.add("Màu: " + v.getColor());
                        if (!parts.isEmpty()) variantName = String.join(" | ", parts);
                    }

                    return VariantResponse.builder()
                            .id(v.getId())
                            .sku(v.getSku())
                            .size(v.getSize())
                            .color(v.getColor())
                            .attributes(attributesJson)
                            .variantName(variantName)
                            .price(v.getPrice())
                            .costPrice(v.getCostPrice())
                            .stockQuantity(v.getStockQuantity())
                            .status(v.getStatus() != null ? v.getStatus() : ProductVariantStatus.ACTIVE)
                            .version(v.getVersion())
                            .images(vImgs)
                            .createdAt(v.getCreatedAt())
                            .updatedAt(v.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        List<String> allImages = images.stream()
                .map(ProductImage::getImagePath)
                .distinct()
                .collect(Collectors.toList());

        Map<String, String> specsMap = deserializeSpecifications(product.getSpecifications());

        Double rating = 0.0;
        Long reviewsCount = 0L;
        if (reviewRepository != null && product.getId() != null) {
            Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
            Long cnt = reviewRepository.countByProductIdAndStatus(product.getId(), "approved");
            if (avg != null) {
                rating = Math.round(avg * 10.0) / 10.0;
            }
            if (cnt != null) {
                reviewsCount = cnt;
            }
        }

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .rating(rating)
                .reviewsCount(reviewsCount)
                .totalStock(product.getStock())
                .status(product.getStatus())
                .unit(product.getUnit())
                .weight(product.getWeight())
                .mainImage(mainImage)
                .primaryCategoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .primaryCategoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categories(catResponses)
                .specifications(specsMap)
                .variants(variantResponses)
                .allImages(allImages)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    /**
     * Thu thập đệ quy ID của danh mục đang chọn cùng toàn bộ các danh mục con (Cấp 2) và cháu (Cấp 3).
     * Ưu tiên đọc từ khung cây danh mục trên Redis Cache, nếu chưa có thì truy vấn từ CategoryRepository.
     */
    private List<Long> expandCategoryAndDescendantIds(Long targetCategoryId) {
        if (targetCategoryId == null) return Collections.emptyList();
        Set<Long> collectedIds = new LinkedHashSet<>();
        collectedIds.add(targetCategoryId);

        // 1. Thử tìm trong khung cây danh mục từ Redis Cache trước (0ms)
        if (categoryCacheService != null) {
            try {
                List<CategoryResponse> skeletonTree = categoryCacheService.getCachedCategoryTreeSkeleton();
                CategoryResponse targetNode = findCategoryNodeRecursive(skeletonTree, targetCategoryId);
                if (targetNode != null) {
                    collectDescendantIdsFromNode(targetNode, collectedIds, 0);
                    return new ArrayList<>(collectedIds);
                }
            } catch (Exception ignored) {
                // Fallback qua CategoryRepository nếu Redis Cache hoặc DevTools ClassLoader gặp lỗi
            }
        }

        // 2. Fallback qua CategoryRepository nếu không tìm thấy trong cache
        if (categoryRepository != null) {
            List<Category> allCategories = categoryRepository.findAll();
            Map<Long, List<Category>> childrenMap = allCategories.stream()
                    .filter(c -> c.getParent() != null && c.getParent().getId() != null)
                    .collect(Collectors.groupingBy(c -> c.getParent().getId()));
            collectDescendantIdsFromMap(targetCategoryId, childrenMap, collectedIds, 0);
        }

        return new ArrayList<>(collectedIds);
    }

    private CategoryResponse findCategoryNodeRecursive(List<CategoryResponse> nodes, Long targetId) {
        if (nodes == null) return null;
        for (CategoryResponse node : nodes) {
            if (targetId.equals(node.getId())) {
                return node;
            }
            if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                CategoryResponse found = findCategoryNodeRecursive(node.getChildren(), targetId);
                if (found != null) return found;
            }
        }
        return null;
    }

    private void collectDescendantIdsFromNode(CategoryResponse node, Set<Long> collectedIds, int depth) {
        if (node == null || depth > 10) return;
        if (node.getId() != null) {
            collectedIds.add(node.getId());
        }
        if (node.getChildren() != null) {
            for (CategoryResponse child : node.getChildren()) {
                collectDescendantIdsFromNode(child, collectedIds, depth + 1);
            }
        }
    }

    private void collectDescendantIdsFromMap(
            Long parentId,
            Map<Long, List<Category>> childrenMap,
            Set<Long> collectedIds,
            int depth
    ) {
        if (parentId == null || depth > 10) return;
        List<Category> children = childrenMap.getOrDefault(parentId, Collections.emptyList());
        for (Category child : children) {
            if (child.getId() != null && collectedIds.add(child.getId())) {
                collectDescendantIdsFromMap(child.getId(), childrenMap, collectedIds, depth + 1);
            }
        }
    }

    private Map<String, String> deserializeSpecifications(String json) {
        if (!StringUtils.hasText(json)) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
