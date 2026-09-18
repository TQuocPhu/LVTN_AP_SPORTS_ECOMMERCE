package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.request.warehouse.CreateInventoryTransactionRequest;
import com.web.ap_sports.dto.request.warehouse.InventoryAuditRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryOverviewStatsResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.dto.response.warehouse.LowStockVariantResponse;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.service.warehouse.WarehouseInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/warehouse/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_INVENTORY') or hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER')")
public class WarehouseInventoryController {

    private final WarehouseInventoryService inventoryService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<InventoryOverviewStatsResponse>> getOverviewStats() {
        InventoryOverviewStatsResponse stats = inventoryService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo tổng quan kho thành công.", stats));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<InventoryTransactionResponse>>> searchTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<InventoryTransactionResponse> result = inventoryService.searchTransactions(type, supplierId, keyword, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy nhật ký giao dịch kho thành công.", result));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> getTransactionById(@PathVariable Long id) {
        InventoryTransactionResponse response = inventoryService.getTransactionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết phiếu kho thành công.", response));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> createImport(
            Authentication authentication,
            @Valid @RequestBody CreateInventoryTransactionRequest request) {
        request.setType(TransactionType.IMPORT);
        InventoryTransactionResponse response = inventoryService.createTransaction(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lập phiếu nhập kho thành công.", response));
    }

    @PostMapping("/export")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> createExport(
            Authentication authentication,
            @Valid @RequestBody CreateInventoryTransactionRequest request) {
        request.setType(TransactionType.EXPORT);
        InventoryTransactionResponse response = inventoryService.createTransaction(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lập phiếu xuất kho thành công.", response));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> adjustStock(
            Authentication authentication,
            @Valid @RequestBody InventoryAuditRequest request) {
        InventoryTransactionResponse response = inventoryService.adjustStock(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Kiểm kê điều chỉnh tồn kho thành công.", response));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<Page<LowStockVariantResponse>>> getLowStockVariants(
            @RequestParam(defaultValue = "5") Integer threshold,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LowStockVariantResponse> result = inventoryService.getLowStockVariants(threshold, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách biến thể tồn kho thấp thành công.", result));
    }
}
