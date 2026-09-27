package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.ApplyVoucherRequest;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.dto.response.customer.VoucherApplyResponse;
import com.web.ap_sports.entity.Coupon;
import com.web.ap_sports.entity.Coupon.CouponType;
import com.web.ap_sports.repository.CouponRepository;
import com.web.ap_sports.service.customer.CustomerVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Lớp triển khai Service nghiệp vụ xử lý Voucher phía khách hàng (Customer Portal & Checkout).
 * Cung cấp tính năng lấy kho voucher Shopee-style và tính toán số tiền giảm khi thanh toán.
 */
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerVoucherServiceImpl implements CustomerVoucherService {

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách voucher công khai đang khả dụng trên trang /vouchers.
     * Chỉ lấy các voucher:
     * 1. isActive = true
     * 2. Chưa hết hạn (expiresAt > LocalDateTime.now())
     * 3. Lọc theo categoryScope nếu người dùng chọn tab cụ thể (ALL, FREESHIP, FASHION, ...)
     *
     * @param categoryScope Phân loại áp dụng (ALL, FREESHIP, FASHION...)
     * @return Danh sách DTO VoucherResponse chuẩn hoá thông tin hiển thị UI
     */
    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getPublicVouchers(String categoryScope) {
        log.info("Khách hàng truy vấn danh sách kho voucher công khai với categoryScope: {}", categoryScope);
        
        List<Coupon> coupons;
        if (categoryScope == null || categoryScope.trim().isEmpty() || "ALL".equalsIgnoreCase(categoryScope.trim())) {
            coupons = couponRepository.findByIsActiveTrue();
        } else {
            coupons = couponRepository.findByIsActiveTrueAndCategoryScope(categoryScope.trim().toUpperCase());
        }

        LocalDateTime now = LocalDateTime.now();

        return coupons.stream()
                .filter(c -> c.getExpiresAt() == null || c.getExpiresAt().isAfter(now))
                .map(VoucherResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra điều kiện và tính toán số tiền giảm giá chính xác cho đơn hàng.
     * Hỗ trợ các loại voucher:
     * - PERCENT: Phần trăm giảm giá (có áp dụng mức giảm tối đa maxDiscountAmount nếu có)
     * - FIXED: Giảm giá tiền cố định trực tiếp vào đơn hàng
     * - FREESHIP: Giảm phí vận chuyển (tối đa bằng phí vận chuyển thực tế hoặc maxDiscountAmount)
     *
     * @param request Thông tin mã giảm giá, tổng tiền hàng (orderAmount) và phí ship (shippingFee)
     * @return Kết quả tính toán giảm giá kèm thông báo lỗi cụ thể nếu không hợp lệ
     */
    @Override
    @Transactional(readOnly = true)
    public VoucherApplyResponse calculateVoucherDiscount(ApplyVoucherRequest request) {
        if (request == null || request.getCode() == null || request.getCode().trim().isEmpty()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .message("Mã giảm giá không được để trống!")
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request != null && request.getOrderAmount() != null ? request.getOrderAmount() : BigDecimal.ZERO)
                    .build();
        }

        String code = request.getCode().trim().toUpperCase();
        BigDecimal orderAmount = request.getOrderAmount() != null ? request.getOrderAmount() : BigDecimal.ZERO;
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;

        log.info("Tính toán áp dụng voucher mã [{}] cho đơn hàng giá trị {} VNĐ, phí ship {} VNĐ", code, orderAmount, shippingFee);

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code);

        // 1. Kiểm tra voucher có tồn tại không
        if (couponOpt.isEmpty()) {
            return buildInvalidResponse("Mã giảm giá [" + code + "] không tồn tại trên hệ thống.", orderAmount);
        }

        Coupon coupon = couponOpt.get();
        LocalDateTime now = LocalDateTime.now();

        // 2. Kiểm tra trạng thái kích hoạt của voucher
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            return buildInvalidResponse("Mã giảm giá này hiện đã bị tạm dừng hoặc không còn hoạt động.", orderAmount);
        }

        // 3. Kiểm tra ngày bắt đầu hiệu lực (startsAt)
        if (coupon.getStartsAt() != null && coupon.getStartsAt().isAfter(now)) {
            return buildInvalidResponse("Mã giảm giá chưa đến thời gian sử dụng (bắt đầu từ " + coupon.getStartsAt() + ").", orderAmount);
        }

        // 4. Kiểm tra ngày hết hạn (expiresAt)
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
            return buildInvalidResponse("Mã giảm giá này đã hết hạn sử dụng.", orderAmount);
        }

        // 5. Kiểm tra giới hạn số lần sử dụng của toàn hệ thống (usageLimit)
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return buildInvalidResponse("Mã giảm giá này đã hết lượt sử dụng.", orderAmount);
        }

        // 5b. Kiểm tra giới hạn số lần sử dụng theo từng tài khoản (userUsageLimit)
        if (coupon.getUserUsageLimit() != null && coupon.getUserUsageLimit() > 0) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                userRepository.findByEmail(auth.getName()).ifPresent(u -> {
                    long userUsedCount = orderRepository.countByUserIdAndCouponIdAndStatusNotIn(
                            u.getId(), coupon.getId(), List.of(OrderStatus.cancelled, OrderStatus.payment_failed)
                    );
                    if (userUsedCount >= coupon.getUserUsageLimit()) {
                        throw new com.web.ap_sports.exception.AppException(
                                "Tài khoản của bạn đã sử dụng hết lượt (" + coupon.getUserUsageLimit() + " lần) của mã giảm giá này.",
                                org.springframework.http.HttpStatus.BAD_REQUEST
                        );
                    }
                });
            }
        }

        // 6. Kiểm tra giá trị đơn hàng tối thiểu (minOrderValue)
        if (coupon.getMinOrderValue() != null && orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            return buildInvalidResponse(
                    String.format("Đơn hàng tối thiểu phải từ %,d VNĐ để áp dụng mã giảm giá này.", coupon.getMinOrderValue().longValue()),
                    orderAmount
            );
        }

        // 7. Tính toán số tiền được giảm giá theo từng loại VoucherType
        BigDecimal discount = BigDecimal.ZERO;
        CouponType type = coupon.getType();

        if (type == CouponType.PERCENT) {
            // Giảm theo phần trăm: orderAmount * (value / 100)
            BigDecimal percentRatio = coupon.getValue().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            discount = orderAmount.multiply(percentRatio).setScale(2, RoundingMode.HALF_UP);

            // Áp mức giảm tối đa nếu có thiết lập maxDiscountAmount
            if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                if (discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discount = coupon.getMaxDiscountAmount();
                }
            }
        } else if (type == CouponType.FIXED) {
            // Giảm số tiền cố định trực tiếp vào đơn hàng
            discount = coupon.getValue();
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount; // Không được giảm quá tổng tiền hàng
            }
        } else if (type == CouponType.FREESHIP) {
            // Giảm phí vận chuyển
            discount = coupon.getValue();
            if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(coupon.getMaxDiscountAmount());
            }
            discount = discount.min(shippingFee); // Giảm tối đa bằng phí ship thực tế
        }

        // 8. Tính số tiền thanh toán cuối cùng
        BigDecimal finalAmount = orderAmount.subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        log.info("Áp dụng thành công mã voucher [{}]: Số tiền giảm = {} VNĐ, Tổng thanh toán = {} VNĐ", code, discount, finalAmount);

        return VoucherApplyResponse.builder()
                .valid(true)
                .message("Áp dụng mã giảm giá thành công!")
                .couponCode(coupon.getCode())
                .couponName(coupon.getName())
                .discountType(type.name())
                .discountValue(coupon.getValue())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .voucher(VoucherResponse.fromEntity(coupon))
                .build();
    }

    /**
     * Helper tạo response khi mã giảm giá không hợp lệ.
     */
    private VoucherApplyResponse buildInvalidResponse(String message, BigDecimal orderAmount) {
        return VoucherApplyResponse.builder()
                .valid(false)
                .message(message)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(orderAmount != null ? orderAmount : BigDecimal.ZERO)
                .build();
    }
}
