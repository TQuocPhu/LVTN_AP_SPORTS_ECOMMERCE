package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.AdminDeliveryReviewFilterRequest;
import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewResponse;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewSummaryResponse;
import com.web.ap_sports.entity.DeliveryReview;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.DeliveryReviewRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminDeliveryReviewService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDeliveryReviewServiceImpl implements AdminDeliveryReviewService {

    private final DeliveryReviewRepository deliveryReviewRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminDeliveryReviewResponse> getDeliveryReviews(AdminDeliveryReviewFilterRequest filter) {
        int page = filter.getPage() != null && filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSize() != null && filter.getSize() > 0 ? Math.min(filter.getSize(), 100) : 10;

        Specification<DeliveryReview> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getKeyword())) {
                String kw = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                Join<DeliveryReview, Order> orderJoin = root.join("order", JoinType.LEFT);
                Join<DeliveryReview, User> userJoin = root.join("user", JoinType.LEFT);
                Join<DeliveryReview, User> shipperJoin = root.join("shipper", JoinType.LEFT);

                predicates.add(cb.or(
                        cb.like(cb.lower(orderJoin.get("orderCode")), kw),
                        cb.like(cb.lower(orderJoin.get("trackingCode")), kw),
                        cb.like(cb.lower(userJoin.get("name")), kw),
                        cb.like(cb.lower(userJoin.get("email")), kw),
                        cb.like(cb.lower(shipperJoin.get("name")), kw),
                        cb.like(cb.lower(root.get("comment")), kw)
                ));
            }

            if (filter.getRating() != null) {
                predicates.add(cb.equal(root.get("rating"), filter.getRating()));
            }

            if (StringUtils.hasText(filter.getStatus())) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus().trim()));
            }

            if (filter.getHasReply() != null) {
                if (filter.getHasReply()) {
                    predicates.add(cb.isNotNull(root.get("adminReply")));
                } else {
                    predicates.add(cb.isNull(root.get("adminReply")));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<DeliveryReview> entityPage = deliveryReviewRepository.findAll(
                spec,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return entityPage.map(this::toAdminResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDeliveryReviewSummaryResponse getSummary() {
        long total = deliveryReviewRepository.count();
        double avg = BigDecimal.valueOf(deliveryReviewRepository.getAverageRating())
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
        long positive = deliveryReviewRepository.countByRatingGreaterThanEqual(4);
        long pendingReply = deliveryReviewRepository.countByAdminReplyIsNull();

        return AdminDeliveryReviewSummaryResponse.builder()
                .totalReviews(total)
                .averageRating(avg)
                .positiveReviews(positive)
                .pendingReplyCount(pendingReply)
                .build();
    }

    @Override
    @Transactional
    public AdminDeliveryReviewResponse replyDeliveryReview(Long id, String staffEmail, AdminReplyReviewRequest request) {
        DeliveryReview dr = deliveryReviewRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá giao hàng", HttpStatus.NOT_FOUND));

        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new AppException("Không tìm thấy tài khoản nhân viên phản hồi", HttpStatus.NOT_FOUND));

        dr.setAdminReply(request.getReplyContent().trim());
        dr.setRepliedBy(staff);
        dr.setRepliedAt(LocalDateTime.now());

        DeliveryReview saved = deliveryReviewRepository.save(dr);
        return toAdminResponse(saved);
    }

    @Override
    @Transactional
    public AdminDeliveryReviewResponse toggleDeliveryReviewStatus(Long id) {
        DeliveryReview dr = deliveryReviewRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đánh giá giao hàng", HttpStatus.NOT_FOUND));

        dr.setStatus("approved".equalsIgnoreCase(dr.getStatus()) ? "hidden" : "approved");
        DeliveryReview saved = deliveryReviewRepository.save(dr);
        return toAdminResponse(saved);
    }

    private AdminDeliveryReviewResponse toAdminResponse(DeliveryReview dr) {
        Order order = dr.getOrder();
        User customer = dr.getUser();
        User shipper = dr.getShipper();

        List<String> tagList = StringUtils.hasText(dr.getTags())
                ? Arrays.stream(dr.getTags().split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return AdminDeliveryReviewResponse.builder()
                .id(dr.getId())
                .orderId(order != null ? order.getId() : null)
                .orderCode(order != null ? order.getOrderCode() : null)
                .trackingCode(order != null ? order.getTrackingCode() : null)
                .shippingProvider(order != null ? order.getShippingProvider() : null)
                .userId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getName() : "Khách hàng")
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerAvatar(customer != null ? customer.getAvatar() : null)
                .shipperId(shipper != null ? shipper.getId() : null)
                .shipperName(shipper != null ? shipper.getName() : "Shipper GHN")
                .shipperPhone(shipper != null ? shipper.getPhoneNumber() : null)
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
