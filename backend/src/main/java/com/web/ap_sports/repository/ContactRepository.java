package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    /**
     * Tìm kiếm và lọc danh sách liên hệ khách hàng theo từ khóa và trạng thái.
     *
     * @param keyword  Từ khóa tìm kiếm (tên, email, sdt, nội dung)
     * @param status   Trạng thái liên hệ ('pending', 'replied' hoặc null/blank để lấy tất cả)
     * @param pageable Phân trang
     * @return Trang danh sách Contact
     */
    @Query("SELECT c FROM Contact c WHERE " +
           "(:status IS NULL OR :status = '' OR LOWER(c.status) = LOWER(:status)) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.message) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Contact> searchContacts(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );
}
