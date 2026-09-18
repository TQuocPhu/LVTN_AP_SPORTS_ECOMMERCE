package com.web.ap_sports.service.warehouse.impl;

import com.web.ap_sports.dto.request.warehouse.CreateInventoryTransactionRequest;
import com.web.ap_sports.dto.request.warehouse.InventoryAuditRequest;
import com.web.ap_sports.dto.request.warehouse.TransactionItemRequest;
import com.web.ap_sports.dto.response.warehouse.InventoryOverviewStatsResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.dto.response.warehouse.LowStockVariantResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.warehouse.WarehouseInventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseInventoryServiceImpl implements WarehouseInventoryService {

    private final InventoryTransactionRepository transactionRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public InventoryTransactionResponse createTransaction(CreateInventoryTransactionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException("Nhà cung cấp không tồn tại", HttpStatus.NOT_FOUND));
        }

        // Standardize list of items
        List<TransactionItemRequest> items = request.getItems();
        if (items == null || items.isEmpty()) {
            if (request.getVariantId() != null && request.getQuantity() != null && request.getQuantity() > 0) {
                items = List.of(TransactionItemRequest.builder()
                        .variantId(request.getVariantId())
                        .quantity(request.getQuantity())
                        .unitCost(request.getUnitCost())
                        .build());
            } else {
                throw new AppException("Danh sách mặt hàng nhập/xuất kho không được để trống", HttpStatus.BAD_REQUEST);
            }
        }

        InventoryTransaction lastSavedTx = null;

        for (TransactionItemRequest item : items) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new AppException("Biến thể sản phẩm với ID " + item.getVariantId() + " không tồn tại", HttpStatus.NOT_FOUND));

            int qty = item.getQuantity();
            if (request.getType() == TransactionType.IMPORT) {
                variant.setStockQuantity(variant.getStockQuantity() + qty);
                if (item.getUnitCost() != null && item.getUnitCost().compareTo(BigDecimal.ZERO) > 0) {
                    variant.setCostPrice(item.getUnitCost());
                }
            } else if (request.getType() == TransactionType.EXPORT) {
                if (variant.getStockQuantity() < qty) {
                    throw new AppException("Số lượng xuất (" + qty + ") của " + variant.getSku() + " vượt quá số lượng tồn kho (" + variant.getStockQuantity() + ")", HttpStatus.BAD_REQUEST);
                }
                variant.setStockQuantity(variant.getStockQuantity() - qty);
            } else {
                throw new AppException("Loại giao dịch không hợp lệ", HttpStatus.BAD_REQUEST);
            }

            variantRepository.save(variant);
            syncProductStock(variant.getProduct());

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .variant(variant)
                    .supplier(supplier)
                    .type(request.getType())
                    .quantity(qty)
                    .unitCost(item.getUnitCost() != null ? item.getUnitCost() : variant.getCostPrice())
                    .note(request.getNote())
                    .createdBy(user)
                    .build();

            lastSavedTx = transactionRepository.save(transaction);
        }

        return mapToResponse(lastSavedTx);
    }

    @Override
    @Transactional
    public InventoryTransactionResponse adjustStock(InventoryAuditRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException("Biến thể sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        int currentStock = variant.getStockQuantity();
        int actualStock = request.getActualQuantity();
        int diff = actualStock - currentStock;

        if (diff == 0) {
            throw new AppException("Số lượng đếm thực tế trùng khớp với tồn kho sổ sách, không cần điều chỉnh", HttpStatus.BAD_REQUEST);
        }

        variant.setStockQuantity(actualStock);
        variantRepository.save(variant);

        syncProductStock(variant.getProduct());

        InventoryTransaction transaction = InventoryTransaction.builder()
                .variant(variant)
                .supplier(null)
                .type(TransactionType.ADJUSTMENT)
                .quantity(diff)
                .unitCost(variant.getCostPrice())
                .note(request.getNote() != null ? request.getNote() : "Điều chỉnh kiểm kê kho (Sổ sách: " + currentStock + " -> Thực tế: " + actualStock + ")")
                .createdBy(user)
                .build();

        InventoryTransaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse> searchTransactions(
            TransactionType type,
            Long supplierId,
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    ) {
        Page<InventoryTransaction> page = transactionRepository.searchTransactions(type, supplierId, keyword, fromDate, toDate, pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryTransactionResponse getTransactionById(Long transactionId) {
        InventoryTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException("Giao dịch kho không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryOverviewStatsResponse getOverviewStats() {
        List<ProductVariant> allVariants = variantRepository.findAll();
        long totalVariantsCount = allVariants.size();
        long totalInStockQuantity = allVariants.stream().mapToLong(ProductVariant::getStockQuantity).sum();

        BigDecimal totalInventoryValue = allVariants.stream()
                .map(v -> {
                    BigDecimal cost = (v.getCostPrice() != null && v.getCostPrice().compareTo(BigDecimal.ZERO) > 0)
                            ? v.getCostPrice()
                            : (v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO);
                    return cost.multiply(BigDecimal.valueOf(v.getStockQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long lowStockAlertCount = allVariants.stream().filter(v -> v.getStockQuantity() <= 5).count();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Long importInPeriod = transactionRepository.sumQuantityByTypeInPeriod(TransactionType.IMPORT, startOfMonth, LocalDateTime.now());
        Long exportInPeriod = transactionRepository.sumQuantityByTypeInPeriod(TransactionType.EXPORT, startOfMonth, LocalDateTime.now());

        return InventoryOverviewStatsResponse.builder()
                .totalVariantsCount(totalVariantsCount)
                .totalInStockQuantity(totalInStockQuantity)
                .totalInventoryValue(totalInventoryValue)
                .totalImportInPeriod(importInPeriod != null ? importInPeriod : 0L)
                .totalExportInPeriod(exportInPeriod != null ? exportInPeriod : 0L)
                .lowStockAlertCount(lowStockAlertCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LowStockVariantResponse> getLowStockVariants(Integer threshold, Pageable pageable) {
        int limit = (threshold != null && threshold > 0) ? threshold : 5;
        List<ProductVariant> allVariants = variantRepository.findAll();

        List<LowStockVariantResponse> lowStockList = allVariants.stream()
                .filter(v -> v.getStockQuantity() <= limit)
                .map(this::mapToLowStockResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), lowStockList.size());
        List<LowStockVariantResponse> subList = start <= end ? lowStockList.subList(start, end) : List.of();

        return new PageImpl<>(subList, pageable, lowStockList.size());
    }

    private void syncProductStock(Product product) {
        if (product == null) return;
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        int totalStock = variants.stream().mapToInt(ProductVariant::getStockQuantity).sum();

        product.setStock(totalStock);
        if (totalStock > 0 && "out_of_stock".equalsIgnoreCase(product.getStatus())) {
            product.setStatus("in_stock");
        } else if (totalStock == 0) {
            product.setStatus("out_of_stock");
        }
        productRepository.save(product);
    }

    private InventoryTransactionResponse mapToResponse(InventoryTransaction tx) {
        if (tx == null) return null;
        ProductVariant v = tx.getVariant();
        Product p = v != null ? v.getProduct() : null;
        Supplier s = tx.getSupplier();
        User u = tx.getCreatedBy();

        BigDecimal unitCost = tx.getUnitCost() != null ? tx.getUnitCost() : BigDecimal.ZERO;
        BigDecimal totalAmount = unitCost.multiply(BigDecimal.valueOf(tx.getQuantity()));

        String mainImage = null;
        if (p != null) {
            List<ProductImage> images = productImageRepository.findByProductId(p.getId());
            mainImage = images.stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImagePath)
                    .findFirst()
                    .orElseGet(() -> images.isEmpty() ? null : images.get(0).getImagePath());
        }

        String ticketNumber = String.format("TK-%s-%06d", tx.getType().name(), tx.getId());

        return InventoryTransactionResponse.builder()
                .id(tx.getId())
                .ticketNumber(ticketNumber)
                .variantId(v != null ? v.getId() : null)
                .variantSku(v != null ? v.getSku() : null)
                .variantSize(v != null ? v.getSize() : null)
                .variantColor(v != null ? v.getColor() : null)
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : null)
                .productSlug(p != null ? p.getSlug() : null)
                .productMainImage(mainImage)
                .supplierId(s != null ? s.getId() : null)
                .supplierName(s != null ? s.getName() : null)
                .supplierCode(s != null ? s.getCode() : null)
                .type(tx.getType())
                .quantity(tx.getQuantity())
                .unitCost(unitCost)
                .totalAmount(totalAmount)
                .note(tx.getNote())
                .createdByUserId(u != null ? u.getId() : null)
                .createdByUserName(u != null ? (u.getName() != null ? u.getName() : u.getEmail()) : null)
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private LowStockVariantResponse mapToLowStockResponse(ProductVariant v) {
        Product p = v.getProduct();
        String mainImage = null;
        if (p != null) {
            List<ProductImage> images = productImageRepository.findByProductId(p.getId());
            mainImage = images.stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImagePath)
                    .findFirst()
                    .orElseGet(() -> images.isEmpty() ? null : images.get(0).getImagePath());
        }

        return LowStockVariantResponse.builder()
                .variantId(v.getId())
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : null)
                .productSlug(p != null ? p.getSlug() : null)
                .mainImage(mainImage)
                .sku(v.getSku())
                .size(v.getSize())
                .color(v.getColor())
                .stockQuantity(v.getStockQuantity())
                .price(v.getPrice())
                .costPrice(v.getCostPrice())
                .status(p != null ? p.getStatus() : "in_stock")
                .build();
    }
}
