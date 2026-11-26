package com.web.ap_sports.specification;

import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.Review;
import com.web.ap_sports.enums.ProductVariantStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecifications {

    public static Specification<Product> filterProducts(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query != null) {
                query.distinct(true);
            }

            // Keyword search (Product Name, Slug, or Variant SKU)
            if (StringUtils.hasText(filter.getKeyword())) {
                String searchPattern = "%" + filter.getKeyword().trim().toLowerCase() + "%";

                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate slugLike = cb.like(cb.lower(root.get("slug")), searchPattern);

                // Join variant for SKU search
                Subquery<Long> skuSubquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = skuSubquery.from(ProductVariant.class);
                skuSubquery.select(variantRoot.get("product").get("id"))
                        .where(cb.like(cb.lower(variantRoot.get("sku")), searchPattern));

                Predicate skuIn = cb.in(root.get("id")).value(skuSubquery);

                predicates.add(cb.or(nameLike, slugLike, skuIn));
            }

            // Category Filter (Hỗ trợ lọc theo tập categoryIds bao gồm cả danh mục cha + con + cháu, hoặc categoryId đơn lẻ)
            if (filter.getCategoryIds() != null && !filter.getCategoryIds().isEmpty()) {
                Predicate primaryCatIn = root.get("category").get("id").in(filter.getCategoryIds());

                Join<Product, Category> categoryJoin = root.join("categories", JoinType.LEFT);
                Predicate secondaryCatIn = categoryJoin.get("id").in(filter.getCategoryIds());

                predicates.add(cb.or(primaryCatIn, secondaryCatIn));
            } else if (filter.getCategoryId() != null) {
                Predicate primaryCatEqual = cb.equal(root.get("category").get("id"), filter.getCategoryId());

                Join<Product, Category> categoryJoin = root.join("categories", JoinType.LEFT);
                Predicate secondaryCatEqual = cb.equal(categoryJoin.get("id"), filter.getCategoryId());

                predicates.add(cb.or(primaryCatEqual, secondaryCatEqual));
            }

            // Status Filter
            if (StringUtils.hasText(filter.getStatus())) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus().trim()));
            }

            // Unit Filter
            if (StringUtils.hasText(filter.getUnit())) {
                predicates.add(cb.equal(cb.lower(root.get("unit")), filter.getUnit().trim().toLowerCase()));
            }

            // Bộ lọc Kích thước & Quy cách Biến thể động (Hỗ trợ chọn nhiều giá trị cách nhau dấu phẩy: "42,XL,8oz,190,4U")
            // Kiểm tra khớp chính xác trên cả cột v.size VÀ cặp giá trị JSON trong v.attributes của biến thể ACTIVE,
            // chống khớp nhầm chuỗi con (VD: lọc "5" tuyệt đối không khớp nhầm "15" hay "50").
            if (StringUtils.hasText(filter.getVariantSize())) {
                List<String> sizes = List.of(filter.getVariantSize().split(","))
                        .stream()
                        .map(s -> s.trim().toLowerCase())
                        .filter(StringUtils::hasText)
                        .toList();

                if (!sizes.isEmpty()) {
                    Subquery<Long> sizeSubquery = query.subquery(Long.class);
                    Root<ProductVariant> variantRoot = sizeSubquery.from(ProductVariant.class);

                    List<Predicate> sizeOrPredicates = new ArrayList<>();
                    Expression<String> lowerTrimmedSize = cb.lower(cb.trim(variantRoot.get("size")));
                    Expression<String> lowerAttributes = cb.lower(variantRoot.get("attributes"));

                    sizeOrPredicates.add(lowerTrimmedSize.in(sizes));

                    for (String token : sizes) {
                        String safeToken = token.replace("%", "\\%").replace("_", "\\_");
                        // Khớp chính xác giá trị chuỗi trong JSON: {"Kích thước":"8oz"} hoặc {"Trọng lượng": "4U"}
                        sizeOrPredicates.add(cb.like(lowerAttributes, "%:\"" + safeToken + "\"%", '\\'));
                        sizeOrPredicates.add(cb.like(lowerAttributes, "%: \"" + safeToken + "\"%", '\\'));
                    }

                    Predicate activeVariantPred = cb.equal(variantRoot.get("status"), ProductVariantStatus.ACTIVE);
                    sizeSubquery.select(variantRoot.get("product").get("id"))
                            .where(cb.and(activeVariantPred, cb.or(sizeOrPredicates.toArray(new Predicate[0]))));

                    predicates.add(cb.in(root.get("id")).value(sizeSubquery));
                }
            }

            // Price Range Filter
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            // Rating Filter (Lọc các sản phẩm có điểm đánh giá trung bình đã duyệt >= mức sao đã chọn)
            if (filter.getRating() != null && filter.getRating() > 0) {
                Subquery<Long> ratingSubquery = query.subquery(Long.class);
                Root<Review> reviewRoot = ratingSubquery.from(Review.class);
                ratingSubquery.select(reviewRoot.get("product").get("id"))
                        .where(cb.equal(reviewRoot.get("status"), "approved"))
                        .groupBy(reviewRoot.get("product").get("id"))
                        .having(cb.greaterThanOrEqualTo(cb.avg(reviewRoot.get("rating")), filter.getRating().doubleValue()));

                predicates.add(cb.in(root.get("id")).value(ratingSubquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
