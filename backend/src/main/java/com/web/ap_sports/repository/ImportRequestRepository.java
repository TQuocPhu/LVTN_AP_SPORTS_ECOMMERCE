package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ImportRequest;
import com.web.ap_sports.enums.ImportRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository truy vấn dữ liệu Phiếu Yêu Cầu Nhập Kho
 */
@Repository
public interface ImportRequestRepository extends JpaRepository<ImportRequest, Long> {

    Optional<ImportRequest> findByCode(String code);

    boolean existsByCode(String code);

    /**
     * Lấy danh sách yêu cầu nhập kho phân trang mặc định sắp xếp theo ngày tạo mới nhất
     */
    Page<ImportRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Lọc yêu cầu nhập kho theo trạng thái
     */
    Page<ImportRequest> findByStatusOrderByCreatedAtDesc(ImportRequestStatus status, Pageable pageable);

    /**
     * Tìm kiếm theo từ khóa (Mã yêu cầu, tên sản phẩm, tên hoặc email người tạo)
     */
    @Query(value = """
        SELECT r FROM ImportRequest r
        LEFT JOIN r.product p
        LEFT JOIN r.requestedBy u
        WHERE LOWER(r.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
        ORDER BY r.createdAt DESC
    """,
    countQuery = """
        SELECT COUNT(r) FROM ImportRequest r
        LEFT JOIN r.product p
        LEFT JOIN r.requestedBy u
        WHERE LOWER(r.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
    """)
    Page<ImportRequest> searchByKeyword(@Param("search") String search, Pageable pageable);

    /**
     * Tìm kiếm kết hợp theo cả trạng thái và từ khóa
     */
    @Query(value = """
        SELECT r FROM ImportRequest r
        LEFT JOIN r.product p
        LEFT JOIN r.requestedBy u
        WHERE r.status = :status
          AND (LOWER(r.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        ORDER BY r.createdAt DESC
    """,
    countQuery = """
        SELECT COUNT(r) FROM ImportRequest r
        LEFT JOIN r.product p
        LEFT JOIN r.requestedBy u
        WHERE r.status = :status
          AND (LOWER(r.code) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    """)
    Page<ImportRequest> searchWithStatusAndKeyword(
            @Param("status") ImportRequestStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Đếm số lượng yêu cầu nhập kho đang chờ duyệt
     */
    long countByStatus(ImportRequestStatus status);
}
