package com.web.ap_sports.service.warehouse.impl;

import com.web.ap_sports.dto.request.warehouse.SupplierRequest;
import com.web.ap_sports.dto.response.warehouse.SupplierResponse;
import com.web.ap_sports.entity.Supplier;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.SupplierRepository;
import com.web.ap_sports.service.warehouse.WarehouseSupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseSupplierServiceImpl implements WarehouseSupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode().trim())) {
            throw new AppException("Mã nhà cung cấp đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST);
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .code(request.getCode().trim().toUpperCase())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException("Nhà cung cấp không tồn tại", HttpStatus.NOT_FOUND));

        if (supplierRepository.existsByCodeAndIdNot(request.getCode().trim(), id)) {
            throw new AppException("Mã nhà cung cấp đã tồn tại ở nhà cung cấp khác", HttpStatus.BAD_REQUEST);
        }

        supplier.setName(request.getName().trim());
        supplier.setCode(request.getCode().trim().toUpperCase());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());

        Supplier updated = supplierRepository.save(supplier);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new AppException("Nhà cung cấp không tồn tại", HttpStatus.NOT_FOUND);
        }
        supplierRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException("Nhà cung cấp không tồn tại", HttpStatus.NOT_FOUND));
        return mapToResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> getAllSuppliers(String keyword, Pageable pageable) {
        Page<Supplier> page = supplierRepository.searchSuppliers(keyword, pageable);
        return page.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliersList() {
        return supplierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .code(supplier.getCode())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .build();
    }
}
