package com.web.ap_sports.service.warehouse;

import com.web.ap_sports.dto.request.warehouse.SupplierRequest;
import com.web.ap_sports.dto.response.warehouse.SupplierResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WarehouseSupplierService {

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse updateSupplier(Long id, SupplierRequest request);

    void deleteSupplier(Long id);

    SupplierResponse getSupplierById(Long id);

    Page<SupplierResponse> getAllSuppliers(String keyword, Pageable pageable);

    List<SupplierResponse> getAllSuppliersList();
}
