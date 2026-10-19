package com.web.ap_sports.service.customer.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.support.RegisterRestockNotificationRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.RestockNotificationResponse;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductRestockNotification;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductRestockNotificationRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.customer.ProductRestockNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Lớp triển khai nghiệp vụ đăng ký và phát thông báo khi sản phẩm/biến thể về kho.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRestockNotificationServiceImpl implements ProductRestockNotificationService {

    private final ProductRestockNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository productImageRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public RestockNotificationResponse registerNotification(Long userId, RegisterRestockNotificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException("Biến thể sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        Product product = variant.getProduct();
        if (product == null) {
            throw new AppException("Sản phẩm liên kết không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra nếu sản phẩm đã ngừng kinh doanh vĩnh viễn (discontinued)
        if (product.getStatus() != null && "discontinued".equalsIgnoreCase(product.getStatus())) {
            throw new AppException("Sản phẩm đã ngừng kinh doanh hoàn toàn, không thể đăng ký nhận tin về hàng", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra nếu biến thể này vẫn còn hàng trong kho
        if (variant.getStockQuantity() != null && variant.getStockQuantity() > 0) {
            throw new AppException("Biến thể này hiện đang còn hàng trong kho, bạn có thể đặt mua ngay!", HttpStatus.BAD_REQUEST);
        }

        // Lấy email ưu tiên: nếu request có email thì lấy, ngược lại lấy từ User
        String effectiveEmail = request.getEffectiveEmail();
        String targetEmail = (effectiveEmail != null && !effectiveEmail.isBlank())
                ? effectiveEmail.trim()
                : user.getEmail();

        // Kiểm tra xem đã có bản ghi PENDING chưa
        Optional<ProductRestockNotification> existingPending = notificationRepository.findByUserIdAndVariantIdAndStatus(
                userId, variant.getId(), ProductRestockNotification.Status.PENDING
        );

        ProductRestockNotification notification;
        String resultMessage;
        if (existingPending.isPresent()) {
            notification = existingPending.get();
            notification.setEmail(targetEmail);
            notification = notificationRepository.save(notification);
            resultMessage = "Bạn đã đăng ký nhận thông báo cho biến thể này trước đó rồi.";
        } else {
            notification = ProductRestockNotification.builder()
                    .user(user)
                    .product(product)
                    .variant(variant)
                    .email(targetEmail)
                    .status(ProductRestockNotification.Status.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();
            notification = notificationRepository.save(notification);
            resultMessage = "Đăng ký nhận thông báo thành công! Chúng tôi sẽ gửi email và thông báo khi hàng về kho.";
        }

        String variantAttributes = buildVariantAttributeText(variant);

        return RestockNotificationResponse.builder()
                .id(notification.getId())
                .userId(user.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .variantId(variant.getId())
                .variantName(variantAttributes)
                .sku(variant.getSku())
                .size(variant.getSize())
                .color(variant.getColor())
                .email(notification.getEmail())
                .status(notification.getStatus().name())
                .createdAt(notification.getCreatedAt())
                .message(resultMessage)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> cancelNotification(Long userId, Long variantId) {
        Optional<ProductRestockNotification> pendingOpt = notificationRepository.findByUserIdAndVariantIdAndStatus(
                userId, variantId, ProductRestockNotification.Status.PENDING
        );

        if (pendingOpt.isPresent()) {
            ProductRestockNotification notification = pendingOpt.get();
            notification.setStatus(ProductRestockNotification.Status.CANCELLED);
            notificationRepository.save(notification);
            return ApiResponse.success("Đã hủy đăng ký nhận thông báo cho biến thể này thành công");
        }

        return ApiResponse.success("Không tìm thấy yêu cầu nhận tin đang chờ để hủy");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubscribed(Long userId, Long variantId) {
        if (userId == null || variantId == null) return false;
        return notificationRepository.existsByUserIdAndVariantIdAndStatus(
                userId, variantId, ProductRestockNotification.Status.PENDING
        );
    }

    @Override
    @Async
    @Transactional
    public void notifySubscribersForRestockedVariant(Long variantId, int newQuantity) {
        if (newQuantity <= 0) {
            return;
        }

        List<ProductRestockNotification> pendingSubscribers = notificationRepository.findByVariantIdAndStatusWithDetails(
                variantId, ProductRestockNotification.Status.PENDING
        );

        if (pendingSubscribers == null || pendingSubscribers.isEmpty()) {
            return;
        }

        log.info("⚡ Tìm thấy {} khách hàng đang chờ biến thể variantId={}. Tiến hành gửi thông báo Restock Alert...",
                pendingSubscribers.size(), variantId);

        for (ProductRestockNotification sub : pendingSubscribers) {
            try {
                Product product = sub.getProduct();
                ProductVariant variant = sub.getVariant();
                User user = sub.getUser();

                String variantInfo = buildVariantAttributeText(variant);
                String priceFormatted = variant.getPrice() != null
                        ? String.format("%,d", variant.getPrice().longValue()).replace(',', '.')
                        : "0";

                // Tìm ảnh đại diện từ variant hoặc product
                String imageUrl = null;
                List<ProductImage> variantImages = productImageRepository.findByVariantId(variant.getId());
                if (!variantImages.isEmpty()) {
                    imageUrl = variantImages.get(0).getImagePath();
                } else {
                    Optional<ProductImage> primaryImg = productImageRepository.findFirstByProductIdAndIsPrimaryTrue(product.getId());
                    if (primaryImg.isPresent()) {
                        imageUrl = primaryImg.get().getImagePath();
                    } else {
                        List<ProductImage> productImages = productImageRepository.findByProductId(product.getId());
                        if (!productImages.isEmpty()) {
                            imageUrl = productImages.get(0).getImagePath();
                        }
                    }
                }

                // 1. Gửi Email thông báo HTML cao cấp
                emailService.sendRestockAlertEmail(
                        sub.getEmail(),
                        user.getName() != null ? user.getName() : "Quý khách",
                        product.getName(),
                        variantInfo,
                        product.getSlug(),
                        priceFormatted,
                        imageUrl
                );

                // 2. Gửi WebSocket STOMP Notification tới Header chuông thông báo của User
                Map<String, Object> payloadMap = new HashMap<>();
                payloadMap.put("productName", product.getName());
                payloadMap.put("variantInfo", variantInfo);
                payloadMap.put("productSlug", product.getSlug());
                payloadMap.put("content", "Sản phẩm " + product.getName() + " (" + variantInfo + ") bạn quan tâm vừa có hàng trở lại tại kho!");

                String payloadJson = objectMapper.writeValueAsString(payloadMap);
                notificationService.sendToUser(
                        user.getId(),
                        null,
                        NotificationActionType.PRODUCT_RESTOCKED,
                        "/products/" + product.getSlug(),
                        payloadJson
                );

                // 3. Đánh dấu trạng thái đã thông báo
                sub.setStatus(ProductRestockNotification.Status.NOTIFIED);
                sub.setNotifiedAt(LocalDateTime.now());
                notificationRepository.save(sub);

            } catch (Exception ex) {
                log.error("Lỗi khi gửi thông báo Restock Alert cho userId={}: {}", sub.getUser().getId(), ex.getMessage(), ex);
            }
        }
    }

    private String buildVariantAttributeText(ProductVariant variant) {
        StringBuilder sb = new StringBuilder();
        if (variant.getColor() != null && !variant.getColor().isBlank()) {
            sb.append("Màu: ").append(variant.getColor().trim());
        }
        if (variant.getSize() != null && !variant.getSize().isBlank()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append("Size: ").append(variant.getSize().trim());
        }
        if (sb.length() == 0 && variant.getAttributes() != null && !variant.getAttributes().isBlank()) {
            sb.append(variant.getAttributes());
        }
        return sb.length() > 0 ? sb.toString() : "Tiêu chuẩn";
    }
}
