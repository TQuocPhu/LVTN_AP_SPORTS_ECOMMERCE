package com.web.ap_sports.service.warehouse;

import com.web.ap_sports.dto.request.warehouse.CreateInventoryTransactionRequest;
import com.web.ap_sports.dto.request.warehouse.InventoryAuditRequest;
import com.web.ap_sports.dto.response.warehouse.InventoryOverviewStatsResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.dto.response.warehouse.LowStockVariantResponse;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface WarehouseInventoryService {

    InventoryTransactionResponse createTransaction(CreateInventoryTransactionRequest request, String userEmail);

    InventoryTransactionResponse adjustStock(InventoryAuditRequest request, String userEmail);

    Page<InventoryTransactionResponse> searchTransactions(
            TransactionType type,
            Long supplierId,
            String keyword,
            String fromDate,
            String toDate,
            Pageable pageable
    );

    InventoryTransactionResponse getTransactionById(Long transactionId);

    InventoryOverviewStatsResponse getOverviewStats();

    Page<LowStockVariantResponse> getLowStockVariants(Integer threshold, Pageable pageable);
}
