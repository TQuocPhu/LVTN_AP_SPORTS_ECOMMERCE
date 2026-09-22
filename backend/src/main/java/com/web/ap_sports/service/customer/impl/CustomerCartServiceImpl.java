package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.AddToCartRequest;
import com.web.ap_sports.dto.request.customer.UpdateCartItemRequest;
import com.web.ap_sports.dto.response.customer.CartItemResponse;
import com.web.ap_sports.dto.response.customer.CartSummaryResponse;
import com.web.ap_sports.entity.CartItem;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CartItemRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.CustomerCartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCartServiceImpl implements CustomerCartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<CartItemResponse> responses = cartItems.stream()
                .map(this::mapToCartItemResponse)
                .collect(Collectors.toList());

        int totalItems = responses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        BigDecimal totalPrice = responses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartSummaryResponse.builder()
                .items(responses)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }

    @Override
    @Transactional
    public CartItemResponse addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("Người dùng không tồn tại", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = productVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new AppException("Biến thể sản phẩm không tồn tại", HttpStatus.NOT_FOUND));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new AppException("Biến thể không thuộc sản phẩm này", HttpStatus.BAD_REQUEST);
            }
        }

        int availableStock = (variant != null) ? variant.getStockQuantity() : product.getStock();
        if (availableStock <= 0) {
            throw new AppException("Sản phẩm/biến thể đã hết hàng", HttpStatus.BAD_REQUEST);
        }

        Optional<CartItem> existingItemOpt;
        if (variant != null) {
            existingItemOpt = cartItemRepository.findByUserIdAndProductIdAndVariantId(userId, product.getId(), variant.getId());
        } else {
            existingItemOpt = cartItemRepository.findByUserIdAndProductIdAndVariantIsNull(userId, product.getId());
        }

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            if (newQuantity > availableStock) {
                throw new AppException("Số lượng trong giỏ vượt quá tồn kho khả dụng (" + availableStock + ")", HttpStatus.BAD_REQUEST);
            }
            cartItem.setQuantity(newQuantity);
        } else {
            if (request.getQuantity() > availableStock) {
                throw new AppException("Số lượng vượt quá tồn kho khả dụng (" + availableStock + ")", HttpStatus.BAD_REQUEST);
            }
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(saved);
    }

    @Override
    @Transactional
    public CartItemResponse updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException("Mặt hàng trong giỏ không tồn tại", HttpStatus.NOT_FOUND));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new AppException("Không có quyền thao tác trên giỏ hàng này", HttpStatus.FORBIDDEN);
        }

        int availableStock = (cartItem.getVariant() != null) 
                ? cartItem.getVariant().getStockQuantity() 
                : cartItem.getProduct().getStock();

        if (request.getQuantity() > availableStock) {
            throw new AppException("Số lượng chọn vượt quá tồn kho khả dụng (" + availableStock + ")", HttpStatus.BAD_REQUEST);
        }

        cartItem.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(saved);
    }

    @Override
    @Transactional
    public void removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException("Mặt hàng trong giỏ không tồn tại", HttpStatus.NOT_FOUND));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new AppException("Không có quyền thao tác trên giỏ hàng này", HttpStatus.FORBIDDEN);
        }

        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteAllByUserId(userId);
    }

    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        Product p = cartItem.getProduct();
        ProductVariant v = cartItem.getVariant();

        BigDecimal price = (v != null && v.getPrice() != null) ? v.getPrice() : p.getPrice();
        int stockQuantity = (v != null && v.getStockQuantity() != null) ? v.getStockQuantity() : p.getStock();

        String mainImage = null;
        List<ProductImage> images = productImageRepository.findByProductId(p.getId());
        if (images != null && !images.isEmpty()) {
            mainImage = images.stream()
                    .filter(ProductImage::isPrimary)
                    .map(ProductImage::getImagePath)
                    .findFirst()
                    .orElse(images.get(0).getImagePath());
        }

        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        String variantName = null;
        if (v != null) {
            String attrJson = v.getAttributes();
            if (org.springframework.util.StringUtils.hasText(attrJson)) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.Map<String, String> map = mapper.readValue(attrJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {});
                    variantName = String.join(" | ", map.values());
                } catch (Exception e) {
                    variantName = null;
                }
            }
            if (!org.springframework.util.StringUtils.hasText(variantName)) {
                List<String> parts = new java.util.ArrayList<>();
                if (v.getSize() != null && !v.getSize().isBlank()) parts.add("Size: " + v.getSize());
                if (v.getColor() != null && !v.getColor().isBlank()) parts.add("Màu: " + v.getColor());
                if (!parts.isEmpty()) {
                    variantName = String.join(" | ", parts);
                }
            }
        }

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .mainImage(mainImage)
                .variantId(v != null ? v.getId() : null)
                .sku(v != null ? v.getSku() : null)
                .size(v != null ? v.getSize() : null)
                .color(v != null ? v.getColor() : null)
                .attributes(v != null ? v.getAttributes() : null)
                .variantName(variantName)
                .price(price)
                .stockQuantity(stockQuantity)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .inStock(stockQuantity > 0)
                .build();
    }
}
