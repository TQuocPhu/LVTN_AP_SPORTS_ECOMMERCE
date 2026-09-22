package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.AddToCartRequest;
import com.web.ap_sports.dto.request.customer.UpdateCartItemRequest;
import com.web.ap_sports.dto.response.customer.CartItemResponse;
import com.web.ap_sports.dto.response.customer.CartSummaryResponse;

public interface CustomerCartService {

    CartSummaryResponse getCart(Long userId);

    CartItemResponse addToCart(Long userId, AddToCartRequest request);

    CartItemResponse updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request);

    void removeCartItem(Long userId, Long cartItemId);

    void clearCart(Long userId);
}
