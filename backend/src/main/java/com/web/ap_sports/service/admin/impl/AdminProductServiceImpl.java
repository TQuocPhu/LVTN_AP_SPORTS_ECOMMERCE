package com.web.ap_sports.service.admin.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.admin.CreateProductRequest;
import com.web.ap_sports.dto.request.admin.UpdateProductRequest;
import com.web.ap_sports.dto.request.admin.VariantRequest;
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
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.service.admin.AdminProductService;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProductServiceImpl implements AdminProductService {

    private static final String PRODUCT_FOLDER = "ap-sports-e-commerce/products";

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(ProductFilterRequest filterRequest) {
        int page = Math.max(0, filterRequest.getPage());
        int size = filterRequest.getSize() <= 0 ? 10 : filterRequest.getSize();

        Sort sort = Sort.by(
                "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC,
                StringUtils.hasText(filterRequest.getSortBy()) ? filterRequest.getSortBy() : "createdAt"
        );

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Product> spec = ProductSpecifications.filterProducts(filterRequest);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> responses = productPage.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, productPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        return mapToProductDetailResponse(product);
    }

    @Override
    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        // Pre-upload all product images to Cloudinary IN PARALLEL before DB transaction logic
        uploadProductImagesParallel(request.getMainImage(), request.getVariants(), (urlMap) -> {
            if (StringUtils.hasText(request.getMainImage()) && urlMap.containsKey(request.getMainImage().trim())) {
                request.setMainImage(urlMap.get(request.getMainImage().trim()));
            }
            if (request.getVariants() != null) {
                for (VariantRequest vr : request.getVariants()) {
                    if (vr.getImages() != null && !vr.getImages().isEmpty()) {
                        List<String> updatedImgs = vr.getImages().stream()
                                .map(img -> urlMap.getOrDefault(img.trim(), img))
                                .collect(Collectors.toList());
                        vr.setImages(updatedImgs);
                    }
                }
            }
        });

        // Validate slug uniqueness
        String slug = StringUtils.hasText(request.getSlug())
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            throw new AppException("Slug sản phẩm '" + slug + "' đã tồn tại trong hệ thống.", HttpStatus.BAD_REQUEST);
        }

        // Validate variants SKUs
        for (VariantRequest vr : request.getVariants()) {
            if (variantRepository.existsBySku(vr.getSku())) {
                throw new AppException("Mã SKU '" + vr.getSku() + "' đã tồn tại trên hệ thống.", HttpStatus.BAD_REQUEST);
            }
        }

        // Categories mapping
        Set<Category> categorySet = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
        if (categorySet.isEmpty()) {
            throw new AppException("Danh mục đã chọn không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        Long primaryCatId = request.getPrimaryCategoryId() != null
                ? request.getPrimaryCategoryId()
                : request.getCategoryIds().iterator().next();

        Category primaryCategory = categoryRepository.findById(primaryCatId)
                .orElseThrow(() -> new AppException("Không tìm thấy danh mục chính ID: " + primaryCatId, HttpStatus.BAD_REQUEST));

        // Calculate initial total stock from variants
        int totalStock = request.getVariants().stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();

        String specificationsJson = serializeSpecifications(request.getSpecifications());

        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(slug)
                .category(primaryCategory)
                .categories(categorySet)
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(totalStock)
                .status(totalStock > 0 ? "in_stock" : "out_of_stock")
                .unit(request.getUnit() != null ? request.getUnit().trim() : "Cái")
                .specifications(specificationsJson)
                .build();

        Product savedProduct = productRepository.save(product);

        // Save Main Image if provided
        if (StringUtils.hasText(request.getMainImage())) {
            String uploadedUrl = cloudinaryService.uploadBase64OrUrl(request.getMainImage().trim(), PRODUCT_FOLDER);
            ProductImage mainImg = ProductImage.builder()
                    .product(savedProduct)
                    .imagePath(uploadedUrl)
                    .isPrimary(true)
                    .build();
            imageRepository.save(mainImg);
        }

        // Save Variants and Variant Images
        saveVariantsAndImages(savedProduct, request.getVariants(), true);

        return getProductById(savedProduct.getId());
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Long id, UpdateProductRequest request) {
        // Pre-upload all product images to Cloudinary IN PARALLEL before DB transaction logic
        uploadProductImagesParallel(request.getMainImage(), request.getVariants(), (urlMap) -> {
            if (StringUtils.hasText(request.getMainImage()) && urlMap.containsKey(request.getMainImage().trim())) {
                request.setMainImage(urlMap.get(request.getMainImage().trim()));
            }
            if (request.getVariants() != null) {
                for (VariantRequest vr : request.getVariants()) {
                    if (vr.getImages() != null && !vr.getImages().isEmpty()) {
                        List<String> updatedImgs = vr.getImages().stream()
                                .map(img -> urlMap.getOrDefault(img.trim(), img))
                                .collect(Collectors.toList());
                        vr.setImages(updatedImgs);
                    }
                }
            }
        });

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        String slug = toSlug(request.getSlug());
        if (productRepository.existsBySlugAndIdNot(slug, id)) {
            throw new AppException("Slug sản phẩm '" + slug + "' đã trùng với sản phẩm khác.", HttpStatus.BAD_REQUEST);
        }

        // Validate variants SKUs
        for (VariantRequest vr : request.getVariants()) {
            if (vr.getId() == null && variantRepository.existsBySku(vr.getSku())) {
                throw new AppException("Mã SKU '" + vr.getSku() + "' đã tồn tại trên hệ thống.", HttpStatus.BAD_REQUEST);
            }
            if (vr.getId() != null && variantRepository.existsBySkuAndIdNot(vr.getSku(), vr.getId())) {
                throw new AppException("Mã SKU '" + vr.getSku() + "' đã trùng với biến thể khác.", HttpStatus.BAD_REQUEST);
            }
        }

        Set<Category> categorySet = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
        if (categorySet.isEmpty()) {
            throw new AppException("Danh mục đã chọn không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        Long primaryCatId = request.getPrimaryCategoryId() != null
                ? request.getPrimaryCategoryId()
                : request.getCategoryIds().iterator().next();

        Category primaryCategory = categoryRepository.findById(primaryCatId)
                .orElseThrow(() -> new AppException("Không tìm thấy danh mục chính ID: " + primaryCatId, HttpStatus.BAD_REQUEST));

        // LOCKED STOCK RULE: In update mode, preserve existing variant stock quantities from database.
        // Product update does NOT allow changing stock (stock changes must go through Inventory Management).
        List<ProductVariant> existingVariants = variantRepository.findByProductId(id);
        Map<Long, Integer> existingStockMap = existingVariants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, ProductVariant::getStockQuantity));

        product.setName(request.getName().trim());
        product.setSlug(slug);
        product.setCategory(primaryCategory);
        product.setCategories(categorySet);
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit() != null ? request.getUnit().trim() : product.getUnit());
        if (StringUtils.hasText(request.getStatus())) {
            product.setStatus(request.getStatus().trim());
        }
        product.setSpecifications(serializeSpecifications(request.getSpecifications()));

        // Update Main Image
        if (StringUtils.hasText(request.getMainImage())) {
            List<ProductImage> existingImages = imageRepository.findByProductId(id);
            for (ProductImage img : existingImages) {
                if (img.isPrimary()) {
                    imageRepository.delete(img);
                }
            }
            String uploadedUrl = cloudinaryService.uploadBase64OrUrl(request.getMainImage().trim(), PRODUCT_FOLDER);
            ProductImage newMainImg = ProductImage.builder()
                    .product(product)
                    .imagePath(uploadedUrl)
                    .isPrimary(true)
                    .build();
            imageRepository.save(newMainImg);
        }

        // Delete old variants not included in request
        Set<Long> requestVariantIds = request.getVariants().stream()
                .map(VariantRequest::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (ProductVariant oldVar : existingVariants) {
            if (!requestVariantIds.contains(oldVar.getId())) {
                variantRepository.delete(oldVar);
            }
        }

        // Update or create variants without altering stock quantity
        int calculatedStock = 0;
        for (VariantRequest vr : request.getVariants()) {
            ProductVariant variant;
            if (vr.getId() != null) {
                variant = variantRepository.findById(vr.getId())
                        .orElseGet(() -> ProductVariant.builder().product(product).build());
            } else {
                variant = ProductVariant.builder().product(product).stockQuantity(0).build();
            }

            variant.setSku(vr.getSku().trim());
            variant.setSize(vr.getSize().trim());
            variant.setColor(StringUtils.hasText(vr.getColor()) ? vr.getColor().trim() : null);
            variant.setPrice(vr.getPrice());
            variant.setCostPrice(vr.getCostPrice());

            // Ensure stock quantity is untouched from existing database state
            if (existingStockMap.containsKey(variant.getId())) {
                variant.setStockQuantity(existingStockMap.get(variant.getId()));
            }

            calculatedStock += (variant.getStockQuantity() != null ? variant.getStockQuantity() : 0);

            ProductVariant savedVariant = variantRepository.save(variant);

            // Save variant images
            if (vr.getImages() != null && !vr.getImages().isEmpty()) {
                // Delete old variant specific images
                List<ProductImage> oldVarImgs = imageRepository.findByVariantId(savedVariant.getId());
                imageRepository.deleteAll(oldVarImgs);

                for (String imgPath : vr.getImages()) {
                    if (StringUtils.hasText(imgPath)) {
                        String uploadedVUrl = cloudinaryService.uploadBase64OrUrl(imgPath.trim(), PRODUCT_FOLDER);
                        ProductImage vImg = ProductImage.builder()
                                .product(product)
                                .variant(savedVariant)
                                .imagePath(uploadedVUrl)
                                .isPrimary(false)
                                .build();
                        imageRepository.save(vImg);
                    }
                }
            }
        }

        product.setStock(calculatedStock);
        productRepository.save(product);

        return getProductById(id);
    }

    @Override
    @Transactional
    public ProductResponse toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        if ("discontinued".equalsIgnoreCase(product.getStatus())) {
            product.setStatus("in_stock");
        } else if ("in_stock".equalsIgnoreCase(product.getStatus())) {
            product.setStatus("discontinued");
        } else {
            product.setStatus("in_stock");
        }

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        imageRepository.deleteByProductId(id);
        variantRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private void saveVariantsAndImages(Product product, List<VariantRequest> variantRequests, boolean isCreate) {
        for (VariantRequest vr : variantRequests) {
            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .sku(vr.getSku().trim())
                    .size(vr.getSize().trim())
                    .color(StringUtils.hasText(vr.getColor()) ? vr.getColor().trim() : null)
                    .price(vr.getPrice())
                    .costPrice(vr.getCostPrice())
                    .stockQuantity(vr.getStockQuantity() != null ? vr.getStockQuantity() : 0)
                    .build();

            ProductVariant savedVariant = variantRepository.save(variant);

            if (vr.getImages() != null) {
                for (String imgPath : vr.getImages()) {
                    if (StringUtils.hasText(imgPath)) {
                        String uploadedVUrl = cloudinaryService.uploadBase64OrUrl(imgPath.trim(), PRODUCT_FOLDER);
                        ProductImage vImg = ProductImage.builder()
                                .product(product)
                                .variant(savedVariant)
                                .imagePath(uploadedVUrl)
                                .isPrimary(false)
                                .build();
                        imageRepository.save(vImg);
                    }
                }
            }
        }
    }

    private ProductResponse mapToProductResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<ProductImage> images = imageRepository.findByProductId(product.getId());

        String mainImage = images.stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImagePath)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getImagePath());

        List<CategoryResponse> catResponses = product.getCategories().stream()
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
                .totalStock(product.getStock())
                .status(product.getStatus())
                .unit(product.getUnit())
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

        List<CategoryResponse> catResponses = product.getCategories().stream()
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

                    return VariantResponse.builder()
                            .id(v.getId())
                            .sku(v.getSku())
                            .size(v.getSize())
                            .color(v.getColor())
                            .price(v.getPrice())
                            .costPrice(v.getCostPrice())
                            .stockQuantity(v.getStockQuantity())
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

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .totalStock(product.getStock())
                .status(product.getStatus())
                .unit(product.getUnit())
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

    private String serializeSpecifications(Map<String, String> specs) {
        if (specs == null || specs.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(specs);
        } catch (JsonProcessingException e) {
            log.error("Lỗi serialize specifications JSON:", e);
            return null;
        }
    }

    private Map<String, String> deserializeSpecifications(String json) {
        if (!StringUtils.hasText(json)) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Lỗi deserialize specifications JSON:", e);
            return new HashMap<>();
        }
    }

    private String toSlug(String input) {
        if (!StringUtils.hasText(input)) return "";
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");
        return slug.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("Đ", "d")
                .replaceAll("[^a-z0-9-]", "")
                .replaceAll("-+", "-");
    }

    private void uploadProductImagesParallel(String mainImage, List<VariantRequest> variants, java.util.function.Consumer<Map<String, String>> applyUrls) {
        List<String> allImages = new ArrayList<>();
        if (StringUtils.hasText(mainImage)) {
            allImages.add(mainImage);
        }
        if (variants != null) {
            for (VariantRequest vr : variants) {
                if (vr.getImages() != null) {
                    allImages.addAll(vr.getImages());
                }
            }
        }

        if (!allImages.isEmpty()) {
            Map<String, String> uploadedUrlMap = cloudinaryService.uploadBase64OrUrlBatch(allImages, PRODUCT_FOLDER);
            applyUrls.accept(uploadedUrlMap);
        }
    }
}
