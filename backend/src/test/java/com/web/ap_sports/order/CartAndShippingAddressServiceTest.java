package com.web.ap_sports.order;

import com.web.ap_sports.dto.request.customer.AddToCartRequest;
import com.web.ap_sports.dto.request.customer.ShippingAddressRequest;
import com.web.ap_sports.dto.request.customer.UpdateCartItemRequest;
import com.web.ap_sports.dto.response.customer.CartItemResponse;
import com.web.ap_sports.dto.response.customer.CartSummaryResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.entity.CartItem;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.ShippingAddress;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CartItemRepository;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.ShippingAddressRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.geocoding.GeoCoordinate;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.customer.impl.CustomerCartServiceImpl;
import com.web.ap_sports.service.customer.impl.ShippingAddressServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Nhóm 1: Quản lý Giỏ hàng & Địa chỉ Giao hàng của Khách hàng
 * (TC-CART-01 -> TC-CART-10 & TC-ADDR-01 -> TC-ADDR-02, gồm 12 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Nhóm 1: Quản lý Giỏ hàng & Địa chỉ Giao hàng Unit Tests (12 Tests)")
class CartAndShippingAddressServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private ShippingAddressRepository shippingAddressRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private GeocodingCascadeService geocodingCascadeService;

    private CustomerCartServiceImpl cartService;
    private ShippingAddressServiceImpl shippingAddressService;

    private User customerUser;
    private User anotherUser;
    private Product sampleProduct;
    private ProductVariant sampleVariant;

    @BeforeEach
    void setUp() {
        cartService = new CustomerCartServiceImpl(
                cartItemRepository,
                userRepository,
                productRepository,
                productVariantRepository,
                productImageRepository
        );

        shippingAddressService = new ShippingAddressServiceImpl(
                shippingAddressRepository,
                userRepository,
                orderRepository,
                geocodingCascadeService
        );

        customerUser = User.builder()
                .id(100L)
                .name("Nguyễn Văn A")
                .email("customer@apsports.com")
                .build();

        anotherUser = User.builder()
                .id(200L)
                .name("Trần Thị B")
                .email("other@apsports.com")
                .build();

        sampleProduct = Product.builder()
                .id(50L)
                .name("Giày Đá Bóng Nike Mercurial Vapor 15")
                .slug("giay-da-bong-nike-mercurial-vapor-15")
                .price(new BigDecimal("1400000"))
                .stock(10)
                .status("in_stock")
                .weight(600)
                .build();

        sampleVariant = ProductVariant.builder()
                .id(10L)
                .product(sampleProduct)
                .sku("NIKE-MV15-42-RED")
                .size("42")
                .color("Đỏ")
                .price(new BigDecimal("1500000"))
                .costPrice(new BigDecimal("950000"))
                .stockQuantity(10)
                .build();
    }

    // =========================================================================
    // PHẦN 1.1: QUẢN LÝ GIỎ HÀNG (TC-CART-01 -> TC-CART-10)
    // =========================================================================
    @Nested
    @DisplayName("Phần 1.1: Nghiệp vụ Giỏ hàng Khách hàng (TC-CART-01 -> TC-CART-10)")
    class CustomerCartTests {

        @Test
        @DisplayName("TC-CART-01: Thêm mới sản phẩm (có biến thể) vào giỏ hàng -> Tạo CartItem mới, bật isSelected = true & tính đúng subtotal")
        void addToCart_NewVariantItem_CreatesCartItemAndCalculatesSubtotal() {
            AddToCartRequest req = AddToCartRequest.builder()
                    .productId(50L)
                    .variantId(10L)
                    .quantity(2)
                    .build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
            when(productVariantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L)).thenReturn(Optional.empty());
            when(productImageRepository.findByProductId(50L)).thenReturn(
                    List.of(ProductImage.builder().id(1L).imagePath("https://img.com/shoe.png").isPrimary(true).build())
            );
            when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> {
                CartItem item = inv.getArgument(0);
                item.setId(1L);
                return item;
            });

            CartItemResponse res = cartService.addToCart(100L, req);

            assertNotNull(res);
            assertEquals(1L, res.getId());
            assertEquals(50L, res.getProductId());
            assertEquals(10L, res.getVariantId());
            assertEquals(2, res.getQuantity());
            assertEquals(new BigDecimal("1500000"), res.getPrice(), "Phải ưu tiên lấy giá riêng của biến thể");
            assertEquals(new BigDecimal("3000000"), res.getSubtotal());
            assertTrue(res.getIsSelected());
            assertTrue(res.getInStock());
            assertEquals("https://img.com/shoe.png", res.getMainImage());
            verify(cartItemRepository, times(1)).save(any(CartItem.class));
        }

        @Test
        @DisplayName("TC-CART-02: Cộng dồn số lượng khi thêm sản phẩm đã tồn tại trong giỏ & Tự động bật lại cờ isSelected = true")
        void addToCart_ExistingVariantItem_AccumulatesQuantityAndSelectsItem() {
            sampleVariant.setStockQuantity(5);
            CartItem existingItem = CartItem.builder()
                    .id(1L)
                    .user(customerUser)
                    .product(sampleProduct)
                    .variant(sampleVariant)
                    .quantity(2)
                    .isSelected(false)
                    .build();

            AddToCartRequest req = AddToCartRequest.builder()
                    .productId(50L)
                    .variantId(10L)
                    .quantity(3)
                    .build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
            when(productVariantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));
            when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L)).thenReturn(Optional.of(existingItem));
            when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());
            when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

            CartItemResponse res = cartService.addToCart(100L, req);

            assertEquals(5, res.getQuantity(), "Số lượng phải cộng dồn từ 2 + 3 = 5");
            assertTrue(res.getIsSelected(), "Thêm lại sản phẩm đã có trong giỏ phải tự động bật isSelected = true");
            assertEquals(new BigDecimal("7500000"), res.getSubtotal());
        }

        @Test
        @DisplayName("TC-CART-03: Chặn thêm vào giỏ khi sản phẩm có danh sách biến thể nhưng không truyền variantId")
        void addToCart_ProductHasVariantsButMissingVariantId_ThrowsBadRequest() {
            AddToCartRequest req = AddToCartRequest.builder()
                    .productId(50L)
                    .variantId(null)
                    .quantity(1)
                    .build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
            when(productVariantRepository.findByProductId(50L)).thenReturn(List.of(sampleVariant));

            AppException ex = assertThrows(AppException.class, () -> cartService.addToCart(100L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("vui lòng chọn phân loại sản phẩm trước khi thêm vào giỏ hàng"));
            verify(cartItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-CART-04: Chặn thêm vào giỏ khi variantId không thuộc về productId được truyền lên")
        void addToCart_VariantDoesNotBelongToProduct_ThrowsBadRequest() {
            Product otherProduct = Product.builder().id(60L).name("Áo Đấu Đội Tuyển").build();
            ProductVariant mismatchedVariant = ProductVariant.builder()
                    .id(99L)
                    .product(otherProduct)
                    .stockQuantity(10)
                    .build();

            AddToCartRequest req = AddToCartRequest.builder()
                    .productId(50L)
                    .variantId(99L)
                    .quantity(1)
                    .build();

            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
            when(productVariantRepository.findById(99L)).thenReturn(Optional.of(mismatchedVariant));

            AppException ex = assertThrows(AppException.class, () -> cartService.addToCart(100L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Biến thể không thuộc sản phẩm này", ex.getMessage());
            verify(cartItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-CART-05: Chặn thêm vào giỏ khi biến thể đã hết hàng (stock <= 0) hoặc số lượng cộng dồn vượt quá tồn kho khả dụng")
        void addToCart_OutOfStockOrExceedsAvailableStock_ThrowsBadRequest() {
            when(userRepository.findById(100L)).thenReturn(Optional.of(customerUser));
            when(productRepository.findById(50L)).thenReturn(Optional.of(sampleProduct));
            when(productVariantRepository.findById(10L)).thenReturn(Optional.of(sampleVariant));

            // Nhánh A: Biến thể có tồn kho = 0
            sampleVariant.setStockQuantity(0);
            AddToCartRequest req1 = AddToCartRequest.builder().productId(50L).variantId(10L).quantity(1).build();

            AppException exOut = assertThrows(AppException.class, () -> cartService.addToCart(100L, req1));
            assertEquals(HttpStatus.BAD_REQUEST, exOut.getStatus());
            assertEquals("Sản phẩm/biến thể đã hết hàng", exOut.getMessage());

            // Nhánh B: Tồn kho = 5, trong giỏ đã có 3, thêm tiếp 3 (tổng 6 > 5)
            sampleVariant.setStockQuantity(5);
            CartItem existing = CartItem.builder().id(1L).user(customerUser).product(sampleProduct).variant(sampleVariant).quantity(3).build();
            when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L)).thenReturn(Optional.of(existing));

            AddToCartRequest req2 = AddToCartRequest.builder().productId(50L).variantId(10L).quantity(3).build();
            AppException exExceed = assertThrows(AppException.class, () -> cartService.addToCart(100L, req2));
            assertEquals(HttpStatus.BAD_REQUEST, exExceed.getStatus());
            assertTrue(exExceed.getMessage().contains("vượt quá tồn kho khả dụng (5)"));
        }

        @Test
        @DisplayName("TC-CART-06: Cập nhật số lượng mặt hàng trong giỏ (updateCartItem) thành công & Chặn khi vượt quá tồn kho")
        void updateCartItem_SuccessAndExceedsStockException() {
            sampleVariant.setStockQuantity(8);
            CartItem cartItem = CartItem.builder()
                    .id(1L)
                    .user(customerUser)
                    .product(sampleProduct)
                    .variant(sampleVariant)
                    .quantity(2)
                    .isSelected(true)
                    .build();

            when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));
            when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());
            when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

            // Nhánh A: Cập nhật hợp lệ lên 6 (<= 8)
            CartItemResponse updated = cartService.updateCartItem(100L, 1L, new UpdateCartItemRequest(6));
            assertEquals(6, updated.getQuantity());
            assertEquals(new BigDecimal("9000000"), updated.getSubtotal());

            // Nhánh B: Cập nhật vượt tồn kho lên 9 (> 8)
            AppException ex = assertThrows(AppException.class,
                    () -> cartService.updateCartItem(100L, 1L, new UpdateCartItemRequest(9)));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Số lượng chọn vượt quá tồn kho khả dụng (8)"));
        }

        @Test
        @DisplayName("TC-CART-07: Bảo mật chống IDOR -> Chặn User khác sửa, xóa hoặc chọn mặt hàng không thuộc giỏ hàng của mình (403 FORBIDDEN)")
        void cartOperations_WhenUserDoesNotOwnCartItem_ThrowsForbidden() {
            CartItem itemOfUser100 = CartItem.builder()
                    .id(1L)
                    .user(customerUser)
                    .product(sampleProduct)
                    .variant(sampleVariant)
                    .quantity(1)
                    .build();

            when(cartItemRepository.findById(1L)).thenReturn(Optional.of(itemOfUser100));

            // User 200 cố tình thao tác trên cartItemId = 1 của User 100
            AppException exUpdate = assertThrows(AppException.class,
                    () -> cartService.updateCartItem(200L, 1L, new UpdateCartItemRequest(2)));
            assertEquals(HttpStatus.FORBIDDEN, exUpdate.getStatus());

            AppException exRemove = assertThrows(AppException.class,
                    () -> cartService.removeCartItem(200L, 1L));
            assertEquals(HttpStatus.FORBIDDEN, exRemove.getStatus());

            AppException exToggle = assertThrows(AppException.class,
                    () -> cartService.toggleSelectItem(200L, 1L));
            assertEquals(HttpStatus.FORBIDDEN, exToggle.getStatus());
        }

        @Test
        @DisplayName("TC-CART-08: Xóa 1 sản phẩm khỏi giỏ (removeCartItem) và Làm trống toàn bộ giỏ hàng (clearCart)")
        void removeCartItem_AndClearCart_DeletesSuccessfully() {
            CartItem cartItem = CartItem.builder().id(1L).user(customerUser).product(sampleProduct).quantity(1).build();
            when(cartItemRepository.findById(1L)).thenReturn(Optional.of(cartItem));

            cartService.removeCartItem(100L, 1L);
            verify(cartItemRepository, times(1)).delete(cartItem);

            cartService.clearCart(100L);
            verify(cartItemRepository, times(1)).deleteAllByUserId(100L);
        }

        @Test
        @DisplayName("TC-CART-09: Đảo trạng thái chọn 1 sản phẩm (toggleSelectItem) & Chọn/Bỏ chọn tất cả (toggleSelectAll)")
        void toggleSelectItem_AndToggleSelectAll_UpdatesSelectionState() {
            CartItem item1 = CartItem.builder().id(1L).user(customerUser).product(sampleProduct).variant(sampleVariant).quantity(1).isSelected(true).build();
            CartItem item2 = CartItem.builder().id(2L).user(customerUser).product(sampleProduct).variant(sampleVariant).quantity(2).isSelected(true).build();

            when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item1));
            when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());
            when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> inv.getArgument(0));

            // Đảo trạng thái item1 từ true -> false
            CartItemResponse toggled = cartService.toggleSelectItem(100L, 1L);
            assertFalse(toggled.getIsSelected());

            // Chọn/Bỏ chọn tất cả
            when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(item1, item2));
            cartService.toggleSelectAll(100L, false);

            assertFalse(item1.getIsSelected());
            assertFalse(item2.getIsSelected());
            verify(cartItemRepository, times(1)).saveAll(anyList());
        }

        @Test
        @DisplayName("TC-CART-10: Xem tóm tắt giỏ hàng (getCart) -> Tính đúng totalItems, totalPrice, parse JSON attributes & fallback weight 500g")
        void getCart_CalculatesSummaryAndParsesVariantAttributesCorrectly() {
            sampleVariant.setAttributes("{\"Kích cỡ\":\"42\",\"Màu sắc\":\"Đỏ Cam\"}");
            Product productWithoutWeight = Product.builder()
                    .id(51L).name("Tất Chống Trượt").slug("tat-chong-truot")
                    .price(new BigDecimal("50000")).stock(20).weight(null).build();

            CartItem item1 = CartItem.builder().id(1L).user(customerUser).product(sampleProduct).variant(sampleVariant).quantity(2).isSelected(true).build();
            CartItem item2 = CartItem.builder().id(2L).user(customerUser).product(productWithoutWeight).variant(null).quantity(3).isSelected(true).build();

            when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(item1, item2));
            when(productImageRepository.findByProductId(anyLong())).thenReturn(Collections.emptyList());

            CartSummaryResponse summary = cartService.getCart(100L);

            assertEquals(2, summary.getItems().size());
            assertEquals(5, summary.getTotalItems(), "Tổng số lượng = 2 + 3 = 5");
            // 2 * 1,500,000 + 3 * 50,000 = 3,150,000
            assertEquals(new BigDecimal("3150000"), summary.getTotalPrice());
            assertEquals("42 | Đỏ Cam", summary.getItems().get(0).getVariantName());
            assertEquals(600, summary.getItems().get(0).getWeight());
            assertEquals(500, summary.getItems().get(1).getWeight(), "Sản phẩm không có weight phải mặc định là 500g");
        }
    }

    // =========================================================================
    // PHẦN 1.2: QUẢN LÝ ĐỊA CHỈ GIAO HÀNG (TC-ADDR-01 -> TC-ADDR-02)
    // =========================================================================
    @Nested
    @DisplayName("Phần 1.2: Nghiệp vụ Địa chỉ Giao hàng & Geocoding (TC-ADDR-01 -> TC-ADDR-02)")
    class ShippingAddressTests {

        @Test
        @DisplayName("TC-ADDR-01: Thêm địa chỉ đầu tiên tự động làm mặc định, reset mặc định cũ khi thêm địa chỉ mới & tự động Geocode tọa độ")
        void createAddress_FirstAddressDefault_ResetsOldDefaultAndGeocodes() {
            when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
            when(shippingAddressRepository.countByUserId(100L)).thenReturn(0L);
            when(shippingAddressRepository.save(any(ShippingAddress.class))).thenAnswer(inv -> {
                ShippingAddress addr = inv.getArgument(0);
                if (addr.getId() == null) addr.setId(10L);
                return addr;
            });
            when(geocodingCascadeService.geocode(anyString()))
                    .thenReturn(Optional.of(new GeoCoordinate(10.0305, 105.7828)));

            ShippingAddressRequest req1 = ShippingAddressRequest.builder()
                    .fullName("Nguyễn Văn A")
                    .phone("0912345678")
                    .address("Đường 3/2, Phường Xuân Khánh")
                    .city("Quận Ninh Kiều, Cần Thơ")
                    .provinceId(92)
                    .districtId(1442)
                    .wardCode("21211")
                    .isDefault(false) // Dù gửi false nhưng vì count == 0 nên phải tự động thành true
                    .build();

            ShippingAddressResponse res1 = shippingAddressService.createAddress("customer@apsports.com", req1);

            assertTrue(res1.isDefault(), "Địa chỉ đầu tiên của khách hàng bắt buộc phải được gán làm mặc định");
            assertEquals(10.0305, res1.getLatitude());
            assertEquals(105.7828, res1.getLongitude());
            verify(shippingAddressRepository, never()).resetDefaultAddressByUserId(100L);

            // Tạo tiếp địa chỉ thứ 2 với isDefault = true -> Phải gọi resetDefaultAddressByUserId
            when(shippingAddressRepository.countByUserId(100L)).thenReturn(1L);
            req1.setIsDefault(true);
            shippingAddressService.createAddress("customer@apsports.com", req1);
            verify(shippingAddressRepository, times(1)).resetDefaultAddressByUserId(100L);
        }

        @Test
        @DisplayName("TC-ADDR-02: Xóa địa chỉ giao hàng -> Chặn xóa nếu đã từng dùng đặt hàng & Tự động đôn địa chỉ kế tiếp làm mặc định khi xóa địa chỉ mặc định")
        void deleteAddress_PreventsDeletingUsedAddress_AndPromotesNextDefault() {
            ShippingAddress defaultAddr = ShippingAddress.builder()
                    .id(10L)
                    .user(customerUser)
                    .fullName("Nguyễn Văn A")
                    .isDefault(true)
                    .build();
            ShippingAddress backupAddr = ShippingAddress.builder()
                    .id(11L)
                    .user(customerUser)
                    .fullName("Nguyễn Văn A (Cơ quan)")
                    .isDefault(false)
                    .build();

            when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
            when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(defaultAddr));

            // Nhánh A: Địa chỉ đã từng dùng trong đơn hàng -> Chặn xóa
            when(orderRepository.existsByShippingAddressId(10L)).thenReturn(true);
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> shippingAddressService.deleteAddress("customer@apsports.com", 10L));
            assertEquals("Địa chỉ này đã từng được sử dụng để đặt hàng nên không thể xóa.", ex.getMessage());
            verify(shippingAddressRepository, never()).delete(any());

            // Nhánh B: Địa chỉ chưa dùng đặt hàng, đang là mặc định -> Xóa và đôn backupAddr lên làm mặc định
            when(orderRepository.existsByShippingAddressId(10L)).thenReturn(false);
            when(shippingAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(100L))
                    .thenReturn(List.of(backupAddr));

            shippingAddressService.deleteAddress("customer@apsports.com", 10L);

            verify(shippingAddressRepository, times(1)).delete(defaultAddr);
            assertTrue(backupAddr.isDefault(), "Địa chỉ còn lại đầu tiên phải được tự động gán làm mặc định");
            verify(shippingAddressRepository, times(1)).save(backupAddr);
        }
    }
}
