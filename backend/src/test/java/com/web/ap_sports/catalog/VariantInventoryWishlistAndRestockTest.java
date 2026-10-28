package com.web.ap_sports.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.support.RegisterRestockNotificationRequest;
import com.web.ap_sports.dto.request.warehouse.CreateInventoryTransactionRequest;
import com.web.ap_sports.dto.request.warehouse.InventoryAuditRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.WishlistResponse;
import com.web.ap_sports.dto.response.WishlistStatusResponse;
import com.web.ap_sports.dto.response.support.RestockNotificationResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryOverviewStatsResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.dto.response.warehouse.LowStockVariantResponse;
import com.web.ap_sports.entity.CartItem;
import com.web.ap_sports.entity.Coupon;
import com.web.ap_sports.entity.InventoryTransaction;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.OrderItem;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductRestockNotification;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.Supplier;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.entity.Wishlist;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.event.LowInventoryEvent;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CartItemRepository;
import com.web.ap_sports.repository.CouponRepository;
import com.web.ap_sports.repository.InventoryTransactionRepository;
import com.web.ap_sports.repository.OrderItemRepository;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductRestockNotificationRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.SupplierRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.repository.WishlistRepository;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.common.impl.OrderInventoryServiceImpl;
import com.web.ap_sports.service.customer.impl.CustomerWishlistServiceImpl;
import com.web.ap_sports.service.customer.impl.ProductRestockNotificationServiceImpl;
import com.web.ap_sports.service.warehouse.impl.WarehouseInventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Quản lý Tồn kho Biến thể, Cảnh báo Sắp hết hàng, Restock Alert & Wishlist
 * (Phần 5: TC-INV-01.1 -> TC-INV-04.4, gồm 18 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Variant Inventory, LowStock Alert, Restock Notification & Wishlist Unit Tests (Phần 5 - 18 Tests)")
class VariantInventoryWishlistAndRestockTest {

    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private ProductRestockNotificationRepository restockRepository;
    @Mock
    private WishlistRepository wishlistRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private ProductRestockNotificationServiceImpl mockRestockServiceForWarehouse;

    private InventoryAlertService inventoryAlertService;
    private WarehouseInventoryServiceImpl warehouseInventoryService;
    private OrderInventoryServiceImpl orderInventoryService;
    private ProductRestockNotificationServiceImpl restockNotificationService;
    private CustomerWishlistServiceImpl customerWishlistService;

    private User customerUser;
    private User warehouseUser;
    private Product sampleProduct;
    private ProductVariant sampleVariant;

    @BeforeEach
    void setUp() {
        inventoryAlertService = new InventoryAlertService(eventPublisher);
        ReflectionTestUtils.setField(inventoryAlertService, "lowStockThreshold", 5);

        warehouseInventoryService = new WarehouseInventoryServiceImpl(
                transactionRepository,
                variantRepository,
                productRepository,
                supplierRepository,
                userRepository,
                productImageRepository,
                inventoryAlertService,
                mockRestockServiceForWarehouse
        );

        orderInventoryService = new OrderInventoryServiceImpl(
                orderRepository,
                orderItemRepository,
                productRepository,
                variantRepository,
                cartItemRepository,
                couponRepository,
                inventoryAlertService
        );

        restockNotificationService = new ProductRestockNotificationServiceImpl(
                restockRepository,
                userRepository,
                productRepository,
                variantRepository,
                productImageRepository,
                emailService,
                notificationService,
                new ObjectMapper()
        );

        customerWishlistService = new CustomerWishlistServiceImpl(
                wishlistRepository,
                userRepository,
                productRepository,
                productImageRepository
        );

        customerUser = User.builder().id(100L).name("Khách Hàng A").email("customer@example.com").build();
        warehouseUser = User.builder().id(5L).name("Thủ Kho").email("warehouse@apsports.com").build();

        sampleProduct = Product.builder()
                .id(50L)
                .name("Giày Đá Bóng Nike Mercurial")
                .slug("giay-da-bong-nike-mercurial")
                .price(new BigDecimal("1500000"))
                .stock(0)
                .status("out_of_stock")
                .unit("Đôi")
                .build();

        sampleVariant = ProductVariant.builder()
                .id(10L)
                .product(sampleProduct)
                .sku("NIKE-MER-42")
                .color("Đỏ")
                .size("42")
                .price(new BigDecimal("1500000"))
                .costPrice(new BigDecimal("900000"))
                .stockQuantity(0)
                .build();
    }

    // =========================================================================
    // NHÓM 5.1: GIAO DỊCH KHO BIẾN THỂ (IMPORT/EXPORT/ADJUSTMENT) & ĐỒNG BỘ TỒN KHO (7 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 5.1: Giao dịch Kho Biến thể & Cảnh báo Tồn kho thấp (TC-INV-01 -> TC-INV-02.1)")
    class WarehouseTransactionAndAlertTests {

        @Test
        @DisplayName("TC-INV-01.1: Nhập kho Biến thể (IMPORT) -> Tăng tồn kho, cập nhật costPrice, đổi Product sang in_stock & bắn Restock Alert")
        void createTransaction_Import_UpdatesStockCostPriceAndNotifiesSubscribers() {
            Supplier supplier = Supplier.builder().id(1L).name("Nike VN").code("SUP-01").build();
            CreateInventoryTransactionRequest req = CreateInventoryTransactionRequest.builder()
                    .type(TransactionType.IMPORT)
                    .supplierId(1L)
                    .variantId(10L)
                    .quantity(20)
                    .unitCost(new BigDecimal("950000"))
                    .note("Nhập hàng đợt 1")
                    .build();

            when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
            when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(sampleVariant));
            when(transactionRepository.save(any(InventoryTransaction.class))).thenAnswer(inv -> {
                InventoryTransaction tx = inv.getArgument(0);
                tx.setId(500L);
                return tx;
            });

            InventoryTransactionResponse res = warehouseInventoryService.createTransaction(req, "warehouse@apsports.com");

            assertNotNull(res);
            assertEquals(20, sampleVariant.getStockQuantity());
            assertEquals(new BigDecimal("950000"), sampleVariant.getCostPrice());
            assertEquals(20, sampleProduct.getStock());
            assertEquals("in_stock", sampleProduct.getStatus(), "Sản phẩm cha phải tự động chuyển từ out_of_stock sang in_stock");
            assertEquals(new BigDecimal("19000000"), res.getTotalAmount());
            assertTrue(res.getCode().startsWith("PNK-"));

            verify(variantRepository, times(1)).findByIdForUpdate(10L);
            verify(mockRestockServiceForWarehouse, times(1)).notifySubscribersForRestockedVariant(10L, 20);
        }

        @Test
        @DisplayName("TC-INV-01.2: Xuất kho Biến thể (EXPORT) về 0 -> Tự động chuyển trạng thái Sản phẩm cha sang out_of_stock")
        void createTransaction_ExportToZero_SyncsProductToOutOfStock() {
            sampleVariant.setStockQuantity(8);
            sampleProduct.setStock(8);
            sampleProduct.setStatus("in_stock");

            CreateInventoryTransactionRequest req = CreateInventoryTransactionRequest.builder()
                    .type(TransactionType.EXPORT)
                    .variantId(10L)
                    .quantity(8)
                    .build();

            when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(sampleVariant));
            when(transactionRepository.save(any(InventoryTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

            InventoryTransactionResponse res = warehouseInventoryService.createTransaction(req, "warehouse@apsports.com");

            assertEquals(0, sampleVariant.getStockQuantity());
            assertEquals(0, sampleProduct.getStock());
            assertEquals("out_of_stock", sampleProduct.getStatus());
            assertTrue(res.getCode().startsWith("PXK-"));
            verify(eventPublisher, times(1)).publishEvent(any(LowInventoryEvent.class));
        }

        @Test
        @DisplayName("TC-INV-01.3: Chặn Xuất kho (EXPORT) khi số lượng yêu cầu lớn hơn số lượng tồn kho hiện tại của Biến thể")
        void createTransaction_ExportExceedsStock_ThrowsBadRequest() {
            sampleVariant.setStockQuantity(5);
            CreateInventoryTransactionRequest req = CreateInventoryTransactionRequest.builder()
                    .type(TransactionType.EXPORT)
                    .variantId(10L)
                    .quantity(6)
                    .build();

            when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));

            AppException ex = assertThrows(AppException.class,
                    () -> warehouseInventoryService.createTransaction(req, "warehouse@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Số lượng xuất (6) của NIKE-MER-42 vượt quá số lượng tồn kho (5)", ex.getMessage());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-INV-01.4: Kiểm kê điều chỉnh kho (adjustStock - ADJUSTMENT) thành công & Tự động bắn Restock Alert khi điều chỉnh từ 0 lên > 0")
        void adjustStock_FromZeroToPositive_CreatesAdjustmentTicketAndNotifiesRestock() {
            sampleVariant.setStockQuantity(0);
            InventoryAuditRequest req = InventoryAuditRequest.builder()
                    .variantId(10L)
                    .actualQuantity(4)
                    .note("Kiểm kê phát hiện thêm 4 đôi")
                    .build();

            when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(sampleVariant));
            when(transactionRepository.save(any(InventoryTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

            InventoryTransactionResponse res = warehouseInventoryService.adjustStock(req, "warehouse@apsports.com");

            assertEquals(4, sampleVariant.getStockQuantity());
            assertEquals("in_stock", sampleProduct.getStatus());
            assertEquals(4, res.getQuantity());
            assertTrue(res.getCode().startsWith("PKK-"));
            verify(mockRestockServiceForWarehouse, times(1)).notifySubscribersForRestockedVariant(10L, 4);
        }

        @Test
        @DisplayName("TC-INV-01.5: Chặn Kiểm kê kho (adjustStock) khi số lượng thực tế bằng đúng tồn kho sổ sách (diff == 0)")
        void adjustStock_Fail_NoDifference() {
            sampleVariant.setStockQuantity(12);
            InventoryAuditRequest req = InventoryAuditRequest.builder()
                    .variantId(10L)
                    .actualQuantity(12)
                    .build();

            when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));

            AppException ex = assertThrows(AppException.class,
                    () -> warehouseInventoryService.adjustStock(req, "warehouse@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Số lượng đếm thực tế trùng khớp với tồn kho sổ sách, không cần điều chỉnh", ex.getMessage());
        }

        @Test
        @DisplayName("TC-INV-01.6: Thống kê Tổng quan Kho (getOverviewStats) và Lọc danh sách Biến thể sắp hết hàng (getLowStockVariants)")
        void getOverviewStatsAndLowStockVariants_CalculatesCorrectly() {
            ProductVariant vLow = ProductVariant.builder()
                    .id(1L).product(sampleProduct).sku("LOW-1").stockQuantity(3)
                    .costPrice(new BigDecimal("100000")).price(new BigDecimal("200000")).build();
            ProductVariant vHighFallbackPrice = ProductVariant.builder()
                    .id(2L).product(sampleProduct).sku("HIGH-2").stockQuantity(10)
                    .costPrice(BigDecimal.ZERO).price(new BigDecimal("150000")).build();

            when(variantRepository.findAll()).thenReturn(List.of(vLow, vHighFallbackPrice));
            when(transactionRepository.sumQuantityByTypeInPeriod(eq(TransactionType.IMPORT), any(), any())).thenReturn(50L);
            when(transactionRepository.sumQuantityByTypeInPeriod(eq(TransactionType.EXPORT), any(), any())).thenReturn(20L);

            InventoryOverviewStatsResponse stats = warehouseInventoryService.getOverviewStats();
            Page<LowStockVariantResponse> lowStockPage = warehouseInventoryService.getLowStockVariants(5, PageRequest.of(0, 10));

            assertEquals(2L, stats.getTotalVariantsCount());
            assertEquals(13L, stats.getTotalInStockQuantity());
            // 3 * 100,000 + 10 * 150,000 = 1,800,000
            assertEquals(new BigDecimal("1800000"), stats.getTotalInventoryValue());
            assertEquals(1L, stats.getLowStockAlertCount());
            assertEquals(1, lowStockPage.getTotalElements());
            assertEquals("LOW-1", lowStockPage.getContent().get(0).getSku());
        }

        @Test
        @DisplayName("TC-INV-02.1: Phát sự kiện Cảnh báo Tồn kho thấp (LowInventoryEvent) chỉ khi vượt ngưỡng > 5 xuống <= 5")
        void inventoryAlertService_CheckAndAlert_FiresOnlyWhenCrossingThreshold() {
            // 1. Giảm từ 7 -> 5 (Vượt ngưỡng -> Phát sự kiện)
            inventoryAlertService.checkAndAlert(sampleVariant, 7, 5);
            // 2. Giảm từ 5 -> 3 (Đã ở dưới ngưỡng từ trước -> Không phát lại)
            inventoryAlertService.checkAndAlert(sampleVariant, 5, 3);
            // 3. Giảm từ 10 -> 6 (Vẫn trên ngưỡng -> Không phát)
            inventoryAlertService.checkAndAlert(sampleVariant, 10, 6);

            verify(eventPublisher, times(1)).publishEvent(any(LowInventoryEvent.class));
        }
    }

    // =========================================================================
    // NHÓM 5.2: HOÀN KHO / TRỪ KHO ĐƠN HÀNG, RESTOCK NOTIFICATION & WISHLIST (11 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 5.2: Hoàn kho Đơn hàng, Thông báo Hàng về (Restock Notification) & Yêu thích (Wishlist) (TC-INV-02.2 -> TC-INV-04.4)")
    class OrderStockRestockAndWishlistTests {

        @Test
        @DisplayName("TC-INV-02.2: Giải phóng tài nguyên Đơn hàng (releaseOrderResources) -> Hoàn kho, hoàn Coupon, khôi phục Giỏ hàng & Chống hoàn lặp")
        void releaseOrderResources_RestoresStockCouponCart_AndIsIdempotent() {
            Coupon coupon = Coupon.builder().id(1L).code("GIAM50K").usedCount(5).build();
            Order order = Order.builder()
                    .id(900L)
                    .orderCode("ORD-900")
                    .user(customerUser)
                    .coupon(coupon)
                    .stockReleased(false)
                    .build();
            OrderItem item = OrderItem.builder()
                    .id(1L)
                    .order(order)
                    .product(sampleProduct)
                    .variant(sampleVariant)
                    .quantity(2)
                    .build();

            when(orderRepository.findByIdForUpdate(900L)).thenReturn(Optional.of(order));
            when(orderItemRepository.findByOrderId(900L)).thenReturn(List.of(item));
            when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
            when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));
            when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L)).thenReturn(Optional.empty());

            // Lần gọi 1: Hoàn kho thành công
            boolean firstRelease = orderInventoryService.releaseOrderResources(order, true);
            assertTrue(firstRelease);
            assertEquals(2, sampleProduct.getStock());
            assertEquals("in_stock", sampleProduct.getStatus());
            assertEquals(2, sampleVariant.getStockQuantity());
            assertEquals(4, coupon.getUsedCount());
            assertTrue(order.isStockReleased());
            verify(cartItemRepository, times(1)).save(any(CartItem.class));

            // Lần gọi 2 trên cùng đơn hàng: Đã hoàn trước đó -> Bỏ qua ngay lập tức (Idempotent)
            boolean secondRelease = orderInventoryService.releaseOrderResources(order, true);
            assertFalse(secondRelease);
            assertEquals(2, sampleVariant.getStockQuantity(), "Tồn kho không được cộng lặp lần 2");
        }

        @Test
        @DisplayName("TC-INV-02.3: Trừ lại kho khi Khách hàng thanh toán lại đơn hàng (reDeductOrderStock) & Chặn nếu Biến thể đã hết hàng")
        void reDeductOrderStock_SuccessAndInsufficientStockException() {
            Order order = Order.builder().id(901L).user(customerUser).stockReleased(true).build();
            OrderItem item = OrderItem.builder().id(2L).order(order).product(sampleProduct).variant(sampleVariant).quantity(2).build();

            sampleProduct.setStock(2);
            sampleProduct.setStatus("in_stock");
            sampleVariant.setStockQuantity(2);

            when(orderRepository.findByIdForUpdate(901L)).thenReturn(Optional.of(order));
            when(orderItemRepository.findByOrderId(901L)).thenReturn(List.of(item));
            when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
            when(variantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));

            // 1. Đủ hàng -> Trừ kho về 0, chuyển sản phẩm sang out_of_stock, đặt stockReleased = false
            orderInventoryService.reDeductOrderStock(order);
            assertEquals(0, sampleProduct.getStock());
            assertEquals("out_of_stock", sampleProduct.getStatus());
            assertEquals(0, sampleVariant.getStockQuantity());
            assertFalse(order.isStockReleased());

            // 2. Khi thanh toán lại lần nữa nhưng kho biến thể không đủ (stockQuantity = 0 < 2)
            order.setStockReleased(true);
            sampleProduct.setStock(5);
            sampleVariant.setStockQuantity(1);

            AppException ex = assertThrows(AppException.class, () -> orderInventoryService.reDeductOrderStock(order));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Phân loại hàng đã chọn của sản phẩm không đủ số lượng trong kho"));
        }

        @Test
        @DisplayName("TC-INV-03.1: Khách hàng đăng ký nhận thông báo khi Biến thể hết hàng (registerNotification) thành công & Chống tạo bản ghi trùng")
        void registerRestockNotification_SuccessAndIdempotentUpdate() {
            RegisterRestockNotificationRequest req = RegisterRestockNotificationRequest.builder()
                    .variantId(10L)
                    .customEmail("  custom@gmail.com  ")
                    .build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(restockRepository.findByUserIdAndVariantIdAndStatus(100L, 10L, ProductRestockNotification.Status.PENDING))
                    .thenReturn(Optional.empty());
            when(restockRepository.save(any(ProductRestockNotification.class))).thenAnswer(inv -> {
                ProductRestockNotification n = inv.getArgument(0);
                n.setId(77L);
                return n;
            });

            // Lần 1: Tạo mới
            RestockNotificationResponse res1 = restockNotificationService.registerNotification(100L, req);
            assertEquals(77L, res1.getId());
            assertEquals("custom@gmail.com", res1.getEmail());
            assertEquals("PENDING", res1.getStatus());

            // Lần 2: Đã có bản ghi PENDING -> Không tạo mới, chỉ cập nhật bản ghi hiện có
            ProductRestockNotification existing = ProductRestockNotification.builder()
                    .id(77L).user(customerUser).product(sampleProduct).variant(sampleVariant)
                    .status(ProductRestockNotification.Status.PENDING).build();
            when(restockRepository.findByUserIdAndVariantIdAndStatus(100L, 10L, ProductRestockNotification.Status.PENDING))
                    .thenReturn(Optional.of(existing));

            RestockNotificationResponse res2 = restockNotificationService.registerNotification(100L, req);
            assertTrue(res2.getMessage().contains("Bạn đã đăng ký nhận thông báo cho biến thể này trước đó rồi"));
        }

        @Test
        @DisplayName("TC-INV-03.2: Chặn đăng ký nhận thông báo Hàng về nếu Biến thể đang còn hàng (stockQuantity > 0)")
        void registerRestockNotification_Fail_VariantInStock() {
            sampleVariant.setStockQuantity(3);
            RegisterRestockNotificationRequest req = RegisterRestockNotificationRequest.builder().variantId(10L).build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));

            AppException ex = assertThrows(AppException.class,
                    () -> restockNotificationService.registerNotification(100L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Biến thể này hiện đang còn hàng trong kho, bạn có thể đặt mua ngay!", ex.getMessage());
        }

        @Test
        @DisplayName("TC-INV-03.3: Chặn đăng ký nhận thông báo Hàng về nếu Sản phẩm đã ngừng kinh doanh vĩnh viễn (status = 'discontinued')")
        void registerRestockNotification_Fail_ProductDiscontinued() {
            sampleProduct.setStatus("discontinued");
            RegisterRestockNotificationRequest req = RegisterRestockNotificationRequest.builder().variantId(10L).build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(variantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));

            AppException ex = assertThrows(AppException.class,
                    () -> restockNotificationService.registerNotification(100L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Sản phẩm đã ngừng kinh doanh hoàn toàn"));
        }

        @Test
        @DisplayName("TC-INV-03.4: Hủy đăng ký nhận thông báo Hàng về (cancelNotification) & Kiểm tra trạng thái đăng ký (isSubscribed)")
        void cancelRestockNotification_AndCheckIsSubscribed_Success() {
            ProductRestockNotification pending = ProductRestockNotification.builder()
                    .id(77L).user(customerUser).variant(sampleVariant).status(ProductRestockNotification.Status.PENDING).build();

            when(restockRepository.findByUserIdAndVariantIdAndStatus(100L, 10L, ProductRestockNotification.Status.PENDING))
                    .thenReturn(Optional.of(pending));

            ApiResponse<Void> cancelRes = restockNotificationService.cancelNotification(100L, 10L);
            assertEquals(ProductRestockNotification.Status.CANCELLED, pending.getStatus());
            assertTrue(cancelRes.getMessage().contains("Đã hủy đăng ký"));

            assertFalse(restockNotificationService.isSubscribed(null, 10L));
        }

        @Test
        @DisplayName("TC-INV-03.5: Tự động gửi Email HTML + WebSocket (PRODUCT_RESTOCKED) cho khách hàng đang chờ khi Biến thể về kho")
        void notifySubscribersForRestockedVariant_SendsEmailAndWebSocket_IsolatesSubscriberErrors() {
            User user2 = User.builder().id(102L).name("Khách B").email("userb@example.com").build();
            ProductRestockNotification sub1Fail = ProductRestockNotification.builder()
                    .id(1L).user(customerUser).product(sampleProduct).variant(sampleVariant)
                    .email("fail@example.com").status(ProductRestockNotification.Status.PENDING).build();
            ProductRestockNotification sub2Ok = ProductRestockNotification.builder()
                    .id(2L).user(user2).product(sampleProduct).variant(sampleVariant)
                    .email("userb@example.com").status(ProductRestockNotification.Status.PENDING).build();

            when(restockRepository.findByVariantIdAndStatusWithDetails(10L, ProductRestockNotification.Status.PENDING))
                    .thenReturn(List.of(sub1Fail, sub2Ok));
            when(productImageRepository.findByVariantId(10L)).thenReturn(Collections.emptyList());
            when(productImageRepository.findFirstByProductIdAndIsPrimaryTrue(50L))
                    .thenReturn(Optional.of(ProductImage.builder().imagePath("https://img.com/main.png").isPrimary(true).build()));

            // Giả lập lỗi gửi mail ở sub1 để đảm bảo sub2 vẫn được xử lý bình thường
            doThrow(new RuntimeException("SMTP timeout")).when(emailService)
                    .sendRestockAlertEmail(eq("fail@example.com"), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());

            restockNotificationService.notifySubscribersForRestockedVariant(10L, 15);

            assertEquals(ProductRestockNotification.Status.PENDING, sub1Fail.getStatus(), "Sub1 lỗi thì giữ nguyên PENDING");
            assertEquals(ProductRestockNotification.Status.NOTIFIED, sub2Ok.getStatus(), "Sub2 thành công phải chuyển sang NOTIFIED");
            assertNotNull(sub2Ok.getNotifiedAt());
            verify(notificationService, times(1)).sendToUser(
                    eq(102L), isNull(), eq(NotificationActionType.PRODUCT_RESTOCKED), eq("/products/giay-da-bong-nike-mercurial"), anyString()
            );
        }

        @Test
        @DisplayName("TC-INV-04.1: Bật/Tắt Yêu thích sản phẩm (toggleWishlist) -> Thêm mới khi chưa có & Xóa bỏ khi đã tồn tại")
        void toggleWishlist_AddAndRemove_Success() {
            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));

            // Lần 1: Chưa có -> Thêm mới
            when(wishlistRepository.findByUserIdAndProductId(100L, 50L)).thenReturn(Optional.empty());
            when(wishlistRepository.countByUserId(100L)).thenReturn(1L);

            WishlistStatusResponse addRes = customerWishlistService.toggleWishlist(100L, 50L);
            assertTrue(addRes.getIsFavorite());
            assertEquals(1L, addRes.getWishlistCount());
            verify(wishlistRepository, times(1)).save(any(Wishlist.class));

            // Lần 2: Đã có -> Xóa bỏ
            Wishlist existing = Wishlist.builder().id(10L).user(customerUser).product(sampleProduct).build();
            when(wishlistRepository.findByUserIdAndProductId(100L, 50L)).thenReturn(Optional.of(existing));
            when(wishlistRepository.countByUserId(100L)).thenReturn(0L);

            WishlistStatusResponse remRes = customerWishlistService.toggleWishlist(100L, 50L);
            assertFalse(remRes.getIsFavorite());
            assertEquals(0L, remRes.getWishlistCount());
            verify(wishlistRepository, times(1)).delete(existing);
        }

        @Test
        @DisplayName("TC-INV-04.2: Thêm vào Yêu thích (addToWishlist) đảm bảo tính Idempotent & Xóa khỏi Yêu thích (removeFromWishlist)")
        void addToWishlistIdempotent_AndRemoveFromWishlist_Success() {
            when(wishlistRepository.existsByUserIdAndProductId(100L, 50L)).thenReturn(true);

            ApiResponse<Void> addRes = customerWishlistService.addToWishlist(100L, 50L);
            assertNotNull(addRes);
            verify(wishlistRepository, never()).save(any());

            customerWishlistService.removeFromWishlist(100L, 50L);
            verify(wishlistRepository, times(1)).deleteByUserIdAndProductId(100L, 50L);
        }

        @Test
        @DisplayName("TC-INV-04.3: Lấy danh sách Yêu thích có phân trang (getUserWishlist) -> Ánh xạ đúng cờ inStock, tên danh mục mặc định 'AP Sports' và ảnh chính")
        void getUserWishlist_MapsInStockAndDefaultCategoryAndPrimaryImage() {
            sampleProduct.setStatus("in_stock");
            sampleProduct.setCategory(null); // Kiểm tra fallback "AP Sports"
            Wishlist w1 = Wishlist.builder().id(1L).user(customerUser).product(sampleProduct).build();

            ProductImage primaryImg = ProductImage.builder().id(11L).imagePath("primary.png").isPrimary(true).build();
            when(wishlistRepository.findByUserIdOrderByCreatedAtDesc(eq(100L), any()))
                    .thenReturn(new PageImpl<>(List.of(w1)));
            when(productImageRepository.findByProductId(50L)).thenReturn(List.of(primaryImg));

            Page<WishlistResponse> page = customerWishlistService.getUserWishlist(100L, PageRequest.of(0, 10));

            assertEquals(1, page.getTotalElements());
            WishlistResponse item = page.getContent().get(0);
            assertTrue(item.getInStock());
            assertEquals("AP Sports", item.getPrimaryCategoryName());
            assertEquals("primary.png", item.getMainImage());
        }

        @Test
        @DisplayName("TC-INV-04.4: Chặn toggleWishlist / addToWishlist khi userId hoặc productId không tồn tại (404 NOT_FOUND)")
        void wishlist_Fail_UserOrProductNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            AppException exUser = assertThrows(AppException.class,
                    () -> customerWishlistService.toggleWishlist(999L, 50L));
            assertEquals(HttpStatus.NOT_FOUND, exUser.getStatus());

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(999L)).thenReturn(Optional.empty());

            AppException exProd = assertThrows(AppException.class,
                    () -> customerWishlistService.toggleWishlist(100L, 999L));
            assertEquals(HttpStatus.NOT_FOUND, exProd.getStatus());
        }
    }
}
