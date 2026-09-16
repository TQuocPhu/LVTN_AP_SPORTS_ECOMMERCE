package com.web.ap_sports.specification;

import com.web.ap_sports.dto.request.admin.ProductFilterRequest;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductVariant;
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

            // Category Filter (Primary Category or Many-to-Many Categories)
            if (filter.getCategoryId() != null) {
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

            // Price Range Filter
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
