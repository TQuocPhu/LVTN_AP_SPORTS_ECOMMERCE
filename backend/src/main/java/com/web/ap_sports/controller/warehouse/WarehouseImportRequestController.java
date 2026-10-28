package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.request.warehouse.ApproveImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.RejectImportRequestDto;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.warehouse.ImportRequestResponse;
import com.web.ap_sports.enums.ImportRequestStatus;
import com.web.ap_sports.service.warehouse.WarehouseImportRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller tiếp nhận và xử lý Phiếu Yêu Cầu Nhập Kho
 */
@RestController
@RequestMapping("/api/v1/warehouse/import-requests")
@RequiredArgsConstructor
public class WarehouseImportRequestController {

    private final WarehouseImportRequestService importRequestService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<Page<ImportRequestResponse>>> getImportRequests(
            @RequestParam(required = false) ImportRequestStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ImportRequestResponse> result = importRequestService.getImportRequests(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu nhập kho thành công.", result));
    }

    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        long count = importRequestService.getPendingCount();
        return ResponseEntity.ok(ApiResponse.success("Lấy số lượng yêu cầu chờ duyệt thành công.", count));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<ImportRequestResponse>> getImportRequestById(@PathVariable Long id) {
        ImportRequestResponse response = importRequestService.getImportRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết yêu cầu nhập kho thành công.", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<ImportRequestResponse>> createImportRequest(
            @Valid @RequestBody CreateImportRequestDto dto,
            Authentication authentication
    ) {
        ImportRequestResponse response = importRequestService.createImportRequest(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu nhập kho thành công. Quản lý kho đã nhận được thông báo thời gian thực.", response));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<ImportRequestResponse>> approveImportRequest(
            @PathVariable Long id,
            @Valid @RequestBody ApproveImportRequestDto dto,
            Authentication authentication
    ) {
        ImportRequestResponse response = importRequestService.approveImportRequest(id, dto, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Phê duyệt và nhập kho hàng hóa thành công.", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER') or hasAuthority('MANAGE_INVENTORY')")
    public ResponseEntity<ApiResponse<ImportRequestResponse>> rejectImportRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectImportRequestDto dto,
            Authentication authentication
    ) {
        ImportRequestResponse response = importRequestService.rejectImportRequest(id, dto, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Từ chối yêu cầu nhập kho thành công.", response));
    }
}
