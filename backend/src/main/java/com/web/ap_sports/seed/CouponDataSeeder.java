package com.web.ap_sports.seed;

import com.web.ap_sports.entity.Coupon;
import com.web.ap_sports.entity.Coupon.CouponType;
import com.web.ap_sports.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Seeder khởi tạo 40 mã khuyến mãi (Coupons / Vouchers) đa dạng loại hình và phạm vi cho AP Sports.
 * - Đủ 3 loại: FIXED, PERCENT, FREESHIP.
 * - Đủ 2 phạm vi chuẩn của hệ thống: ALL, FREESHIP.
 * - Thời hạn hết hạn ngẫu nhiên từ nay đến hết 30/12/2026 (trong đó 15 mã > 20/12/2026).
 * - usedCount = 0 toàn bộ để phục vụ kiểm thử.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CouponDataSeeder {

    private final CouponRepository couponRepository;

    private static final int TARGET_COUPON_COUNT = 40;
    private static final int LONG_TERM_COUPON_COUNT = 15; // > 10 mã còn hạn qua 20/12/2026

    private static final BigDecimal[] FIXED_VALUES = {
            new BigDecimal("20000"),
            new BigDecimal("30000"),
            new BigDecimal("50000"),
            new BigDecimal("75000"),
            new BigDecimal("100000"),
            new BigDecimal("150000"),
            new BigDecimal("200000")
    };
    private static final int[] PERCENT_VALUES = {5, 8, 10, 12, 15, 20, 25};
    private static final BigDecimal[] MAX_DISCOUNT_VALUES = {
            new BigDecimal("50000"),
            new BigDecimal("80000"),
            new BigDecimal("100000"),
            new BigDecimal("150000"),
            new BigDecimal("200000"),
            new BigDecimal("300000")
    };
    private static final BigDecimal[] FREESHIP_VALUES = {
            new BigDecimal("15000"),
            new BigDecimal("20000"),
            new BigDecimal("30000"),
            new BigDecimal("40000"),
            new BigDecimal("50000")
    };
    private static final BigDecimal[] MIN_ORDER_VALUES = {
            BigDecimal.ZERO,
            new BigDecimal("150000"),
            new BigDecimal("300000"),
            new BigDecimal("500000"),
            new BigDecimal("800000"),
            new BigDecimal("1000000"),
            new BigDecimal("1500000")
    };

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedCoupons() {
        long existingCount = couponRepository.count();
        if (existingCount >= TARGET_COUPON_COUNT) {
            log.info("Bảng coupons đã có {} mã khuyến mãi (>= {}), bỏ qua bước seed.", existingCount, TARGET_COUPON_COUNT);
            return;
        }

        Random random = new Random(20261230L);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startsAt = now.minusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        // Mốc thời gian: từ ngày mai đến 20/12/2026 và từ 21/12/2026 đến hết 30/12/2026
        LocalDateTime dec20End = LocalDateTime.of(2026, 12, 20, 23, 59, 59);
        LocalDateTime dec21Start = LocalDateTime.of(2026, 12, 21, 0, 0, 0);
        LocalDateTime dec30End = LocalDateTime.of(2026, 12, 30, 23, 59, 59);
        LocalDateTime shortTermStart = now.plusDays(1).isBefore(dec20End) ? now.plusDays(1) : now.plusHours(6);

        List<Coupon> toSave = new ArrayList<>();
        int index = 1;

        while ((existingCount + toSave.size()) < TARGET_COUPON_COUNT && index <= 100) {
            // Phân bổ đều cả 3 loại: FIXED (~35%), PERCENT (~40%), FREESHIP (~25%)
            CouponType type;
            int mod = (index - 1) % 10;
            if (mod == 2 || mod == 6 || mod == 9) {
                type = CouponType.FREESHIP;
            } else if (mod % 2 == 0) {
                type = CouponType.FIXED;
            } else {
                type = CouponType.PERCENT;
            }

            // Đúng 2 phạm vi chuẩn của hệ thống: FREESHIP cho mã vận chuyển, ALL cho mã giảm giá đơn hàng
            String scope = (type == CouponType.FREESHIP) ? "FREESHIP" : "ALL";

            String codePrefix = switch (type) {
                case FREESHIP -> "APSHIP";
                case PERCENT -> "APPER";
                case FIXED -> "APFIX";
            };
            String code = String.format("%s%02d_%s", codePrefix, index, scope);

            if (couponRepository.existsByCode(code)) {
                index++;
                continue;
            }

            BigDecimal value;
            BigDecimal maxDiscount = null;
            String name;
            String description;

            if (type == CouponType.FIXED) {
                value = FIXED_VALUES[random.nextInt(FIXED_VALUES.length)];
                name = String.format("Giảm %s₫ (%s)", formatThousand(value), scopeLabel(scope));
                description = String.format("Giảm trực tiếp %s VNĐ cho đơn hàng áp dụng %s.", formatThousand(value), scopeLabel(scope));
            } else if (type == CouponType.PERCENT) {
                int pct = PERCENT_VALUES[random.nextInt(PERCENT_VALUES.length)];
                value = BigDecimal.valueOf(pct);
                maxDiscount = MAX_DISCOUNT_VALUES[random.nextInt(MAX_DISCOUNT_VALUES.length)];
                name = String.format("Giảm %d%% tối đa %s₫ (%s)", pct, formatThousand(maxDiscount), scopeLabel(scope));
                description = String.format("Giảm %d%% giá trị đơn hàng (tối đa %s VNĐ) cho %s.", pct, formatThousand(maxDiscount), scopeLabel(scope));
            } else {
                value = FREESHIP_VALUES[random.nextInt(FREESHIP_VALUES.length)];
                maxDiscount = value;
                name = String.format("Freeship giảm tới %s₫", formatThousand(value));
                description = String.format("Hỗ trợ phí vận chuyển tối đa %s VNĐ cho mọi đơn hàng đủ điều kiện.", formatThousand(value));
            }

            BigDecimal minOrder = MIN_ORDER_VALUES[random.nextInt(MIN_ORDER_VALUES.length)];
            int usageLimit = 50 + random.nextInt(451); // 50 -> 500 lượt
            int userUsageLimit = 1 + random.nextInt(5); // 1 -> 5 lượt/khách

            // 15 mã đầu tiên đảm bảo còn hạn sau 20/12/2026 (21/12/2026 -> 30/12/2026)
            // Các mã còn lại ngẫu nhiên từ ngày mai đến 20/12/2026
            LocalDateTime expiresAt;
            if (toSave.size() < LONG_TERM_COUPON_COUNT) {
                expiresAt = randomBetween(random, dec21Start, dec30End);
            } else {
                LocalDateTime upper = shortTermStart.isBefore(dec20End) ? dec20End : dec30End;
                expiresAt = randomBetween(random, shortTermStart, upper);
            }

            Coupon coupon = Coupon.builder()
                    .code(code)
                    .name(name)
                    .description(description)
                    .type(type)
                    .value(value)
                    .maxDiscountAmount(maxDiscount)
                    .minOrderValue(minOrder)
                    .usageLimit(usageLimit)
                    .userUsageLimit(userUsageLimit)
                    .usedCount(0)
                    .categoryScope(scope)
                    .startsAt(startsAt)
                    .expiresAt(expiresAt)
                    .status("active")
                    .isActive(true)
                    .build();

            toSave.add(coupon);
            index++;
        }

        if (!toSave.isEmpty()) {
            couponRepository.saveAll(toSave);
            log.info("✅ Đã seed thành công {} mã khuyến mãi mẫu vào bảng coupons (usedCount=0, {} mã hạn > 20/12/2026).",
                    toSave.size(), Math.min(toSave.size(), LONG_TERM_COUPON_COUNT));
        }
    }

    private LocalDateTime randomBetween(Random random, LocalDateTime start, LocalDateTime end) {
        long seconds = Math.max(1L, ChronoUnit.SECONDS.between(start, end));
        long offset = Math.abs(random.nextLong()) % seconds;
        return start.plusSeconds(offset);
    }

    private String formatThousand(BigDecimal amount) {
        return String.format("%,d", amount.longValue()).replace(',', '.');
    }

    private String scopeLabel(String scope) {
        return "FREESHIP".equals(scope) ? "Miễn phí vận chuyển" : "Toàn sàn AP Sports";
    }
}
