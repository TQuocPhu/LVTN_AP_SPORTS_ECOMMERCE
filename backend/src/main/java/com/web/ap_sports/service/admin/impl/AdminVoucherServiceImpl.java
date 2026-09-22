package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.VoucherFilterRequest;
import com.web.ap_sports.dto.request.admin.VoucherRequest;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.entity.Coupon;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CouponRepository;
import com.web.ap_sports.service.admin.AdminVoucherService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Lớp triển khai Service nghiệp vụ xử lý Voucher phía Quản trị viên (Admin).
 * Bao gồm các tính năng CRUD đầy đủ, lọc tìm kiếm đa tiêu chí, phân trang và toggle trạng thái.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminVoucherServiceImpl implements AdminVoucherService {


    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getVouchers(VoucherFilterRequest filterRequest) {
        int page = Math.max(0, filterRequest.getPage());
        int size = filterRequest.getSize() <= 0 ? 10 : filterRequest.getSize();

        String sortBy = StringUtils.hasText(filterRequest.getSortBy()) ? filterRequest.getSortBy() : "createdAt";
        Sort.Direction sortDir = "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDir, sortBy));

        Specification<Coupon> spec = buildFilterSpecification(filterRequest);

        Page<Coupon> couponPage = couponRepository.findAll(spec, pageable);

        List<VoucherResponse> responses = couponPage.getContent().stream()
                .map(this::mapToVoucherResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, couponPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy mã giảm giá với ID: " + id, HttpStatus.NOT_FOUND));
        return mapToVoucherResponse(coupon);
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();

        if (couponRepository.existsByCode(code)) {
            throw new AppException("Mã giảm giá '" + code + "' đã tồn tại trên hệ thống.", HttpStatus.BAD_REQUEST);
        }

        validateVoucherLogic(request);

        Coupon.CouponType couponType;
        try {
            couponType = Coupon.CouponType.valueOf(request.getType().toUpperCase());
        } catch (Exception e) {
            throw new AppException("Loại voucher '" + request.getType() + "' không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .name(request.getName().trim())
                .description(request.getDescription())
                .type(couponType)
                .value(request.getValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO)
                .usageLimit(request.getUsageLimit())
                .userUsageLimit(request.getUserUsageLimit() != null ? request.getUserUsageLimit() : 1)
                .usedCount(0)
                .categoryScope(StringUtils.hasText(request.getCategoryScope()) ? request.getCategoryScope() : "ALL")
                .startsAt(request.getStartsAt() != null ? request.getStartsAt() : LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .status("active")
                .build();

        Coupon saved = couponRepository.save(coupon);
        return mapToVoucherResponse(saved);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy mã giảm giá với ID: " + id, HttpStatus.NOT_FOUND));

        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeAndIdNot(code, id)) {
            throw new AppException("Mã giảm giá '" + code + "' đã trùng với voucher khác.", HttpStatus.BAD_REQUEST);
        }

        validateVoucherLogic(request);

        Coupon.CouponType couponType;
        try {
            couponType = Coupon.CouponType.valueOf(request.getType().toUpperCase());
        } catch (Exception e) {
            throw new AppException("Loại voucher '" + request.getType() + "' không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        coupon.setCode(code);
        coupon.setName(request.getName().trim());
        coupon.setDescription(request.getDescription());
        coupon.setType(couponType);
        coupon.setValue(request.getValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setUserUsageLimit(request.getUserUsageLimit() != null ? request.getUserUsageLimit() : 1);
        if (StringUtils.hasText(request.getCategoryScope())) {
            coupon.setCategoryScope(request.getCategoryScope());
        }
        if (request.getStartsAt() != null) {
            coupon.setStartsAt(request.getStartsAt());
        }
        coupon.setExpiresAt(request.getExpiresAt());
        if (request.getIsActive() != null) {
            coupon.setActive(request.getIsActive());
        }

        Coupon saved = couponRepository.save(coupon);
        return mapToVoucherResponse(saved);
    }

    @Override
    @Transactional
    public VoucherResponse toggleVoucherStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy mã giảm giá với ID: " + id, HttpStatus.NOT_FOUND));

        coupon.setActive(!coupon.isActive());
        Coupon saved = couponRepository.save(coupon);
        return mapToVoucherResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy mã giảm giá với ID: " + id, HttpStatus.NOT_FOUND));

        couponRepository.delete(coupon);
    }

    private void validateVoucherLogic(VoucherRequest request) {
        if ("PERCENT".equalsIgnoreCase(request.getType()) && request.getValue().compareTo(new BigDecimal("100")) > 0) {
            throw new AppException("Giá trị giảm theo phần trăm không được vượt quá 100%.", HttpStatus.BAD_REQUEST);
        }

        if (request.getStartsAt() != null && request.getExpiresAt() != null) {
            if (request.getStartsAt().isAfter(request.getExpiresAt()) || request.getStartsAt().isEqual(request.getExpiresAt())) {
                throw new AppException("Thời gian bắt đầu hiệu lực phải xảy ra trước thời gian hết hạn.", HttpStatus.BAD_REQUEST);
            }
        }
    }

    private Specification<Coupon> buildFilterSpecification(VoucherFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getKeyword())) {
                String kw = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("code")), kw);
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), kw);
                predicates.add(cb.or(codeMatch, nameMatch));
            }

            if (StringUtils.hasText(filter.getType()) && !"ALL".equalsIgnoreCase(filter.getType())) {
                try {
                    Coupon.CouponType typeEnum = Coupon.CouponType.valueOf(filter.getType().toUpperCase());
                    predicates.add(cb.equal(root.get("type"), typeEnum));
                } catch (Exception ignored) {
                }
            }

            if (StringUtils.hasText(filter.getCategoryScope()) && !"ALL".equalsIgnoreCase(filter.getCategoryScope())) {
                predicates.add(cb.equal(root.get("categoryScope"), filter.getCategoryScope()));
            }

            LocalDateTime now = LocalDateTime.now();
            if (StringUtils.hasText(filter.getStatus()) && !"ALL".equalsIgnoreCase(filter.getStatus())) {
                String status = filter.getStatus().toLowerCase();
                if ("active".equals(status)) {
                    predicates.add(cb.equal(root.get("isActive"), true));
                    predicates.add(cb.or(cb.isNull(root.get("expiresAt")), cb.greaterThanOrEqualTo(root.get("expiresAt"), now)));
                    predicates.add(cb.or(cb.isNull(root.get("startsAt")), cb.lessThanOrEqualTo(root.get("startsAt"), now)));
                } else if ("scheduled".equals(status)) {
                    predicates.add(cb.equal(root.get("isActive"), true));
                    predicates.add(cb.greaterThan(root.get("startsAt"), now));
                } else if ("expired".equals(status)) {
                    predicates.add(cb.lessThan(root.get("expiresAt"), now));
                } else if ("disabled".equals(status) || "inactive".equals(status)) {
                    predicates.add(cb.equal(root.get("isActive"), false));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private VoucherResponse mapToVoucherResponse(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();

        String calculatedStatus = "active";
        String displayStatus = "Đang diễn ra";

        if (!coupon.isActive()) {
            calculatedStatus = "disabled";
            displayStatus = "Tạm dừng";
        } else if (coupon.getStartsAt() != null && coupon.getStartsAt().isAfter(now)) {
            calculatedStatus = "scheduled";
            displayStatus = "Sắp diễn ra";
        } else if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
            calculatedStatus = "expired";
            displayStatus = "Hết hạn";
        } else if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            calculatedStatus = "expired";
            displayStatus = "Đã hết lượt";
        }

        double usagePercentage = 0.0;
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0) {
            usagePercentage = Math.min(100.0, Math.round((coupon.getUsedCount() * 100.0 / coupon.getUsageLimit()) * 10.0) / 10.0);
        }

        boolean isUsable = coupon.isActive()
                && (coupon.getStartsAt() == null || !coupon.getStartsAt().isAfter(now))
                && (coupon.getExpiresAt() == null || !coupon.getExpiresAt().isBefore(now))
                && (coupon.getUsageLimit() == null || coupon.getUsedCount() < coupon.getUsageLimit());

        return VoucherResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .description(coupon.getDescription())
                .type(coupon.getType() != null ? coupon.getType().name() : "FIXED")
                .value(coupon.getValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minOrderValue(coupon.getMinOrderValue())
                .usageLimit(coupon.getUsageLimit())
                .userUsageLimit(coupon.getUserUsageLimit())
                .usedCount(coupon.getUsedCount() != null ? coupon.getUsedCount() : 0)
                .usagePercentage(usagePercentage)
                .categoryScope(coupon.getCategoryScope() != null ? coupon.getCategoryScope() : "ALL")
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .status(calculatedStatus)
                .displayStatus(displayStatus)
                .isActive(coupon.isActive())
                .isUsable(isUsable)
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
