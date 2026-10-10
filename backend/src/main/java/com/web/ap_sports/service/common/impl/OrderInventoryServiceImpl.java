package com.web.ap_sports.service.common.impl;

import com.web.ap_sports.entity.*;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.OrderInventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderInventoryServiceImpl implements OrderInventoryService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final InventoryAlertService inventoryAlertService;

    @Override
    @Transactional
    public boolean releaseOrderResources(Order order, boolean restoreCart) {
        Order lockedOrder = orderRepository.findByIdForUpdate(order.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));

        if (lockedOrder.isStockReleased()) {
            log.info("Kho của đơn hàng #{} đã được hoàn trước đó, bỏ qua hoàn kho lặp.", lockedOrder.getOrderCode());
            return false;
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(lockedOrder.getId());
        for (OrderItem item : items) {
            if (item.getProduct() != null) {
                Product lockedProduct = productRepository.findByIdForUpdate(item.getProduct().getId())
                        .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));
                int currentStock = lockedProduct.getStock() != null ? lockedProduct.getStock() : 0;
                int restoredStock = currentStock + item.getQuantity();
                lockedProduct.setStock(restoredStock);
                if ("out_of_stock".equals(lockedProduct.getStatus()) && restoredStock > 0) {
                    lockedProduct.setStatus("in_stock");
                }
                productRepository.save(lockedProduct);
                log.debug("Hoàn kho sản phẩm [{}]: {} -> {}", lockedProduct.getId(), currentStock, restoredStock);
            }
            if (item.getVariant() != null) {
                ProductVariant lockedVariant = productVariantRepository.findByIdForUpdate(item.getVariant().getId())
                        .orElseThrow(() -> new AppException("Phân loại không tồn tại", HttpStatus.NOT_FOUND));
                int currentVariantStock = lockedVariant.getStockQuantity() != null ? lockedVariant.getStockQuantity() : 0;
                int newVariantStock = currentVariantStock + item.getQuantity();
                lockedVariant.setStockQuantity(newVariantStock);
                inventoryAlertService.checkAndAlert(lockedVariant, currentVariantStock, newVariantStock);
                productVariantRepository.save(lockedVariant);
            }

            if (restoreCart) {
                if (item.getVariant() != null) {
                    Optional<CartItem> existingOpt = cartItemRepository.findByUserIdAndProductIdAndVariantId(order.getUser().getId(), item.getProduct().getId(), item.getVariant().getId());
                    if (existingOpt.isPresent()) {
                        CartItem existingItem = existingOpt.get();
                        existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                        cartItemRepository.save(existingItem);
                    } else {
                        CartItem cartItem = CartItem.builder()
                                .user(order.getUser())
                                .product(item.getProduct())
                                .variant(item.getVariant())
                                .quantity(item.getQuantity())
                                .isSelected(true)
                                .build();
                        cartItemRepository.save(cartItem);
                    }
                } else {
                    Optional<CartItem> existingOpt = cartItemRepository.findByUserIdAndProductIdAndVariantIsNull(order.getUser().getId(), item.getProduct().getId());
                    if (existingOpt.isPresent()) {
                        CartItem existingItem = existingOpt.get();
                        existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                        cartItemRepository.save(existingItem);
                    } else {
                        CartItem cartItem = CartItem.builder()
                                .user(order.getUser())
                                .product(item.getProduct())
                                .variant(null)
                                .quantity(item.getQuantity())
                                .isSelected(true)
                                .build();
                        cartItemRepository.save(cartItem);
                    }
                }
            }
        }

        if (order.getCoupon() != null) {
            Coupon coupon = order.getCoupon();
            int used = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            if (used > 0) {
                coupon.setUsedCount(used - 1);
                couponRepository.save(coupon);
                log.info("Hoàn trả lượt dùng mã giảm giá [{}] cho đơn hàng #{}: {} -> {}",
                        coupon.getCode(), order.getOrderCode(), used, used - 1);
            }
        }

        lockedOrder.setStockReleased(true);
        orderRepository.save(lockedOrder);
        return true;
    }

    @Override
    @Transactional
    public void reDeductOrderStock(Order order) {
        Order lockedOrder = orderRepository.findByIdForUpdate(order.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));

        if (!lockedOrder.isStockReleased()) {
            return; // Chưa hoàn thì không cần trừ lại
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(lockedOrder.getId());
        for (OrderItem item : items) {
            if (item.getProduct() != null) {
                Product lockedProduct = productRepository.findByIdForUpdate(item.getProduct().getId())
                        .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));
                int currentStock = lockedProduct.getStock() != null ? lockedProduct.getStock() : 0;
                if (currentStock < item.getQuantity()) {
                    throw new AppException("Rất tiếc, sản phẩm " + lockedProduct.getName() + " hiện đã hết hàng hoặc không đủ số lượng để thanh toán lại.", HttpStatus.BAD_REQUEST);
                }
                int newStock = currentStock - item.getQuantity();
                lockedProduct.setStock(newStock);
                if (newStock == 0) {
                    lockedProduct.setStatus("out_of_stock");
                }
                productRepository.save(lockedProduct);
            }
            if (item.getVariant() != null) {
                ProductVariant lockedVariant = productVariantRepository.findByIdForUpdate(item.getVariant().getId())
                        .orElseThrow(() -> new AppException("Phân loại không tồn tại", HttpStatus.NOT_FOUND));
                int currentVariantStock = lockedVariant.getStockQuantity() != null ? lockedVariant.getStockQuantity() : 0;
                if (currentVariantStock < item.getQuantity()) {
                    throw new AppException("Phân loại hàng đã chọn của sản phẩm không đủ số lượng trong kho.", HttpStatus.BAD_REQUEST);
                }
                int newVariantStock = currentVariantStock - item.getQuantity();
                lockedVariant.setStockQuantity(newVariantStock);
                inventoryAlertService.checkAndAlert(lockedVariant, currentVariantStock, newVariantStock);
                productVariantRepository.save(lockedVariant);
            }

            // Trừ lại sản phẩm trong giỏ hàng để tạm giữ (khi thanh toán lại)
            if (item.getVariant() != null) {
                cartItemRepository.findByUserIdAndProductIdAndVariantId(order.getUser().getId(), item.getProduct().getId(), item.getVariant().getId())
                        .ifPresent(existingItem -> {
                            int remaining = existingItem.getQuantity() - item.getQuantity();
                            if (remaining <= 0) {
                                cartItemRepository.delete(existingItem);
                            } else {
                                existingItem.setQuantity(remaining);
                                cartItemRepository.save(existingItem);
                            }
                        });
            } else {
                cartItemRepository.findByUserIdAndProductIdAndVariantIsNull(order.getUser().getId(), item.getProduct().getId())
                        .ifPresent(existingItem -> {
                            int remaining = existingItem.getQuantity() - item.getQuantity();
                            if (remaining <= 0) {
                                cartItemRepository.delete(existingItem);
                            } else {
                                existingItem.setQuantity(remaining);
                                cartItemRepository.save(existingItem);
                            }
                        });
            }
        }
        
        if (lockedOrder.getCoupon() != null) {
            Coupon coupon = lockedOrder.getCoupon();
            int used = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            coupon.setUsedCount(used + 1);
            couponRepository.save(coupon);
        }

        lockedOrder.setStockReleased(false);
        orderRepository.save(lockedOrder);
    }
}
