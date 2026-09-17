package com.web.ap_sports.specification;

import com.web.ap_sports.dto.request.admin.CategoryFilterRequest;
import com.web.ap_sports.entity.Category;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class CategorySpecifications {

    public static Specification<Category> filterCategories(CategoryFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                // Keyword Search (Name, Slug, Description)
                if (StringUtils.hasText(filter.getKeyword())) {
                    String pattern = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                    Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                    Predicate slugLike = cb.like(cb.lower(root.get("slug")), pattern);
                    Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                    predicates.add(cb.or(nameLike, slugLike, descLike));
                }

                // Parent Category Filter
                if (filter.getParentId() != null) {
                    if (filter.getParentId() == 0) {
                        // Root categories only
                        predicates.add(cb.isNull(root.get("parent")));
                    } else if (filter.getParentId() > 0) {
                        // Subcategories of a specific parent
                        predicates.add(cb.equal(root.get("parent").get("id"), filter.getParentId()));
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
