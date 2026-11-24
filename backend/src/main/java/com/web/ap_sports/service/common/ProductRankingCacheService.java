package com.web.ap_sports.service.common;

import com.web.ap_sports.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service chuyên trách quản lý Redis Cache cho danh sách ID xếp hạng sản phẩm
 * (Sản Phẩm Đánh Giá Cao và Trang Thiết Bị Nổi Bật).
 *
 * Nguyên lý thiết kế an toàn tồn kho & giá bán:
 * - Chỉ lưu danh sách ID (`List<Long>`) đã xếp hạng lên Redis với TTL ngắn (~5 phút + jitter).
 * - Tuyệt đối không lưu cứng giá bán, tồn kho hay trạng thái còn hàng lên Redis;
 *   CustomerProductServiceImpl sẽ nạp dữ liệu tươi mới nhất theo các ID này từ DB.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRankingCacheService {

    private final ProductRepository productRepository;

    /**
     * Lấy danh sách ID sản phẩm được đánh giá cao nhất từ Redis Cache (TTL ~5 phút).
     * Khi Cache Miss sẽ chạy truy vấn xếp hạng trên Database và lưu kết quả dạng ArrayList.
     */
    @Transactional(readOnly = true)
    @Cacheable(
            value = "product_ranking_ids",
            key = "'lvtn:dev:catalog:top_rated_ids:' + #limit",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<Long> getCachedTopRatedProductIds(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        log.debug("[Redis Cache Miss] Nạp danh sách ID Sản Phẩm Đánh Giá Cao (limit={}) từ Database...", safeLimit);
        return new ArrayList<>(productRepository.findTopRatedProductIds(PageRequest.of(0, safeLimit)));
    }

    /**
     * Lấy danh sách ID trang thiết bị nổi bật từ Redis Cache (TTL ~5 phút).
     * Khi Cache Miss sẽ chạy truy vấn tổng hợp lượt bán + đánh giá trên Database và lưu kết quả dạng ArrayList.
     */
    @Transactional(readOnly = true)
    @Cacheable(
            value = "product_ranking_ids",
            key = "'lvtn:dev:catalog:featured_ids:' + #limit",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<Long> getCachedFeaturedProductIds(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 24));
        log.debug("[Redis Cache Miss] Nạp danh sách ID Trang Thiết Bị Nổi Bật (limit={}) từ Database...", safeLimit);
        return new ArrayList<>(productRepository.findFeaturedProductIds(PageRequest.of(0, safeLimit)));
    }

    /**
     * Xóa toàn bộ cache xếp hạng sản phẩm khi cần làm mới thủ công hoặc khi có thay đổi lớn.
     */
    @CacheEvict(value = "product_ranking_ids", allEntries = true)
    public void evictProductRankingCache() {
        log.debug("[Redis Cache Evict] Đã xóa cache vùng product_ranking_ids.");
    }
}
