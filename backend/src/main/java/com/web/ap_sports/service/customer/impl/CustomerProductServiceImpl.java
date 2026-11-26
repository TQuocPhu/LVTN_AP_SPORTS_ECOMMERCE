package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.AvailableVariantSizeResponse;
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
import com.web.ap_sports.service.common.ProductRankingCacheService;
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

    @Autowired(required = false)
    private ProductRankingCacheService productRankingCacheService;

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

    /**
     * Trích xuất động toàn bộ kích thước / quy cách biến thể từ chính các sản phẩm thuộc phạm vi lọc hiện tại.
     * - Không bó cứng vào trang phục hay 3 nhóm tĩnh; hỗ trợ mọi kiểu kích cỡ (XS..3XL, 38..44, 8oz, 190, 4U, Số 5...).
     * - Truy vấn Projection trực tiếp trên Database (không qua Redis) để dữ liệu luôn chính xác tuyệt đối.
     */
    @Override
    @Transactional(readOnly = true)
    public AvailableVariantSizeResponse getAvailableVariantSizes(Long categoryId, String keyword) {
        String keywordPattern = StringUtils.hasText(keyword)
                ? "%" + keyword.trim().toLowerCase() + "%"
                : null;

        List<Object[]> rawRows;
        boolean hasCategoryFilter = categoryId != null;
        if (hasCategoryFilter) {
            List<Long> expandedCategoryIds = expandCategoryAndDescendantIds(categoryId);
            if (expandedCategoryIds.isEmpty()) {
                expandedCategoryIds = List.of(categoryId);
            }
            rawRows = variantRepository.findActiveVariantFacetsByCategories(expandedCategoryIds, keywordPattern);
        } else {
            rawRows = variantRepository.findActiveVariantFacetsAll(keywordPattern);
        }

        if (rawRows == null || rawRows.isEmpty()) {
            return AvailableVariantSizeResponse.builder()
                    .options(Collections.emptyList())
                    .totalDistinctOptions(0)
                    .build();
        }

        // Map khử trùng lặp theo khóa chữ thường chuẩn hóa -> Bộ tích lũy (nhãn hiển thị, nhóm thuộc tính, tập productId)
        Map<String, VariantFacetAccumulator> accumulatorMap = new LinkedHashMap<>();

        for (Object[] row : rawRows) {
            if (row == null) continue;
            // Với query có categoryIds: row = [variantId, productId, size, attributes]
            // Với query toàn sàn: row = [productId, size, attributes]
            int offset = hasCategoryFilter ? 1 : 0;
            Long productId = row[offset] != null ? ((Number) row[offset]).longValue() : null;
            String rawSize = row[offset + 1] != null ? row[offset + 1].toString() : null;
            String rawAttributes = row[offset + 2] != null ? row[offset + 2].toString() : null;
            if (productId == null) continue;

            // 1. Thu nhận từ cột size trực tiếp nếu có
            if (StringUtils.hasText(rawSize)) {
                registerFacetToken(accumulatorMap, rawSize.trim(), "Kích thước / Size", productId);
            }

            // 2. Thu nhận từ chuỗi JSON hoặc chuỗi phân cách trong cột attributes (bỏ qua thuộc tính màu sắc)
            if (StringUtils.hasText(rawAttributes)) {
                extractNonColorAttributes(rawAttributes.trim(), accumulatorMap, productId);
            }
        }

        List<AvailableVariantSizeResponse.VariantSizeOption> sortedOptions = accumulatorMap.values().stream()
                .map(acc -> AvailableVariantSizeResponse.VariantSizeOption.builder()
                        .value(acc.displayValue)
                        .dimensionLabel(acc.dimensionLabel)
                        .productCount(acc.productIds.size())
                        .build())
                .sorted(CustomerProductServiceImpl::compareVariantSizeOptionsNaturally)
                .collect(Collectors.toList());

        return AvailableVariantSizeResponse.builder()
                .options(sortedOptions)
                .totalDistinctOptions(sortedOptions.size())
                .build();
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

    /**
     * Lấy danh sách sản phẩm được đánh giá cao nhất (làm dữ liệu thật cho khối Sản Phẩm Đánh Giá Cao).
     * Ưu tiên đọc danh sách ID từ Redis Cache (TTL ~5 phút) và fallback về Database nếu Redis gặp sự cố.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getTopRatedProducts(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        List<Long> orderedIds = null;
        if (productRankingCacheService != null) {
            try {
                orderedIds = productRankingCacheService.getCachedTopRatedProductIds(safeLimit);
            } catch (Exception ignored) {
                // Fallback trực tiếp về Database nếu Redis chưa sẵn sàng hoặc lỗi deserialize
            }
        }
        if (orderedIds == null) {
            orderedIds = productRepository.findTopRatedProductIds(PageRequest.of(0, safeLimit));
        }
        return getOrderedProductsByIds(orderedIds);
    }

    /**
     * Lấy danh sách trang thiết bị nổi bật (nhiều đơn hàng + đánh giá tốt, bù sản phẩm mới nhất nếu chưa đủ).
     * Ưu tiên đọc danh sách ID từ Redis Cache (TTL ~5 phút) và fallback về Database nếu Redis gặp sự cố.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 24));
        List<Long> orderedIds = null;
        if (productRankingCacheService != null) {
            try {
                orderedIds = productRankingCacheService.getCachedFeaturedProductIds(safeLimit);
            } catch (Exception ignored) {
                // Fallback trực tiếp về Database nếu Redis chưa sẵn sàng hoặc lỗi deserialize
            }
        }
        if (orderedIds == null) {
            orderedIds = productRepository.findFeaturedProductIds(PageRequest.of(0, safeLimit));
        }
        return getOrderedProductsByIds(orderedIds);
    }

    /**
     * Nạp danh sách sản phẩm theo đúng thứ tự ID đã xếp hạng và map batch chống N+1 query.
     * - Chuẩn hóa Number -> Long để tránh lỗi lệch kiểu Integer/Long khi đọc lại từ JSON Redis.
     * - Lọc lại `in_stock` để đảm bảo nếu sản phẩm vừa hết hàng/ẩn trong lúc cache còn hạn thì không hiển thị sai.
     */
    private List<ProductResponse> getOrderedProductsByIds(List<? extends Number> rawOrderedIds) {
        if (rawOrderedIds == null || rawOrderedIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> orderedIds = rawOrderedIds.stream()
                .filter(Objects::nonNull)
                .map(Number::longValue)
                .toList();

        // Gom thành Map để tra cứu O(1) khi sắp xếp lại theo thứ tự xếp hạng
        Map<Long, Product> productMap = productRepository.findAllById(orderedIds).stream()
                .filter(p -> p.getId() != null && "in_stock".equals(p.getStatus()))
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        // Khôi phục chính xác thứ tự ID đã được Repository xếp hạng
        List<Product> orderedProducts = orderedIds.stream()
                .map(productMap::get)
                .filter(Objects::nonNull)
                .toList();

        // Map sang ProductResponse bằng batch query (ảnh, danh mục, thống kê đánh giá) để tránh N+1
        return mapToProductResponseList(orderedProducts, null);
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

    // =========================================================================
    // CÁC HÀM HỖ TRỢ TRÍCH XUẤT & SẮP XẾP TỰ NHIÊN BỘ LỌC KÍCH THƯỚC BIẾN THỂ
    // =========================================================================

    private static final Map<String, Integer> STANDARD_LETTER_SIZE_RANK = Map.ofEntries(
            Map.entry("xxs", 1),
            Map.entry("xs", 2),
            Map.entry("s", 3),
            Map.entry("m", 4),
            Map.entry("l", 5),
            Map.entry("xl", 6),
            Map.entry("xxl", 7),
            Map.entry("2xl", 7),
            Map.entry("xxxl", 8),
            Map.entry("3xl", 8),
            Map.entry("4xl", 9),
            Map.entry("5xl", 10),
            Map.entry("freesize", 11),
            Map.entry("free size", 11),
            Map.entry("one size", 11)
    );

    private static final java.util.regex.Pattern PURE_NUMBER_PATTERN =
            java.util.regex.Pattern.compile("^(\\d+(?:[.,]\\d+)?)$");

    private static final java.util.regex.Pattern NUMBER_WITH_UNIT_PATTERN =
            java.util.regex.Pattern.compile("^([a-zA-ZÀ-ỹ\\s]*?)(\\d+(?:[.,]\\d+)?)\\s*([a-zA-ZÀ-ỹ%\"']*)$");

    private static class VariantFacetAccumulator {
        String displayValue;
        String dimensionLabel;
        final Set<Long> productIds = new HashSet<>();

        VariantFacetAccumulator(String displayValue, String dimensionLabel) {
            this.displayValue = displayValue;
            this.dimensionLabel = dimensionLabel;
        }
    }

    /**
     * Kiểm tra khóa thuộc tính có phải là Màu sắc hay không để loại khỏi bộ lọc Kích thước / Quy cách.
     */
    private boolean isColorAttributeKey(String key) {
        if (!StringUtils.hasText(key)) return false;
        String lower = key.trim().toLowerCase();
        return lower.contains("màu") || lower.contains("mau sac") || lower.equals("mau") || lower.contains("color") || lower.contains("colour");
    }

    /**
     * Chuẩn hóa tên nhóm thuộc tính để các cách đặt tên tương đương gom về cùng một nhãn gọn gàng.
     */
    private String normalizeDimensionLabel(String rawKey) {
        if (!StringUtils.hasText(rawKey)) return "Kích thước / Quy cách";
        String trimmed = rawKey.trim();
        String lower = trimmed.toLowerCase();
        if (lower.contains("size") || lower.contains("kích thước") || lower.contains("kích cỡ") || lower.equals("cỡ")) {
            return "Kích thước / Size";
        }
        return trimmed;
    }

    /**
     * Ghi nhận một giá trị kích thước / quy cách biến thể vào bộ tích lũy khử trùng lặp không phân biệt hoa thường.
     */
    private void registerFacetToken(
            Map<String, VariantFacetAccumulator> accumulatorMap,
            String rawValue,
            String rawDimensionLabel,
            Long productId
    ) {
        if (!StringUtils.hasText(rawValue) || productId == null) return;
        String cleaned = rawValue.trim().replaceAll("\\s+", " ");
        if (cleaned.isEmpty() || cleaned.length() > 40) return;

        String normalizedKey = cleaned.toLowerCase();
        String normalizedLabel = normalizeDimensionLabel(rawDimensionLabel);

        VariantFacetAccumulator acc = accumulatorMap.computeIfAbsent(
                normalizedKey,
                k -> new VariantFacetAccumulator(cleaned, normalizedLabel)
        );
        // Ưu tiên giữ chữ in hoa đẹp hơn nếu gặp biến thể viết thường trước đó (VD: "xl" -> "XL")
        if (acc.displayValue.equals(acc.displayValue.toLowerCase()) && !cleaned.equals(cleaned.toLowerCase())) {
            acc.displayValue = cleaned;
        }
        // Nếu trước đó chỉ lấy từ cột size mặc định mà sau có nhãn cụ thể hơn (VD: "Trọng lượng"), giữ nhãn rõ nghĩa
        if ("Kích thước / Size".equals(acc.dimensionLabel) && !"Kích thước / Size".equals(normalizedLabel)) {
            acc.dimensionLabel = normalizedLabel;
        }
        acc.productIds.add(productId);
    }

    /**
     * Phân giải chuỗi JSON hoặc chuỗi ngăn cách trong cột attributes để lấy toàn bộ quy cách (trừ màu sắc).
     */
    private void extractNonColorAttributes(
            String rawAttributes,
            Map<String, VariantFacetAccumulator> accumulatorMap,
            Long productId
    ) {
        if (rawAttributes.startsWith("{")) {
            try {
                Map<String, Object> parsed = objectMapper.readValue(
                        rawAttributes,
                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {}
                );
                if (parsed != null) {
                    for (Map.Entry<String, Object> entry : parsed.entrySet()) {
                        String key = entry.getKey();
                        Object val = entry.getValue();
                        if (key == null || val == null || isColorAttributeKey(key)) continue;
                        String valStr = String.valueOf(val).trim();
                        if (!valStr.isEmpty()) {
                            registerFacetToken(accumulatorMap, valStr, key, productId);
                        }
                    }
                    return;
                }
            } catch (Exception ignored) {
                // Nếu JSON không hợp lệ thì fallback xuống bóc tách chuỗi phân cách bên dưới
            }
        }

        // Hỗ trợ định dạng chuỗi "Trọng lượng: 4U | Độ căng: 11kg"
        String delimiter = rawAttributes.contains("|") ? "\\|" : rawAttributes.contains(";") ? ";" : null;
        String[] parts = delimiter != null ? rawAttributes.split(delimiter) : new String[]{rawAttributes};
        for (String part : parts) {
            String trimmed = part.trim();
            int colonIdx = trimmed.indexOf(':');
            if (colonIdx > 0) {
                String key = trimmed.substring(0, colonIdx).trim();
                String val = trimmed.substring(colonIdx + 1).trim();
                if (!isColorAttributeKey(key) && !val.isEmpty()) {
                    registerFacetToken(accumulatorMap, val, key, productId);
                }
            }
        }
    }

    /**
     * So sánh sắp xếp tự nhiên đa định dạng (Smart Alphanumeric Natural Sort):
     * 1. Size chữ quốc tế (XXS -> 5XL, Freesize) theo đúng thứ tự độ lớn.
     * 2. Số thuần túy (4, 5, 38..44, 150..190) theo giá trị số tăng dần (4 < 38 < 190).
     * 3. Số kèm đơn vị thể thao (8oz < 10oz < 12oz, 3U < 4U, Số 4 < Số 5, 2kg < 5kg < 10kg).
     * 4. Các quy cách chữ khác sắp xếp chuẩn bảng chữ cái.
     */
    private static int compareVariantSizeOptionsNaturally(
            AvailableVariantSizeResponse.VariantSizeOption a,
            AvailableVariantSizeResponse.VariantSizeOption b
    ) {
        String va = a.getValue() != null ? a.getValue().trim() : "";
        String vb = b.getValue() != null ? b.getValue().trim() : "";
        String la = va.toLowerCase();
        String lb = vb.toLowerCase();

        Integer rankA = STANDARD_LETTER_SIZE_RANK.get(la);
        Integer rankB = STANDARD_LETTER_SIZE_RANK.get(lb);
        if (rankA != null && rankB != null) {
            return Integer.compare(rankA, rankB);
        }
        if (rankA != null) return -1;
        if (rankB != null) return 1;

        java.util.regex.Matcher pureNumA = PURE_NUMBER_PATTERN.matcher(la);
        java.util.regex.Matcher pureNumB = PURE_NUMBER_PATTERN.matcher(lb);
        boolean isPureA = pureNumA.matches();
        boolean isPureB = pureNumB.matches();
        if (isPureA && isPureB) {
            double na = Double.parseDouble(pureNumA.group(1).replace(',', '.'));
            double nb = Double.parseDouble(pureNumB.group(1).replace(',', '.'));
            return Double.compare(na, nb);
        }
        if (isPureA) return -1;
        if (isPureB) return 1;

        java.util.regex.Matcher unitA = NUMBER_WITH_UNIT_PATTERN.matcher(la);
        java.util.regex.Matcher unitB = NUMBER_WITH_UNIT_PATTERN.matcher(lb);
        boolean isUnitA = unitA.matches();
        boolean isUnitB = unitB.matches();
        if (isUnitA && isUnitB) {
            String groupUnitA = (unitA.group(1).trim() + "_" + unitA.group(3).trim()).toLowerCase();
            String groupUnitB = (unitB.group(1).trim() + "_" + unitB.group(3).trim()).toLowerCase();
            int unitCmp = groupUnitA.compareTo(groupUnitB);
            if (unitCmp != 0) return unitCmp;
            double na = Double.parseDouble(unitA.group(2).replace(',', '.'));
            double nb = Double.parseDouble(unitB.group(2).replace(',', '.'));
            return Double.compare(na, nb);
        }
        if (isUnitA) return -1;
        if (isUnitB) return 1;

        return va.compareToIgnoreCase(vb);
    }
}
