package com.web.ap_sports.service.common;

import com.web.ap_sports.entity.Order;

public interface OrderInventoryService {
    boolean releaseOrderResources(Order order, boolean restoreCart);
    void reDeductOrderStock(Order order);
}
