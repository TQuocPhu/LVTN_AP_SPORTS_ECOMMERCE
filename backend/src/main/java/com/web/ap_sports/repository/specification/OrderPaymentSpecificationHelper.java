package com.web.ap_sports.repository.specification;

import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.Payment;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Helper dựng điều kiện lọc theo Phương thức thanh toán (PaymentMethod) và Trạng thái thanh toán (PaymentStatus)
 * thông qua Subquery trên bảng payments, đảm bảo dùng chung giữa AdminOrderService và CustomerOrderService
 * mà không làm nhân bản dòng kết quả khi phân trang Page<Order>.
 */
public final class OrderPaymentSpecificationHelper {

    private OrderPaymentSpecificationHelper() {
    }

    /**
     * Tạo Predicate kiểm tra tồn tại bản ghi Payment khớp paymentMethod và/hoặc paymentStatus.
     * Trả về Optional.empty() nếu cả hai tham số đều null/blank/"ALL" hoặc không hợp lệ.
     */
    public static Optional<Predicate> buildPaymentPredicate(
            Root<Order> orderRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            String paymentMethod,
            String paymentStatus
    ) {
        if (query == null) {
            return Optional.empty();
        }

        Payment.PaymentMethod parsedMethod = parsePaymentMethod(paymentMethod);
        Payment.PaymentStatus parsedStatus = parsePaymentStatus(paymentStatus);

        if (parsedMethod == null && parsedStatus == null) {
            return Optional.empty();
        }

        Subquery<Long> paymentSubquery = query.subquery(Long.class);
        Root<Payment> paymentRoot = paymentSubquery.from(Payment.class);

        List<Predicate> subPredicates = new ArrayList<>();
        subPredicates.add(cb.equal(paymentRoot.get("order").get("id"), orderRoot.get("id")));

        if (parsedMethod != null) {
            subPredicates.add(cb.equal(paymentRoot.get("paymentMethod"), parsedMethod));
        }
        if (parsedStatus != null) {
            subPredicates.add(cb.equal(paymentRoot.get("status"), parsedStatus));
        }

        paymentSubquery.select(paymentRoot.get("id")).where(subPredicates.toArray(new Predicate[0]));
        Predicate existsMatchingPayment = cb.exists(paymentSubquery);

        // Các đơn hàng cũ/seed chưa có bản ghi trong bảng payments được hệ thống mặc định là COD (cash) + pending
        boolean matchesDefaultMethod = (parsedMethod == null || parsedMethod == Payment.PaymentMethod.cash);
        boolean matchesDefaultStatus = (parsedStatus == null || parsedStatus == Payment.PaymentStatus.pending);
        if (matchesDefaultMethod && matchesDefaultStatus) {
            Subquery<Long> anyPaymentSubquery = query.subquery(Long.class);
            Root<Payment> anyPaymentRoot = anyPaymentSubquery.from(Payment.class);
            anyPaymentSubquery.select(anyPaymentRoot.get("id"))
                    .where(cb.equal(anyPaymentRoot.get("order").get("id"), orderRoot.get("id")));
            return Optional.of(cb.or(existsMatchingPayment, cb.not(cb.exists(anyPaymentSubquery))));
        }

        return Optional.of(existsMatchingPayment);
    }

    private static Payment.PaymentMethod parsePaymentMethod(String raw) {
        if (raw == null || raw.isBlank() || "ALL".equalsIgnoreCase(raw.trim())) {
            return null;
        }
        String normalized = raw.trim().toLowerCase();
        if ("cod".equals(normalized) || "cash".equals(normalized)) {
            return Payment.PaymentMethod.cash;
        }
        try {
            return Payment.PaymentMethod.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static Payment.PaymentStatus parsePaymentStatus(String raw) {
        if (raw == null || raw.isBlank() || "ALL".equalsIgnoreCase(raw.trim())) {
            return null;
        }
        try {
            return Payment.PaymentStatus.valueOf(raw.trim().toLowerCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
