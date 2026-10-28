package com.web.ap_sports.service.warehouse;

import com.web.ap_sports.dto.request.warehouse.ApproveImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.RejectImportRequestDto;
import com.web.ap_sports.dto.response.warehouse.ImportRequestResponse;
import com.web.ap_sports.enums.ImportRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service quản lý nghiệp vụ Yêu Cầu Nhập Kho (Import Request)
 */
public interface WarehouseImportRequestService {

    /**
     * Lấy danh sách yêu cầu nhập kho có phân trang và lọc theo trạng thái/từ khóa
     */
    Page<ImportRequestResponse> getImportRequests(ImportRequestStatus status, String search, Pageable pageable);

    /**
     * Lấy chi tiết một yêu cầu nhập kho theo ID
     */
    ImportRequestResponse getImportRequestById(Long id);

    /**
     * Tạo yêu cầu nhập kho mới từ Staff hoặc Admin (sản phẩm đã tạo trên hệ thống)
     */
    ImportRequestResponse createImportRequest(CreateImportRequestDto dto, String currentUserEmail);

    /**
     * Quản lý kho duyệt yêu cầu nhập kho, kiểm đếm thực tế và cập nhật tồn kho
     */
    ImportRequestResponse approveImportRequest(Long id, ApproveImportRequestDto dto, String currentUserEmail);

    /**
     * Quản lý kho từ chối yêu cầu nhập kho kèm lý do cụ thể
     */
    ImportRequestResponse rejectImportRequest(Long id, RejectImportRequestDto dto, String currentUserEmail);

    /**
     * Đếm số lượng yêu cầu nhập kho đang chờ duyệt
     */
    long getPendingCount();
}
