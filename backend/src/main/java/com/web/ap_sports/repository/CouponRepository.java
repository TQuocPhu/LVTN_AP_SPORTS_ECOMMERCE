package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác cơ sở dữ liệu cho Entity Coupon (Voucher / Mã giảm giá).
 * Hỗ trợ JPA Specification cho việc tìm kiếm, lọc và sắp xếp nâng cao.
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long>, JpaSpecificationExecutor<Coupon> {

    /**
     * Kiểm tra xem mã voucher đã tồn tại hay chưa (không phân biệt hoa thường)
     * @param code Mã giảm giá cần kiểm tra
     * @return true nếu mã đã tồn tại
     */
    boolean existsByCode(String code);

    /**
     * Kiểm tra xem mã voucher đã được sử dụng bởi voucher khác hay chưa (dùng khi cập nhật)
     * @param code Mã giảm giá
     * @param id ID của voucher hiện tại
     * @return true nếu mã trùng với voucher khác
     */
    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * Tìm kiếm voucher theo mã giảm giá (không phân biệt hoa thường)
     * @param code Mã giảm giá
     * @return Optional chứa Coupon nếu tìm thấy
     */
    Optional<Coupon> findByCodeIgnoreCase(String code);

    /**
     * Lấy danh sách tất cả các voucher đang ở trạng thái kích hoạt (isActive = true)
     * @return Danh sách Coupon đang hoạt động
     */
    List<Coupon> findByIsActiveTrue();

    /**
     * Lấy danh sách các voucher đang hoạt động theo phân loại áp dụng (ví dụ: ALL, FREESHIP, FASHION, SHOES)
     * @param categoryScope Phân loại áp dụng voucher
     * @return Danh sách Coupon phù hợp
     */
    List<Coupon> findByIsActiveTrueAndCategoryScope(String categoryScope);
}

