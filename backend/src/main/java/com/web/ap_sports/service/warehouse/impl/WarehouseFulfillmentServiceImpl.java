package com.web.ap_sports.service.warehouse.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.warehouse.VerifyOrderPackRequest;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminOrderService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.warehouse.WarehouseFulfillmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Triển khai nghiệp vụ kiểm đếm Barcode và đóng gói xuất kho đơn hàng (WMS Fulfillment).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseFulfillmentServiceImpl implements WarehouseFulfillmentService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private final AdminOrderService adminOrderService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public AdminOrderDetailResponse verifyOrderPack(Long orderId, VerifyOrderPackRequest request, String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new AppException("Nhân viên/Thủ kho không tồn tại", HttpStatus.NOT_FOUND));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng ID #" + orderId, HttpStatus.NOT_FOUND));

        if (order.getStatus() == OrderStatus.cancelled || order.getStatus() == OrderStatus.payment_failed) {
            throw new AppException("Đơn hàng đã bị hủy, không thể đóng gói xuất kho", HttpStatus.BAD_REQUEST);
        }

        if (order.getStatus() != OrderStatus.confirmed && order.getStatus() != OrderStatus.processing) {
            throw new AppException("Chỉ có thể kiểm đếm đóng gói cho đơn hàng ở trạng thái Đã Duyệt (confirmed) hoặc Đang Đóng Gói (processing)", HttpStatus.BAD_REQUEST);
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        if (orderItems == null || orderItems.isEmpty()) {
            throw new AppException("Đơn hàng không có mặt hàng nào để kiểm đếm", HttpStatus.BAD_REQUEST);
        }

        // Tạo Map số lượng đã quét theo variantId
        Map<Long, Integer> scannedMap = new HashMap<>();
        if (request.getScannedItems() != null) {
            for (VerifyOrderPackRequest.ScannedItem item : request.getScannedItems()) {
                if (item.getVariantId() != null && item.getScannedQuantity() != null) {
                    scannedMap.put(
                            item.getVariantId(),
                            scannedMap.getOrDefault(item.getVariantId(), 0) + item.getScannedQuantity()
                    );
                }
            }
        }

        // Kiểm tra khớp 100% từng dòng sản phẩm
        for (OrderItem item : orderItems) {
            Long vId = item.getVariant() != null ? item.getVariant().getId() : null;
            int required = item.getQuantity();
            int scanned = vId != null ? scannedMap.getOrDefault(vId, 0) : 0;

            String pName = item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm";
            String sku = item.getVariant() != null ? item.getVariant().getSku() : "";

            if (scanned != required) {
                throw new AppException(
                        "Kiểm đếm Barcode chưa đủ 100%: Sản phẩm [" + pName + " - SKU: " + sku + "] yêu cầu " + required + " sản phẩm, nhưng thực tế mới quét được " + scanned + " sản phẩm.",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        // Cập nhật trạng thái đã kiểm đếm thành công
        order.setPackVerified(true);
        order.setPackedBy(staff);
        order.setPackedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Ghi log lịch sử đóng gói
        String historyNote = "Thủ kho [" + staff.getName() + "] đã kiểm đếm Barcode 100% và đóng gói niêm phong thành công.";
        if (request.getNote() != null && !request.getNote().isBlank()) {
            historyNote += " Ghi chú: " + request.getNote().trim();
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(savedOrder.getStatus() != null ? savedOrder.getStatus().getValue() : OrderStatus.confirmed.getValue())
                .note(historyNote)
                .changedBy(staff)
                .build();
        orderStatusHistoryRepository.save(history);

        log.info("✅ Đơn hàng #{} đã được kiểm đếm Barcode 100% và niêm phong bởi thủ kho [{}]",
                savedOrder.getOrderCode(), staff.getEmail());

        // Bắn WebSocket thông báo tới Admin & Nhân viên bán hàng
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("orderCode", savedOrder.getOrderCode());
            payloadMap.put("staffName", staff.getName());
            payloadMap.put("content", "Đơn hàng #" + savedOrder.getOrderCode() + " đã được bộ phận kho kiểm đếm Barcode 100% và đóng gói niêm phong.");

            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "STAFF", "WAREHOUSE_MANAGER"),
                    staff.getId(),
                    NotificationActionType.ORDER_PACKED,
                    "/admin/orders",
                    payloadJson
            );
        } catch (Exception ex) {
            log.warn("Lỗi khi bắn WebSocket thông báo ORDER_PACKED: {}", ex.getMessage());
        }

        return adminOrderService.getAdminOrderById(savedOrder.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminOrderDetailResponse> getOrdersPendingPacking() {
        // Tìm các đơn hàng confirmed và chưa được packVerified (hoặc processing chưa pack)
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> (o.getStatus() == OrderStatus.confirmed || o.getStatus() == OrderStatus.processing)
                        && !Boolean.TRUE.equals(o.getPackVerified()))
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .collect(Collectors.toList());

        return orders.stream()
                .map(o -> adminOrderService.getAdminOrderById(o.getId()))
                .collect(Collectors.toList());
    }
}
