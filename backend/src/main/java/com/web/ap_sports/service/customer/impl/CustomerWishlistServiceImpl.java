package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.WishlistResponse;
import com.web.ap_sports.dto.response.WishlistStatusResponse;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.entity.Wishlist;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.repository.WishlistRepository;
import com.web.ap_sports.service.customer.CustomerWishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerWishlistServiceImpl implements CustomerWishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public WishlistStatusResponse toggleWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Khái niệm người dùng không tồn tại", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        boolean isFavorite;
        String message;

        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            isFavorite = false;
            message = "Đã xóa sản phẩm khỏi danh sách yêu thích";
        } else {
            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
            isFavorite = true;
            message = "Đã thêm sản phẩm vào danh sách yêu thích";
        }

        long totalCount = wishlistRepository.countByUserId(userId);

        return WishlistStatusResponse.builder()
                .productId(productId)
                .isFavorite(isFavorite)
                .wishlistCount(totalCount)
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> addToWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
        }
        return ApiResponse.<Void>builder()
                .message("Đã thêm sản phẩm vào danh sách yêu thích")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        return ApiResponse.<Void>builder()
                .message("Đã xóa sản phẩm khỏi danh sách yêu thích")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WishlistResponse> getUserWishlist(Long userId, Pageable pageable) {
        Page<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return wishlists.map(this::mapToWishlistResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getUserWishlistProductIds(Long userId) {
        return wishlistRepository.findProductIdsByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public WishlistStatusResponse checkWishlistStatus(Long userId, Long productId) {
        boolean isFav = wishlistRepository.existsByUserIdAndProductId(userId, productId);
        long count = wishlistRepository.countByUserId(userId);
        return WishlistStatusResponse.builder()
                .productId(productId)
                .isFavorite(isFav)
                .wishlistCount(count)
                .message(isFav ? "Sản phẩm nằm trong danh sách yêu thích" : "Sản phẩm chưa trong danh sách yêu thích")
                .build();
    }

    private WishlistResponse mapToWishlistResponse(Wishlist wishlist) {
        Product p = wishlist.getProduct();
        String primaryCatName = p.getCategory() != null ? p.getCategory().getName() : "AP Sports";

        List<ProductImage> images = productImageRepository.findByProductId(p.getId());
        String mainImage = images.stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImagePath)
                .findFirst()
                .orElseGet(() -> images.isEmpty() ? null : images.get(0).getImagePath());

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .mainImage(mainImage)
                .price(p.getPrice())
                .salePrice(null)
                .unit(p.getUnit())
                .inStock("ACTIVE".equalsIgnoreCase(p.getStatus()) || "in_stock".equalsIgnoreCase(p.getStatus()))
                .primaryCategoryName(primaryCatName)
                .addedAt(wishlist.getCreatedAt())
                .build();
    }
}
