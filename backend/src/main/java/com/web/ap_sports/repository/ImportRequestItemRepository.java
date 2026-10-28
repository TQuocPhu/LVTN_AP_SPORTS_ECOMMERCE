package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ImportRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy vấn chi tiết sản phẩm của Yêu Cầu Nhập Kho
 */
@Repository
public interface ImportRequestItemRepository extends JpaRepository<ImportRequestItem, Long> {

    List<ImportRequestItem> findByImportRequestId(Long importRequestId);
}
