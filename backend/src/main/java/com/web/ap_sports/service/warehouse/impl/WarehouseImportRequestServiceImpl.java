package com.web.ap_sports.service.warehouse.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.warehouse.ApproveImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.RejectImportRequestDto;
import com.web.ap_sports.dto.response.warehouse.ImportRequestItemResponse;
import com.web.ap_sports.dto.response.warehouse.ImportRequestResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.ImportRequestStatus;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.customer.ProductRestockNotificationService;
import com.web.ap_sports.service.warehouse.WarehouseImportRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * Cài đặt nghiệp vụ xử lý Yêu Cầu Nhập Kho & Đồng bộ WebSocket realtime tới Quản lý kho
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseImportRequestServiceImpl implements WarehouseImportRequestService {

    private final ImportRequestRepository importRequestRepository;
    private final ImportRequestItemRepository importRequestItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final InventoryAlertService inventoryAlertService;
    private final ProductRestockNotificationService restockNotificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ImportRequestResponse> getImportRequests(ImportRequestStatus status, String search, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<ImportRequest> page;
        if (status != null && trimmedSearch != null) {
            page = importRequestRepository.searchWithStatusAndKeyword(status, trimmedSearch, pageable);
        } else if (status != null) {
            page = importRequestRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else if (trimmedSearch != null) {
            page = importRequestRepository.searchByKeyword(trimmedSearch, pageable);
        } else {
            page = importRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ImportRequestResponse getImportRequestById(Long id) {
        ImportRequest request = importRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy yêu cầu nhập kho ID: " + id, HttpStatus.NOT_FOUND));
        return mapToResponse(request);
    }

    @Override
    @Transactional
    public ImportRequestResponse createImportRequest(CreateImportRequestDto dto, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        if (currentUser.getRole() != null && "STAFF".equalsIgnoreCase(currentUser.getRole().getName())) {
            throw new AppException("Tài khoản Nhân viên (Staff) không có quyền tạo yêu cầu nhập kho!", HttpStatus.FORBIDDEN);
        }

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại với ID: " + dto.getProductId(), HttpStatus.NOT_FOUND));

        Supplier supplier = null;
        if (dto.getSupplierId() != null) {
            supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new AppException("Nhà cung cấp không tồn tại với ID: " + dto.getSupplierId(), HttpStatus.NOT_FOUND));
        }

        String code = generateImportRequestCode();

        ImportRequest request = ImportRequest.builder()
                .code(code)
                .product(product)
                .supplier(supplier)
                .status(ImportRequestStatus.PENDING)
                .requestedBy(currentUser)
                .note(dto.getNote())
                .build();

        List<ImportRequestItem> items = new ArrayList<>();
        int totalRequestedQty = 0;

        for (var itemDto : dto.getItems()) {
            ProductVariant variant = variantRepository.findById(itemDto.getVariantId())
                    .orElseThrow(() -> new AppException("Biến thể ID " + itemDto.getVariantId() + " không tồn tại", HttpStatus.BAD_REQUEST));

            ImportRequestItem item = ImportRequestItem.builder()
                    .importRequest(request)
                    .variant(variant)
                    .requestedQuantity(itemDto.getRequestedQuantity())
                    .expectedCostPrice(itemDto.getExpectedCostPrice() != null ? itemDto.getExpectedCostPrice() : variant.getCostPrice())
                    .build();

            items.add(item);
            totalRequestedQty += itemDto.getRequestedQuantity();
        }

        request.setItems(items);
        ImportRequest savedRequest = importRequestRepository.save(request);

        // Bắn WebSocket thông báo thời gian thực tới bộ phận Quản lý kho (WAREHOUSE_MANAGER & ADMIN)
        notifyWarehouseManagersNewRequest(savedRequest, currentUser, totalRequestedQty);

        log.info("Đã tạo Yêu cầu nhập kho [{}] cho sản phẩm [{}] bởi người dùng [{}]",
                savedRequest.getCode(), product.getName(), currentUser.getEmail());

        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional
    public ImportRequestResponse approveImportRequest(Long id, ApproveImportRequestDto dto, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        // Kiểm tra phân quyền: Chỉ ADMIN hoặc WAREHOUSE_MANAGER được duyệt
        boolean canApprove = currentUser.getRole() != null &&
                ("ADMIN".equalsIgnoreCase(currentUser.getRole().getName()) ||
                 "WAREHOUSE_MANAGER".equalsIgnoreCase(currentUser.getRole().getName()));

        if (!canApprove) {
            throw new AppException("Chỉ Quản lý kho hoặc Quản trị viên mới có quyền phê duyệt nhập kho!", HttpStatus.FORBIDDEN);
        }

        ImportRequest request = importRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy yêu cầu nhập kho ID: " + id, HttpStatus.NOT_FOUND));

        if (request.getStatus() != ImportRequestStatus.PENDING) {
            throw new AppException("Yêu cầu nhập kho này không ở trạng thái Chờ duyệt (Status hiện tại: " + request.getStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        // Validate và gán Nhà cung cấp cho Phiếu nhập kho chính thức
        Long supplierId = dto.getSupplierId() != null
                ? dto.getSupplierId()
                : (request.getSupplier() != null ? request.getSupplier().getId() : null);

        if (supplierId == null) {
            throw new AppException("Vui lòng chọn Nhà cung cấp để phê duyệt và lập phiếu nhập kho!", HttpStatus.BAD_REQUEST);
        }

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException("Nhà cung cấp đã chọn không tồn tại trên hệ thống (ID: " + supplierId + ")", HttpStatus.BAD_REQUEST));

        request.setSupplier(supplier);

        // Tạo mã phiếu nhập kho chính thức (PNK-yyyyMMdd-XXXX)
        String ticketCode = generateTicketCode(InventoryTransaction.TransactionType.IMPORT);
        request.setImportTicketCode(ticketCode);
        request.setApprovedBy(currentUser);
        request.setApprovedAt(LocalDateTime.now());
        request.setStatus(ImportRequestStatus.COMPLETED);

        if (dto.getNote() != null && !dto.getNote().isBlank()) {
            request.setNote((request.getNote() != null ? request.getNote() + " | Duyệt: " : "Duyệt: ") + dto.getNote().trim());
        }

        Map<Long, ApproveImportRequestDto.ApproveItemDto> approvalMap = dto.getItems().stream()
                .collect(Collectors.toMap(ApproveImportRequestDto.ApproveItemDto::getItemId, i -> i));

        int totalApprovedQuantity = 0;
        List<InventoryTransaction> transactions = new ArrayList<>();

        for (ImportRequestItem item : request.getItems()) {
            ApproveImportRequestDto.ApproveItemDto approvalDto = approvalMap.get(item.getId());
            int approvedQty = approvalDto != null && approvalDto.getApprovedQuantity() != null
                    ? approvalDto.getApprovedQuantity()
                    : item.getRequestedQuantity();

            BigDecimal actualCost = approvalDto != null && approvalDto.getActualCostPrice() != null
                    ? approvalDto.getActualCostPrice()
                    : item.getExpectedCostPrice();

            item.setApprovedQuantity(approvedQty);
            item.setActualCostPrice(actualCost);

            totalApprovedQuantity += approvedQty;

            if (approvedQty > 0) {
                ProductVariant variant = variantRepository.findByIdForUpdate(item.getVariant().getId())
                        .or(() -> variantRepository.findById(item.getVariant().getId()))
                        .orElseThrow(() -> new AppException("Biến thể ID " + item.getVariant().getId() + " không tồn tại", HttpStatus.NOT_FOUND));

                int oldStock = variant.getStockQuantity();
                variant.setStockQuantity(oldStock + approvedQty);

                if (actualCost != null && actualCost.compareTo(BigDecimal.ZERO) > 0) {
                    variant.setCostPrice(actualCost);
                }

                variantRepository.save(variant);

                // Ghi nhận chứng từ nhập kho chính thức
                InventoryTransaction tx = InventoryTransaction.builder()
                        .code(ticketCode)
                        .variant(variant)
                        .supplier(supplier)
                        .type(InventoryTransaction.TransactionType.IMPORT)
                        .quantity(approvedQty)
                        .unitCost(actualCost != null ? actualCost : BigDecimal.ZERO)
                        .note("Nhập kho theo yêu cầu " + request.getCode() + (dto.getNote() != null ? ": " + dto.getNote() : ""))
                        .createdBy(currentUser)
                        .build();

                transactions.add(transactionRepository.save(tx));

                // Báo cáo tồn kho & thông báo restock nếu hết hàng trước đó
                inventoryAlertService.checkAndAlert(variant, oldStock, variant.getStockQuantity());
                if (oldStock <= 0 && variant.getStockQuantity() > 0) {
                    restockNotificationService.notifySubscribersForRestockedVariant(variant.getId(), variant.getStockQuantity());
                }
            }
        }

        // Cập nhật tồn kho sản phẩm cha
        syncProductStock(request.getProduct());

        ImportRequest savedRequest = importRequestRepository.save(request);

        // Bắn WebSocket thông báo tới người tạo (Staff / Admin) biết yêu cầu đã được duyệt
        notifyRequesterApproved(savedRequest, currentUser, totalApprovedQuantity);

        log.info("Quản lý kho [{}] đã phê duyệt Yêu cầu nhập kho [{}] với {} mặt hàng, sinh phiếu nhập [{}]",
                currentUser.getEmail(), savedRequest.getCode(), transactions.size(), ticketCode);

        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional
    public ImportRequestResponse rejectImportRequest(Long id, RejectImportRequestDto dto, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        boolean canReject = currentUser.getRole() != null &&
                ("ADMIN".equalsIgnoreCase(currentUser.getRole().getName()) ||
                 "WAREHOUSE_MANAGER".equalsIgnoreCase(currentUser.getRole().getName()));

        if (!canReject) {
            throw new AppException("Chỉ Quản lý kho hoặc Quản trị viên mới có quyền từ chối yêu cầu nhập kho!", HttpStatus.FORBIDDEN);
        }

        ImportRequest request = importRequestRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy yêu cầu nhập kho ID: " + id, HttpStatus.NOT_FOUND));

        if (request.getStatus() != ImportRequestStatus.PENDING) {
            throw new AppException("Yêu cầu nhập kho này không ở trạng thái Chờ duyệt", HttpStatus.BAD_REQUEST);
        }

        request.setStatus(ImportRequestStatus.REJECTED);
        request.setRejectionReason(dto.getReason());
        request.setApprovedBy(currentUser);
        request.setApprovedAt(LocalDateTime.now());

        ImportRequest savedRequest = importRequestRepository.save(request);

        // Bắn WebSocket thông báo tới người tạo biết yêu cầu bị từ chối
        notifyRequesterRejected(savedRequest, currentUser, dto.getReason());

        log.info("Quản lý kho [{}] đã từ chối Yêu cầu nhập kho [{}] với lý do: {}",
                currentUser.getEmail(), savedRequest.getCode(), dto.getReason());

        return mapToResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingCount() {
        return importRequestRepository.countByStatus(ImportRequestStatus.PENDING);
    }

    // ==========================================
    // CÁC HÀM HỖ TRỢ THÔNG BÁO WEBSOCKET
    // ==========================================

    private void notifyWarehouseManagersNewRequest(ImportRequest request, User sender, int totalQty) {
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("requestCode", request.getCode());
            payloadMap.put("requestId", request.getId());
            payloadMap.put("productId", request.getProduct().getId());
            payloadMap.put("productName", request.getProduct().getName());
            payloadMap.put("senderName", sender.getName() != null ? sender.getName() : sender.getEmail());
            payloadMap.put("senderRole", sender.getRole() != null ? sender.getRole().getName() : "STAFF");
            payloadMap.put("variantCount", request.getItems().size());
            payloadMap.put("totalQuantity", totalQty);
            payloadMap.put("title", "Yêu cầu nhập kho mới: " + request.getCode());
            payloadMap.put("content", (sender.getName() != null ? sender.getName() : "Nhân viên") +
                    " vừa gửi yêu cầu nhập kho cho sản phẩm \"" + request.getProduct().getName() + "\" (" + totalQty + " cái).");

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            // Gửi tới tất cả Admin & Quản lý kho qua WebSocket cá nhân hóa và internal broadcast
            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "WAREHOUSE_MANAGER"),
                    sender.getId(),
                    NotificationActionType.IMPORT_REQUEST_CREATED,
                    "/admin/inventory/requests",
                    jsonPayload
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi WebSocket notification cho yêu cầu nhập kho mới", e);
        }
    }

    private void notifyRequesterApproved(ImportRequest request, User approver, int approvedQty) {
        try {
            if (request.getRequestedBy() == null) return;

            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("requestCode", request.getCode());
            payloadMap.put("requestId", request.getId());
            payloadMap.put("productId", request.getProduct().getId());
            payloadMap.put("productName", request.getProduct().getName());
            payloadMap.put("approverName", approver.getName() != null ? approver.getName() : approver.getEmail());
            payloadMap.put("importTicketCode", request.getImportTicketCode());
            payloadMap.put("totalApprovedQuantity", approvedQty);
            payloadMap.put("title", "Yêu cầu nhập kho đã được duyệt: " + request.getCode());
            payloadMap.put("content", "Yêu cầu nhập kho #" + request.getCode() + " cho sản phẩm \"" +
                    request.getProduct().getName() + "\" đã được Quản lý kho duyệt và nhập vào kho thành công.");

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            notificationService.sendToUser(
                    request.getRequestedBy().getId(),
                    approver.getId(),
                    NotificationActionType.IMPORT_REQUEST_APPROVED,
                    "/admin/inventory/requests",
                    jsonPayload
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi WebSocket notification duyệt yêu cầu nhập kho", e);
        }
    }

    private void notifyRequesterRejected(ImportRequest request, User rejector, String reason) {
        try {
            if (request.getRequestedBy() == null) return;

            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("requestCode", request.getCode());
            payloadMap.put("requestId", request.getId());
            payloadMap.put("productId", request.getProduct().getId());
            payloadMap.put("productName", request.getProduct().getName());
            payloadMap.put("rejectorName", rejector.getName() != null ? rejector.getName() : rejector.getEmail());
            payloadMap.put("reason", reason);
            payloadMap.put("title", "Yêu cầu nhập kho bị từ chối: " + request.getCode());
            payloadMap.put("content", "Yêu cầu nhập kho #" + request.getCode() + " đã bị từ chối. Lý do: " + reason);

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            notificationService.sendToUser(
                    request.getRequestedBy().getId(),
                    rejector.getId(),
                    NotificationActionType.IMPORT_REQUEST_REJECTED,
                    "/admin/inventory/requests",
                    jsonPayload
            );
        } catch (Exception e) {
            log.error("Lỗi khi gửi WebSocket notification từ chối yêu cầu nhập kho", e);
        }
    }

    // ==========================================
    // CÁC HÀM TIỆN ÍCH
    // ==========================================

    private void syncProductStock(Product product) {
        if (product == null) return;
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        int sumStock = variants.stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();

        product.setStock(sumStock);
        product.setStatus(sumStock > 0 ? "in_stock" : "out_of_stock");
        productRepository.save(product);
    }

    private String generateImportRequestCode() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
        String randomSuffix = String.format("%04d", ThreadLocalRandom.current().nextInt(1, 10000));
        String code = "YCNK-" + dateStr + "-" + randomSuffix;
        while (importRequestRepository.existsByCode(code)) {
            randomSuffix = String.format("%04d", ThreadLocalRandom.current().nextInt(1, 10000));
            code = "YCNK-" + dateStr + "-" + randomSuffix;
        }
        return code;
    }

    private String generateTicketCode(InventoryTransaction.TransactionType type) {
        String prefix = type == InventoryTransaction.TransactionType.IMPORT ? "PNK" : "PXK";
        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomSuffix = String.format("%04d", ThreadLocalRandom.current().nextInt(1, 10000));
        return prefix + "-" + dateStr + "-" + randomSuffix;
    }

    private String resolveVariantDisplayName(ProductVariant v) {
        if (v == null) return "Biến thể không xác định";
        if (v.getAttributes() != null && !v.getAttributes().isBlank()) {
            try {
                // Thử parse nếu là JSON Map
                if (v.getAttributes().trim().startsWith("{")) {
                    Map<String, Object> map = objectMapper.readValue(v.getAttributes(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    List<String> entries = new ArrayList<>();
                    for (Map.Entry<String, Object> entry : map.entrySet()) {
                        entries.add(entry.getKey() + ": " + entry.getValue());
                    }
                    if (!entries.isEmpty()) {
                        return String.join(" | ", entries);
                    }
                }
            } catch (Exception ignored) {}
            return v.getAttributes().trim();
        }

        List<String> parts = new ArrayList<>();
        if (v.getColor() != null && !v.getColor().isBlank()) parts.add("Màu: " + v.getColor());
        if (v.getSize() != null && !v.getSize().isBlank()) parts.add("Size: " + v.getSize());
        return !parts.isEmpty() ? String.join(" | ", parts) : v.getSku();
    }

    private ImportRequestResponse mapToResponse(ImportRequest r) {
        Product p = r.getProduct();
        String computedMainImage = null;
        if (p != null) {
            List<ProductImage> images = productImageRepository.findByProductId(p.getId());
            computedMainImage = images.stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImagePath)
                    .findFirst()
                    .orElseGet(() -> images.isEmpty() ? null : images.get(0).getImagePath());
        }
        final String mainImage = computedMainImage;

        List<ImportRequestItemResponse> itemResponses = r.getItems().stream().map(item -> {
            ProductVariant v = item.getVariant();
            String variantImg = null;
            if (v != null && v.getImages() != null && !v.getImages().isEmpty()) {
                variantImg = v.getImages().get(0).getImagePath();
            } else {
                variantImg = mainImage;
            }

            return ImportRequestItemResponse.builder()
                    .id(item.getId())
                    .variantId(v != null ? v.getId() : null)
                    .sku(v != null ? v.getSku() : null)
                    .barcode(v != null ? v.getBarcode() : null)
                    .attributes(v != null ? v.getAttributes() : null)
                    .variantName(resolveVariantDisplayName(v))
                    .color(v != null ? v.getColor() : null)
                    .size(v != null ? v.getSize() : null)
                    .image(variantImg)
                    .currentStock(v != null ? v.getStockQuantity() : 0)
                    .requestedQuantity(item.getRequestedQuantity())
                    .approvedQuantity(item.getApprovedQuantity())
                    .expectedCostPrice(item.getExpectedCostPrice())
                    .actualCostPrice(item.getActualCostPrice())
                    .build();
        }).collect(Collectors.toList());

        int totalReq = r.getItems().stream()
                .mapToInt(i -> i.getRequestedQuantity() != null ? i.getRequestedQuantity() : 0)
                .sum();

        int totalApp = r.getItems().stream()
                .mapToInt(i -> i.getApprovedQuantity() != null ? i.getApprovedQuantity() : 0)
                .sum();

        User reqUser = r.getRequestedBy();
        User appUser = r.getApprovedBy();

        return ImportRequestResponse.builder()
                .id(r.getId())
                .code(r.getCode())
                .productId(p != null ? p.getId() : null)
                .productName(p != null ? p.getName() : null)
                .productMainImage(mainImage)
                .supplierId(r.getSupplier() != null ? r.getSupplier().getId() : null)
                .supplierName(r.getSupplier() != null ? r.getSupplier().getName() : null)
                .status(r.getStatus())
                .requestedByUserId(reqUser != null ? reqUser.getId() : null)
                .requestedByUserName(reqUser != null ? (reqUser.getName() != null ? reqUser.getName() : reqUser.getEmail()) : null)
                .requestedByUserEmail(reqUser != null ? reqUser.getEmail() : null)
                .requestedByUserRole(reqUser != null && reqUser.getRole() != null ? reqUser.getRole().getName() : null)
                .approvedByUserId(appUser != null ? appUser.getId() : null)
                .approvedByUserName(appUser != null ? (appUser.getName() != null ? appUser.getName() : appUser.getEmail()) : null)
                .note(r.getNote())
                .rejectionReason(r.getRejectionReason())
                .importTicketCode(r.getImportTicketCode())
                .totalRequestedQuantity(totalReq)
                .totalApprovedQuantity(totalApp)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .approvedAt(r.getApprovedAt())
                .items(itemResponses)
                .build();
    }
}
