package com.web.ap_sports.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tự động kiểm tra và dọn dẹp các Check Constraint Enum cũ của Hibernate trên PostgreSQL.
 * Đảm bảo các giá trị Enum mới thêm (như IMPORT_REQUEST_CREATED, IMPORT_REQUEST_APPROVED, ProductVariantStatus, v.v.)
 * không bị cơ chế kiểm tra cũ của PostgreSQL chặn lại gây lỗi AssertionFailure / Session Flush.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintFixer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Drop check constraint cũ trên bảng notifications nếu tồn tại
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_action_type_check");
            log.info("✓ Đã kiểm tra và loại bỏ check constraint cũ 'notifications_action_type_check' trên PostgreSQL.");
        } catch (Exception e) {
            log.warn("Không thể drop constraint notifications_action_type_check (có thể chưa tồn tại): {}", e.getMessage());
        }

        try {
            // Drop check constraint cũ trên bảng import_requests nếu có
            jdbcTemplate.execute("ALTER TABLE import_requests DROP CONSTRAINT IF EXISTS import_requests_status_check");
            log.info("✓ Đã kiểm tra và loại bỏ check constraint cũ 'import_requests_status_check' trên PostgreSQL.");
        } catch (Exception e) {
            log.warn("Không thể drop constraint import_requests_status_check: {}", e.getMessage());
        }

        try {
            // Tự động thêm cột status vào product_variants nếu chưa tồn tại và loại bỏ constraint cũ nếu có
            jdbcTemplate.execute("ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE'");
            jdbcTemplate.execute("UPDATE product_variants SET status = 'ACTIVE' WHERE status IS NULL");
            jdbcTemplate.execute("ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_status_check");
            log.info("✓ Đã kiểm tra và đồng bộ cấu trúc cột status cho bảng 'product_variants' trên PostgreSQL.");
        } catch (Exception e) {
            log.warn("Không thể kiểm tra/cập nhật status trên product_variants: {}", e.getMessage());
        }
    }
}
