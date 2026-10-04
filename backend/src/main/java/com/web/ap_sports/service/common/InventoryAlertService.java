package com.web.ap_sports.service.common;

import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.event.LowInventoryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryAlertService {

    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.inventory.low-threshold:5}")
    private int lowStockThreshold;

    /**
     * Checks if the inventory has just dropped to or below the threshold,
     * and publishes a LowInventoryEvent if so.
     * 
     * @param variant The product variant being updated
     * @param oldQuantity The stock quantity before the update
     * @param newQuantity The stock quantity after the update
     */
    public void checkAndAlert(ProductVariant variant, int oldQuantity, int newQuantity) {
        if (oldQuantity > lowStockThreshold && newQuantity <= lowStockThreshold) {
            log.info("Cảnh báo tồn kho thấp cho sản phẩm {} - Phiên bản {}. Số lượng: {} -> {}", 
                     variant.getProduct().getName(), variant.getSku(), oldQuantity, newQuantity);
                     
            eventPublisher.publishEvent(LowInventoryEvent.builder()
                    .productId(variant.getProduct().getId())
                    .variantId(variant.getId())
                    .productName(variant.getProduct().getName())
                    .remaining(newQuantity)
                    .build());
        }
    }
}
