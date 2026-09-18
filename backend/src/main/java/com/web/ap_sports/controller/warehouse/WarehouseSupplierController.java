package com.web.ap_sports.controller.warehouse;

import com.web.ap_sports.dto.request.warehouse.SupplierRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.warehouse.SupplierResponse;
import com.web.ap_sports.service.warehouse.WarehouseSupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/warehouse/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('MANAGE_INVENTORY') or hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER')")
public class WarehouseSupplierController {

    private final WarehouseSupplierService supplierService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.ok(ApiResponse.success("Thêm nhà cung cấp mới thành công.", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nhà cung cấp thành công.", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhà cung cấp thành công."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable Long id) {
        SupplierResponse response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin nhà cung cấp thành công.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SupplierResponse>>> getAllSuppliers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<SupplierResponse> suppliers = supplierService.getAllSuppliers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhà cung cấp thành công.", suppliers));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliersList() {
        List<SupplierResponse> suppliers = supplierService.getAllSuppliersList();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách nhà cung cấp dạng list thành công.", suppliers));
    }
}
