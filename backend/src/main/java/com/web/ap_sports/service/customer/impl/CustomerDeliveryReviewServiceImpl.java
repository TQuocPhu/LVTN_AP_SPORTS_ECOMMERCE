package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.CreateDeliveryReviewRequest;
import com.web.ap_sports.dto.response.customer.DeliveryReviewResponse;
import com.web.ap_sports.entity.DeliveryReview;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.DeliveryReviewRepository;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerDeliveryReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDeliveryReviewServiceImpl implements CustomerDeliveryReviewService {

    private final DeliveryReviewRepository deliveryReviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public DeliveryReviewResponse createDeliveryReview(
            String customerEmail,
            String orderCode,
            CreateDeliveryReviewRequest request) {

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin khách hàng", HttpStatus.NOT_FOUND));

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        // Kiểm tra chặt chẽ quyền sở hữu đơn hàng (Chống IDOR)
        if (order.getUser() == null || !order.getUser().getId().equals(customer.getId())) {
            throw new AppException("Bạn không có quyền đánh giá giao hàng cho đơn hàng này", HttpStatus.FORBIDDEN);
        }

        // Chỉ cho phép đánh giá giao hàng sau khi khách đã xác nhận nhận hàng (completed)
        if (order.getStatus() != OrderStatus.completed) {
            throw new AppException("Chỉ có thể đánh giá giao hàng sau khi xác nhận đã nhận được hàng", HttpStatus.BAD_REQUEST);
        }

        if (deliveryReviewRepository.existsByOrderId(order.getId())) {
            throw new AppException("Bạn đã đánh giá giao hàng cho đơn hàng này rồi", HttpStatus.CONFLICT);
        }

        String joinedTags = null;
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            joinedTags = request.getTags().stream()
                    .filter(StringUtils::hasText)
                    .map(String::trim)
                    .distinct()
                    .limit(8)
                    .collect(Collectors.joining(","));
        }

        DeliveryReview entity = DeliveryReview.builder()
                .order(order)
                .user(customer)
                .shipper(order.getAssignedShipper())
                .rating(request.getRating())
                .tags(joinedTags)
                .comment(StringUtils.hasText(request.getComment()) ? request.getComment().trim() : null)
                .status("approved")
                .build();

        DeliveryReview saved = deliveryReviewRepository.save(entity);
        return toCustomerResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryReviewResponse getDeliveryReviewByOrderCode(String customerEmail, String orderCode) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin khách hàng", HttpStatus.NOT_FOUND));

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        if (order.getUser() == null || !order.getUser().getId().equals(customer.getId())) {
            throw new AppException("Bạn không có quyền xem đánh giá của đơn hàng này", HttpStatus.FORBIDDEN);
        }

        return deliveryReviewRepository.findByOrderId(order.getId())
                .map(CustomerDeliveryReviewServiceImpl::toCustomerResponse)
                .orElse(null);
    }

    public static DeliveryReviewResponse toCustomerResponse(DeliveryReview dr) {
        if (dr == null) return null;
        Order order = dr.getOrder();
        User shipper = dr.getShipper();

        List<String> tagList = StringUtils.hasText(dr.getTags())
                ? Arrays.stream(dr.getTags().split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return DeliveryReviewResponse.builder()
                .id(dr.getId())
                .orderId(order != null ? order.getId() : null)
                .orderCode(order != null ? order.getOrderCode() : null)
                .shipperName(shipper != null ? shipper.getName() : null)
                .shipperPhone(shipper != null ? shipper.getPhoneNumber() : null)
                .shippingProvider(order != null ? order.getShippingProvider() : null)
                .trackingCode(order != null ? order.getTrackingCode() : null)
                .rating(dr.getRating())
                .tags(tagList)
                .comment(dr.getComment())
                .adminReply(dr.getAdminReply())
                .repliedByName(dr.getRepliedBy() != null ? dr.getRepliedBy().getName() : null)
                .repliedAt(dr.getRepliedAt())
                .status(dr.getStatus())
                .createdAt(dr.getCreatedAt())
                .build();
    }
}
