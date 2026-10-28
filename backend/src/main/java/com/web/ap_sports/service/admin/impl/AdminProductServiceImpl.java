package com.web.ap_sports.service.admin.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.admin.CreateProductRequest;
import com.web.ap_sports.dto.request.admin.UpdateProductRequest;
import com.web.ap_sports.dto.request.admin.VariantRequest;
import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestItemDto;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.dto.response.common.VariantResponse;
import com.web.ap_sports.dto.response.warehouse.ImportRequestResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.enums.InboundActionType;
import com.web.ap_sports.enums.ProductVariantStatus;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.InventoryTransaction;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.Supplier;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.InventoryTransactionRepository;
import com.web.ap_sports.repository.OrderItemRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.SupplierRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminProductService;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.warehouse.WarehouseImportRequestService;
import com.web.ap_sports.service.warehouse.WarehouseInventoryService;
import com.web.ap_sports.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
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
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final OrderItemRepository orderItemRepository;
    private final WarehouseInventoryService warehouseInventoryService;
    private final WarehouseImportRequestService importRequestService;
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

        List<ProductResponse> responses = mapToProductResponseList(productPage.getContent());

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
    public ProductDetailResponse createProduct(CreateProductRequest request, String currentUserEmail) {
        // 1. Xác thực người dùng hiện tại & kiểm tra phân quyền bảo mật chặt chẽ
        User currentUser = null;
        if (StringUtils.hasText(currentUserEmail)) {
            currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }

        boolean isStaff = currentUser != null && "STAFF".equalsIgnoreCase(currentUser.getRole().getName());
        InboundActionType inboundAction = request.getInboundAction() != null 
                ? request.getInboundAction() 
                : InboundActionType.NONE;

        boolean hasInitialStock = request.getVariants() != null && request.getVariants().stream()
                .anyMatch(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0);

        // BE VALIDATION: Chặn tuyệt đối quyền Nhân viên (Staff) can thiệp vào kho (không được lập phiếu nhập kho và không được gửi yêu cầu nhập kho)
        if (isStaff) {
            if (request.getSupplierId() != null || hasInitialStock || inboundAction == InboundActionType.DIRECT_IMPORT || inboundAction == InboundActionType.IMPORT_REQUEST) {
                throw new AppException("Tài khoản Nhân viên (Staff) không có quyền tự lập phiếu nhập kho ban đầu!", HttpStatus.FORBIDDEN);
            }
            inboundAction = InboundActionType.NONE;
            hasInitialStock = false;
        }

        // Tự động tương thích ngược: Nếu Admin gửi có stockQuantity > 0 và không phải IMPORT_REQUEST -> coi như DIRECT_IMPORT
        if (!isStaff && hasInitialStock && inboundAction != InboundActionType.IMPORT_REQUEST) {
            inboundAction = InboundActionType.DIRECT_IMPORT;
        }

        // BE VALIDATION: Đối với DIRECT_IMPORT, nếu có số lượng > 0 thì BẮT BUỘC phải chọn Nhà cung cấp
        Supplier supplier = null;
        if (inboundAction == InboundActionType.DIRECT_IMPORT) {
            if (hasInitialStock) {
                if (request.getSupplierId() == null) {
                    throw new AppException("Vui lòng chọn Nhà cung cấp để lập phiếu nhập kho cho sản phẩm mới!", HttpStatus.BAD_REQUEST);
                }
                supplier = supplierRepository.findById(request.getSupplierId())
                        .orElseThrow(() -> new AppException("Nhà cung cấp đã chọn không tồn tại trên hệ thống!", HttpStatus.BAD_REQUEST));
            }
        }
        // Lưu ý: Đối với IMPORT_REQUEST, không cần chọn Nhà cung cấp tại bước gửi yêu cầu (bắn WebSocket tới Quản lý kho).

        // Validate slug uniqueness BEFORE uploading images to Cloudinary
        String slug = StringUtils.hasText(request.getSlug())
                ? toSlug(request.getSlug())
                : toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            throw new AppException("Slug sản phẩm '" + slug + "' đã tồn tại trong hệ thống.", HttpStatus.BAD_REQUEST);
        }

        // Validate variants SKUs (both internal duplicate in request and DB uniqueness)
        Set<String> seenSkus = new HashSet<>();
        for (VariantRequest vr : request.getVariants()) {
            String normalizedSku = vr.getSku() != null ? vr.getSku().trim().toUpperCase() : "";
            if (StringUtils.hasText(normalizedSku) && !seenSkus.add(normalizedSku)) {
                throw new AppException("Mã SKU '" + vr.getSku().trim() + "' bị trùng lặp ngay trong danh sách biến thể gửi lên.", HttpStatus.BAD_REQUEST);
            }
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

        // Pre-upload all product images to Cloudinary IN PARALLEL only AFTER all validations succeed
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

        // Chỉ DIRECT_IMPORT mới cộng dồn tồn kho ban đầu ngay lập tức
        int totalStock = 0;
        if (inboundAction == InboundActionType.DIRECT_IMPORT) {
            totalStock = request.getVariants().stream()
                    .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                    .sum();
        }

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
                .weight(request.getWeight() != null ? request.getWeight() : 500)
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

        // Quyết định số lượng lưu thực tế vào ProductVariant
        List<VariantRequest> variantsToSave = new ArrayList<>();
        for (VariantRequest vr : request.getVariants()) {
            int qtyToSave = (inboundAction == InboundActionType.DIRECT_IMPORT && vr.getStockQuantity() != null)
                    ? vr.getStockQuantity()
                    : 0;

            VariantRequest copy = VariantRequest.builder()
                    .id(vr.getId())
                    .sku(vr.getSku())
                    .color(vr.getColor())
                    .size(vr.getSize())
                    .attributes(vr.getAttributes())
                    .price(vr.getPrice())
                    .costPrice(vr.getCostPrice())
                    .stockQuantity(qtyToSave)
                    .status(vr.getStatus() != null ? vr.getStatus() : ProductVariantStatus.ACTIVE)
                    .images(vr.getImages())
                    .build();
            variantsToSave.add(copy);
        }

        // Save Variants and Variant Images
        List<ProductVariant> savedVariants = saveVariantsAndImages(savedProduct, variantsToSave, true);

        // 1. NHÁNH DIRECT_IMPORT (ADMIN LẬP PHIẾU NHẬP KHO NHANH)
        String ticketCode = null;
        InventoryTransactionResponse initialImportTicket = null;
        if (inboundAction == InboundActionType.DIRECT_IMPORT && supplier != null && hasInitialStock && currentUser != null) {
            ticketCode = generateTicketCode(InventoryTransaction.TransactionType.IMPORT);
            List<InventoryTransaction> savedTxList = new ArrayList<>();
            Map<String, ProductVariant> variantSkuMap = savedVariants.stream()
                    .collect(Collectors.toMap(ProductVariant::getSku, v -> v));

            for (VariantRequest vr : request.getVariants()) {
                if (vr.getStockQuantity() != null && vr.getStockQuantity() > 0) {
                    ProductVariant v = variantSkuMap.get(vr.getSku().trim());
                    if (v != null) {
                        InventoryTransaction tx = InventoryTransaction.builder()
                                .code(ticketCode)
                                .variant(v)
                                .supplier(supplier)
                                .type(InventoryTransaction.TransactionType.IMPORT)
                                .quantity(vr.getStockQuantity())
                                .unitCost(vr.getCostPrice() != null ? vr.getCostPrice() : BigDecimal.ZERO)
                                .note(StringUtils.hasText(request.getImportNote())
                                        ? request.getImportNote().trim()
                                        : "Nhập kho nhanh khi tạo sản phẩm: " + savedProduct.getName())
                                .createdBy(currentUser)
                                .build();
                        savedTxList.add(transactionRepository.save(tx));
                    }
                }
            }

            if (!savedTxList.isEmpty()) {
                initialImportTicket = warehouseInventoryService.getTransactionById(savedTxList.get(0).getId());
                log.info("Đã tự động lập phiếu nhập kho nhanh [{}] cho sản phẩm ID={} gồm {} biến thể bởi {}",
                        ticketCode, savedProduct.getId(), savedTxList.size(), currentUser.getEmail());
            }
        }

        // 2. NHÁNH IMPORT_REQUEST (ADMIN HOẶC STAFF GỬI YÊU CẦU NHẬP KHO TỚI BỘ PHẬN KHO)
        String importRequestCode = null;
        ImportRequestResponse initialImportRequest = null;
        if (inboundAction == InboundActionType.IMPORT_REQUEST && hasInitialStock && currentUser != null) {
            Map<String, ProductVariant> variantSkuMap = savedVariants.stream()
                    .collect(Collectors.toMap(ProductVariant::getSku, v -> v));

            List<CreateImportRequestItemDto> reqItems = new ArrayList<>();
            for (VariantRequest vr : request.getVariants()) {
                if (vr.getStockQuantity() != null && vr.getStockQuantity() > 0) {
                    ProductVariant v = variantSkuMap.get(vr.getSku().trim());
                    if (v != null) {
                        reqItems.add(CreateImportRequestItemDto.builder()
                                .variantId(v.getId())
                                .requestedQuantity(vr.getStockQuantity())
                                .expectedCostPrice(vr.getCostPrice())
                                .build());
                    }
                }
            }

            if (!reqItems.isEmpty()) {
                CreateImportRequestDto reqDto = CreateImportRequestDto.builder()
                        .productId(savedProduct.getId())
                        .supplierId(null) // Gửi yêu cầu nhập kho: không gắn nhà cung cấp tại bước gửi đề xuất
                        .note(StringUtils.hasText(request.getImportNote())
                                ? request.getImportNote().trim()
                                : "Yêu cầu nhập kho ban đầu cho sản phẩm mới: " + savedProduct.getName())
                        .items(reqItems)
                        .build();

                initialImportRequest = importRequestService.createImportRequest(reqDto, currentUserEmail);
                importRequestCode = initialImportRequest.getCode();
                log.info("Đã tự động gửi yêu cầu nhập kho [{}] cho sản phẩm ID={} gồm {} biến thể tới Quản lý kho",
                        importRequestCode, savedProduct.getId(), reqItems.size());
            }
        }

        ProductDetailResponse detailResponse = getProductById(savedProduct.getId());
        detailResponse.setInitialImportTicketCode(ticketCode);
        detailResponse.setInitialImportTransaction(initialImportTicket);
        detailResponse.setInitialImportRequestCode(importRequestCode);
        detailResponse.setInitialImportRequest(initialImportRequest);
        return detailResponse;
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        String slug = toSlug(request.getSlug());
        if (productRepository.existsBySlugAndIdNot(slug, id)) {
            throw new AppException("Slug sản phẩm '" + slug + "' đã trùng với sản phẩm khác.", HttpStatus.BAD_REQUEST);
        }

        // Validate variants SKUs (both internal duplicate in request and DB uniqueness)
        Set<String> seenSkus = new HashSet<>();
        for (VariantRequest vr : request.getVariants()) {
            String normalizedSku = vr.getSku() != null ? vr.getSku().trim().toUpperCase() : "";
            if (StringUtils.hasText(normalizedSku) && !seenSkus.add(normalizedSku)) {
                throw new AppException("Mã SKU '" + vr.getSku().trim() + "' bị trùng lặp ngay trong danh sách biến thể gửi lên.", HttpStatus.BAD_REQUEST);
            }
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

        // Validate deletion of old variants not included in request BEFORE uploading any images
        Set<Long> requestVariantIds = request.getVariants().stream()
                .map(VariantRequest::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<ProductVariant> variantsToDelete = new ArrayList<>();
        for (ProductVariant oldVar : existingVariants) {
            if (!requestVariantIds.contains(oldVar.getId())) {
                if (orderItemRepository.existsByVariantId(oldVar.getId())) {
                    throw new AppException("Phân loại hàng [SKU: " + oldVar.getSku() + "] đã phát sinh trong đơn hàng của khách, không thể xóa bỏ. Vui lòng giữ lại phân loại này.", HttpStatus.BAD_REQUEST);
                }
                if (transactionRepository.existsByVariantId(oldVar.getId())) {
                    throw new AppException("Phân loại hàng [SKU: " + oldVar.getSku() + "] đã phát sinh phiếu nhập/xuất kho, không thể xóa bỏ. Vui lòng giữ lại phân loại này.", HttpStatus.BAD_REQUEST);
                }
                variantsToDelete.add(oldVar);
            }
        }

        // Pre-upload all product images to Cloudinary IN PARALLEL only AFTER all validations succeed
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

        for (ProductVariant oldVar : variantsToDelete) {
            variantRepository.delete(oldVar);
        }

        product.setName(request.getName().trim());
        product.setSlug(slug);
        product.setCategory(primaryCategory);
        product.setCategories(categorySet);
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setUnit(request.getUnit() != null ? request.getUnit().trim() : product.getUnit());
        if (request.getWeight() != null) product.setWeight(request.getWeight());
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

            String colorVal = StringUtils.hasText(vr.getColor()) ? vr.getColor().trim() : null;
            String sizeVal = StringUtils.hasText(vr.getSize()) ? vr.getSize().trim() : null;
            String attributesJson = resolveAttributesJson(vr.getAttributes(), colorVal, sizeVal);

            variant.setSku(vr.getSku().trim());
            variant.setSize(sizeVal);
            variant.setColor(colorVal);
            variant.setAttributes(attributesJson);
            variant.setPrice(vr.getPrice());
            variant.setCostPrice(vr.getCostPrice());
            if (vr.getStatus() != null) {
                variant.setStatus(vr.getStatus());
            }

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
    public VariantResponse toggleVariantStatus(Long productId, Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException("Không tìm thấy biến thể với ID: " + variantId, HttpStatus.NOT_FOUND));

        if (!variant.getProduct().getId().equals(productId)) {
            throw new AppException("Biến thể không thuộc sản phẩm này", HttpStatus.BAD_REQUEST);
        }

        ProductVariantStatus newStatus = (variant.getStatus() == ProductVariantStatus.DISCONTINUED)
                ? ProductVariantStatus.ACTIVE
                : ProductVariantStatus.DISCONTINUED;

        variant.setStatus(newStatus);
        ProductVariant saved = variantRepository.save(variant);

        List<ProductImage> images = imageRepository.findByProductId(productId);
        List<String> vImgs = images.stream()
                .filter(img -> img.getVariant() != null && img.getVariant().getId().equals(saved.getId()))
                .map(ProductImage::getImagePath)
                .collect(Collectors.toList());

        String variantName = null;
        if (saved.getAttributes() != null && !saved.getAttributes().isBlank()) {
            variantName = saved.getAttributes();
        } else {
            List<String> parts = new ArrayList<>();
            if (saved.getSize() != null && !saved.getSize().isBlank()) parts.add("Size: " + saved.getSize());
            if (saved.getColor() != null && !saved.getColor().isBlank()) parts.add("Màu: " + saved.getColor());
            if (!parts.isEmpty()) variantName = String.join(" | ", parts);
        }

        return VariantResponse.builder()
                .id(saved.getId())
                .sku(saved.getSku())
                .size(saved.getSize())
                .color(saved.getColor())
                .attributes(saved.getAttributes())
                .variantName(variantName)
                .price(saved.getPrice())
                .costPrice(saved.getCostPrice())
                .stockQuantity(saved.getStockQuantity())
                .status(saved.getStatus())
                .version(saved.getVersion())
                .images(vImgs)
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy sản phẩm với ID: " + id, HttpStatus.NOT_FOUND));

        if (orderItemRepository.existsByProductId(id)) {
            throw new AppException("Sản phẩm '" + product.getName() + "' đã có lịch sử đơn hàng, không thể xóa khỏi hệ thống. Vui lòng chuyển trạng thái sang 'Ngừng kinh doanh' (discontinued).", HttpStatus.BAD_REQUEST);
        }

        if (transactionRepository.existsByVariant_ProductId(id)) {
            throw new AppException("Sản phẩm '" + product.getName() + "' đã phát sinh giao dịch kho, không thể xóa khỏi hệ thống. Vui lòng chuyển trạng thái sang 'Ngừng kinh doanh' (discontinued).", HttpStatus.BAD_REQUEST);
        }

        imageRepository.deleteByProductId(id);
        variantRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    private List<ProductVariant> saveVariantsAndImages(Product product, List<VariantRequest> variantRequests, boolean isCreate) {
        List<ProductVariant> savedList = new ArrayList<>();
        for (VariantRequest vr : variantRequests) {
            String colorVal = StringUtils.hasText(vr.getColor()) ? vr.getColor().trim() : null;
            String sizeVal = StringUtils.hasText(vr.getSize()) ? vr.getSize().trim() : null;
            String attributesJson = resolveAttributesJson(vr.getAttributes(), colorVal, sizeVal);

            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .sku(vr.getSku().trim())
                    .size(sizeVal)
                    .color(colorVal)
                    .attributes(attributesJson)
                    .price(vr.getPrice())
                    .costPrice(vr.getCostPrice())
                    .stockQuantity(vr.getStockQuantity() != null ? vr.getStockQuantity() : 0)
                    .status(vr.getStatus() != null ? vr.getStatus() : ProductVariantStatus.ACTIVE)
                    .build();

            ProductVariant savedVariant = variantRepository.save(variant);
            savedList.add(savedVariant);

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
        return savedList;
    }

    private String generateTicketCode(InventoryTransaction.TransactionType type) {
        String prefix = type == InventoryTransaction.TransactionType.IMPORT ? "PNK" : "PXK";
        String timestamp = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomSeq = (int) (Math.random() * 900) + 100;
        return String.format("%s-%s-%d", prefix, timestamp, randomSeq);
    }

    private List<ProductResponse> mapToProductResponseList(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> productIds = products.stream()
                .map(Product::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<ProductVariant> batchVariants = variantRepository.findByProductIdIn(productIds);
        Map<Long, List<ProductVariant>> variantMap = batchVariants != null
                ? batchVariants.stream()
                        .filter(v -> v.getProduct() != null && v.getProduct().getId() != null)
                        .collect(Collectors.groupingBy(v -> v.getProduct().getId()))
                : Collections.emptyMap();

        List<ProductImage> batchImages = imageRepository.findByProductIdIn(productIds);
        Map<Long, List<ProductImage>> imageMap = batchImages != null
                ? batchImages.stream()
                        .filter(img -> img.getProduct() != null && img.getProduct().getId() != null)
                        .collect(Collectors.groupingBy(img -> img.getProduct().getId()))
                : Collections.emptyMap();

        return products.stream()
                .map(p -> mapToProductResponse(
                        p,
                        variantMap.getOrDefault(p.getId(), Collections.emptyList()),
                        imageMap.getOrDefault(p.getId(), Collections.emptyList())
                ))
                .collect(Collectors.toList());
    }

    private ProductResponse mapToProductResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<ProductImage> images = imageRepository.findByProductId(product.getId());
        return mapToProductResponse(product, variants, images);
    }

    private ProductResponse mapToProductResponse(Product product, List<ProductVariant> variants, List<ProductImage> images) {
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

                    String variantName = null;
                    if (v.getAttributes() != null && !v.getAttributes().isBlank()) {
                        variantName = v.getAttributes();
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
                            .attributes(v.getAttributes())
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

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
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

    private String resolveAttributesJson(String rawAttr, String color, String size) {
        if (StringUtils.hasText(rawAttr)) {
            return rawAttr.trim();
        }
        Map<String, String> map = new java.util.LinkedHashMap<>();
        if (StringUtils.hasText(color)) {
            map.put("Màu sắc", color.trim());
        }
        if (StringUtils.hasText(size)) {
            String sizeStr = size.trim();
            if (sizeStr.contains("|")) {
                String[] parts = sizeStr.split("\\|");
                if (parts.length >= 1 && StringUtils.hasText(parts[0])) {
                    map.put("Kích thước", parts[0].trim());
                }
                if (parts.length >= 2 && StringUtils.hasText(parts[1])) {
                    map.put("Thuộc tính bổ sung", parts[1].trim());
                }
                for (int i = 2; i < parts.length; i++) {
                    if (StringUtils.hasText(parts[i])) {
                        map.put("Thuộc tính " + (i + 1), parts[i].trim());
                    }
                }
            } else {
                map.put("Kích thước / Size", sizeStr);
            }
        }
        if (map.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return null;
        }
    }
}
