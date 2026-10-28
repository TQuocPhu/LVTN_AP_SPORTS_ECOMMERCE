package com.web.ap_sports.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.admin.CreateProductRequest;
import com.web.ap_sports.dto.request.admin.UpdateProductRequest;
import com.web.ap_sports.dto.request.admin.VariantRequest;
import com.web.ap_sports.dto.response.common.ProductDetailResponse;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.dto.response.warehouse.InventoryTransactionResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.InventoryTransaction;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.Supplier;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.InventoryTransactionRepository;
import com.web.ap_sports.repository.OrderItemRepository;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.repository.SupplierRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.search.HybridSearchEngineService;
import com.web.ap_sports.service.admin.impl.AdminProductServiceImpl;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.customer.impl.CustomerProductServiceImpl;
import com.web.ap_sports.service.warehouse.WarehouseInventoryService;
import com.web.ap_sports.service.warehouse.WarehouseImportRequestService;
import com.web.ap_sports.util.VariantAttributeUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Quản lý Sản phẩm & Biến thể Sản phẩm (Phần 3: TC-PROD-01.1 -> TC-PROD-08.1, gồm 24 Unit Tests).
 * Bao phủ: AdminProductServiceImpl, CustomerProductServiceImpl & VariantAttributeUtil.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Product & Variant Management Service Unit Tests (Phần 3 - 24 Tests)")
class ProductAndVariantServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private ProductImageRepository imageRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private WarehouseInventoryService warehouseInventoryService;
    @Mock
    private WarehouseImportRequestService importRequestService;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private HybridSearchEngineService hybridSearchEngineService;

    private ObjectMapper objectMapper;
    private AdminProductServiceImpl adminProductService;
    private CustomerProductServiceImpl customerProductService;

    private User adminUser;
    private User staffUser;
    private Supplier defaultSupplier;
    private Category mainCategory;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        adminProductService = new AdminProductServiceImpl(
                productRepository,
                variantRepository,
                imageRepository,
                categoryRepository,
                userRepository,
                supplierRepository,
                transactionRepository,
                orderItemRepository,
                warehouseInventoryService,
                importRequestService,
                objectMapper,
                cloudinaryService
        );
        customerProductService = new CustomerProductServiceImpl(
                productRepository,
                variantRepository,
                imageRepository,
                hybridSearchEngineService,
                objectMapper
        );

        Role adminRole = Role.builder().id(1L).name("ADMIN").build();
        Role staffRole = Role.builder().id(2L).name("STAFF").build();

        adminUser = User.builder().id(1L).email("admin@apsports.com").role(adminRole).build();
        staffUser = User.builder().id(2L).email("staff@apsports.com").role(staffRole).build();
        defaultSupplier = Supplier.builder().id(1L).name("Nike Vietnam Distribution").code("SUP-NIKE").build();
        mainCategory = Category.builder().id(5L).name("Giày Bóng Đá").slug("giay-bong-da").build();
    }

    // =========================================================================
    // NHÓM 3.1: KHỞI TẠO SẢN PHẨM, BIẾN THỂ & PHÂN QUYỀN LẬP PHIẾU NHẬP KHO (10 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 3.1: Khởi tạo Sản phẩm, Biến thể & Phân quyền Lập Phiếu Nhập Kho (TC-PROD-01 -> TC-PROD-03)")
    class CreateProductAndVariantTests {

        @Test
        @DisplayName("TC-PROD-01.1: Admin tạo sản phẩm mới có tồn kho ban đầu (stockQuantity > 0) -> Tự động lập Phiếu nhập kho PNK-...")
        void createProduct_AdminWithInitialStock_AutoCreatesImportTransaction() {
            VariantRequest v1 = VariantRequest.builder()
                    .sku("NIKE-RED-42")
                    .color("Đỏ")
                    .size("42")
                    .price(new BigDecimal("1500000"))
                    .costPrice(new BigDecimal("1000000"))
                    .stockQuantity(10)
                    .images(List.of("https://img.com/v1.png"))
                    .build();
            VariantRequest v2 = VariantRequest.builder()
                    .sku("NIKE-BLK-43")
                    .color("Đen")
                    .size("43")
                    .price(new BigDecimal("1500000"))
                    .costPrice(new BigDecimal("1000000"))
                    .stockQuantity(0)
                    .build();

            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Giày Đá Bóng Nike Mercurial")
                    .categoryIds(Set.of(5L))
                    .primaryCategoryId(5L)
                    .price(new BigDecimal("1500000"))
                    .unit("Đôi")
                    .weight(600)
                    .mainImage("https://img.com/main.png")
                    .supplierId(1L)
                    .importNote("Nhập lô hàng khai trương")
                    .variants(List.of(v1, v2))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(supplierRepository.findById(1L)).thenReturn(Optional.of(defaultSupplier));
            when(cloudinaryService.uploadBase64OrUrlBatch(anyList(), anyString())).thenReturn(Map.of());
            when(cloudinaryService.uploadBase64OrUrl(anyString(), anyString())).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.existsBySlug("giay-da-bong-nike-mercurial")).thenReturn(false);
            when(variantRepository.existsBySku(anyString())).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));

            Product savedProduct = Product.builder()
                    .id(100L)
                    .name("Giày Đá Bóng Nike Mercurial")
                    .slug("giay-da-bong-nike-mercurial")
                    .category(mainCategory)
                    .categories(Set.of(mainCategory))
                    .price(new BigDecimal("1500000"))
                    .stock(10)
                    .status("in_stock")
                    .unit("Đôi")
                    .weight(600)
                    .build();

            when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
            when(productRepository.findById(100L)).thenReturn(Optional.of(savedProduct));
            when(variantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> {
                ProductVariant pv = inv.getArgument(0);
                pv.setId(pv.getSku().equals("NIKE-RED-42") ? 201L : 202L);
                return pv;
            });
            when(transactionRepository.save(any(InventoryTransaction.class))).thenAnswer(inv -> {
                InventoryTransaction tx = inv.getArgument(0);
                tx.setId(900L);
                return tx;
            });
            when(warehouseInventoryService.getTransactionById(900L))
                    .thenReturn(InventoryTransactionResponse.builder().id(900L).code("PNK-TEST").quantity(10).build());

            ProductDetailResponse res = adminProductService.createProduct(req, "admin@apsports.com");

            assertNotNull(res);
            assertEquals(10, res.getTotalStock());
            assertEquals("in_stock", res.getStatus());
            assertNotNull(res.getInitialImportTicketCode());
            assertTrue(res.getInitialImportTicketCode().startsWith("PNK-"));
            assertNotNull(res.getInitialImportTransaction());

            // Chỉ lưu phiếu nhập kho cho biến thể V1 có stockQuantity = 10 (> 0)
            ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
            verify(transactionRepository, times(1)).save(txCaptor.capture());
            assertEquals(10, txCaptor.getValue().getQuantity());
            assertEquals(InventoryTransaction.TransactionType.IMPORT, txCaptor.getValue().getType());
        }

        @Test
        @DisplayName("TC-PROD-01.2: Admin tạo sản phẩm mới nhưng tất cả biến thể đều có stockQuantity = 0 -> Trạng thái out_of_stock & Không sinh phiếu nhập kho")
        void createProduct_ZeroInitialStock_SetsOutOfStockAndNoImportTicket() {
            VariantRequest v1 = VariantRequest.builder()
                    .sku("NIKE-ZERO-01")
                    .price(new BigDecimal("500000"))
                    .costPrice(new BigDecimal("300000"))
                    .stockQuantity(0)
                    .build();

            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Áo Tập Thể Thao")
                    .categoryIds(Set.of(5L))
                    .price(new BigDecimal("500000"))
                    .unit(null) // Kiểm tra mặc định "Cái"
                    .weight(null) // Kiểm tra mặc định 500g
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(productRepository.existsBySlug(anyString())).thenReturn(false);
            when(variantRepository.existsBySku(anyString())).thenReturn(false);
            when(categoryRepository.findAllById(any())).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));

            ArgumentCaptor<Product> prodCaptor = ArgumentCaptor.forClass(Product.class);
            when(productRepository.save(prodCaptor.capture())).thenAnswer(inv -> {
                Product p = inv.getArgument(0);
                p.setId(101L);
                return p;
            });
            when(productRepository.findById(101L)).thenAnswer(inv -> Optional.of(prodCaptor.getValue()));
            when(variantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));

            ProductDetailResponse res = adminProductService.createProduct(req, "admin@apsports.com");

            assertEquals(0, res.getTotalStock());
            assertEquals("out_of_stock", res.getStatus());
            assertEquals("Cái", res.getUnit());
            assertEquals(500, res.getWeight());
            assertNull(res.getInitialImportTicketCode());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-PROD-02.1: Chặn tuyệt đối Nhân viên (STAFF) gửi stockQuantity > 0 khi tạo sản phẩm mới (403 FORBIDDEN)")
        void createProduct_Fail_StaffAttemptsInitialStock() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-1").stockQuantity(5).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Sản phẩm Staff")
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("staff@apsports.com")).thenReturn(Optional.of(staffUser));

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "staff@apsports.com"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
            assertEquals("Tài khoản Nhân viên (Staff) không có quyền tự lập phiếu nhập kho ban đầu!", ex.getMessage());
            verify(productRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-PROD-02.2: Chặn tuyệt đối Nhân viên (STAFF) gửi supplierId != null dù stockQuantity = 0 (403 FORBIDDEN)")
        void createProduct_Fail_StaffProvidesSupplierId() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-1").stockQuantity(0).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Sản phẩm Staff")
                    .supplierId(1L)
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("staff@apsports.com")).thenReturn(Optional.of(staffUser));

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "staff@apsports.com"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        }

        @Test
        @DisplayName("TC-PROD-02.3: Nhân viên (STAFF) tạo sản phẩm hợp lệ khi stockQuantity = 0 và supplierId = null")
        void createProduct_Success_StaffWithZeroStock() {
            VariantRequest v1 = VariantRequest.builder()
                    .sku("STAFF-SKU-01")
                    .price(new BigDecimal("300000"))
                    .costPrice(new BigDecimal("200000"))
                    .stockQuantity(0)
                    .build();

            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Băng Bảo Vệ Cổ Chân")
                    .categoryIds(Set.of(5L))
                    .price(new BigDecimal("300000"))
                    .unit("Đôi")
                    .supplierId(null)
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("staff@apsports.com")).thenReturn(Optional.of(staffUser));
            when(productRepository.existsBySlug(anyString())).thenReturn(false);
            when(variantRepository.existsBySku(anyString())).thenReturn(false);
            when(categoryRepository.findAllById(any())).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
                Product p = inv.getArgument(0);
                p.setId(102L);
                return p;
            });
            when(productRepository.findById(102L)).thenAnswer(inv -> Optional.of( Product.builder()
                    .id(102L).name("Băng Bảo Vệ Cổ Chân").stock(0).status("out_of_stock").categories(Set.of(mainCategory)).build()));
            when(variantRepository.save(any(ProductVariant.class))).thenAnswer(inv -> inv.getArgument(0));

            ProductDetailResponse res = adminProductService.createProduct(req, "staff@apsports.com");

            assertEquals(0, res.getTotalStock());
            assertEquals("out_of_stock", res.getStatus());
            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-PROD-02.4: Chặn Admin/Warehouse tạo sản phẩm có stockQuantity > 0 nhưng bỏ trống supplierId")
        void createProduct_Fail_AdminInitialStockWithoutSupplierId() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-1").stockQuantity(10).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Sản phẩm thiếu NCC")
                    .supplierId(null)
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "admin@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Vui lòng chọn Nhà cung cấp để lập phiếu nhập kho cho sản phẩm mới!", ex.getMessage());
        }

        @Test
        @DisplayName("TC-PROD-02.5: Chặn Admin/Warehouse tạo sản phẩm có stockQuantity > 0 nhưng supplierId không tồn tại trong DB")
        void createProduct_Fail_SupplierNotFoundInDb() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-1").stockQuantity(10).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Sản phẩm NCC ảo")
                    .supplierId(999L)
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(supplierRepository.findById(999L)).thenReturn(Optional.empty());

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "admin@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Nhà cung cấp đã chọn không tồn tại trên hệ thống!", ex.getMessage());
        }

        @Test
        @DisplayName("TC-PROD-03.1: Chặn tạo sản phẩm khi Slug đã tồn tại trong hệ thống")
        void createProduct_Fail_DuplicateSlug() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-1").stockQuantity(0).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Giày Nike")
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(productRepository.existsBySlug("giay-nike")).thenReturn(true);

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "admin@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Slug sản phẩm 'giay-nike' đã tồn tại"));
        }

        @Test
        @DisplayName("TC-PROD-03.2: Chặn tạo sản phẩm khi Biến thể có mã SKU trùng trong DB hoặc trùng nội bộ trong cùng Request (Không upload ảnh mồ côi)")
        void createProduct_Fail_DuplicateVariantSku() {
            VariantRequest v1 = VariantRequest.builder().sku("DUP-SKU-01").stockQuantity(0).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Giày Mới")
                    .mainImage("data:image/png;base64,xxx")
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(productRepository.existsBySlug("giay-moi")).thenReturn(false);
            when(variantRepository.existsBySku("DUP-SKU-01")).thenReturn(true);

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "admin@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Mã SKU 'DUP-SKU-01' đã tồn tại trên hệ thống.", ex.getMessage());

            // Nhánh 2: Trùng SKU ngay trong danh sách variants gửi lên cùng 1 request
            VariantRequest dupA = VariantRequest.builder().sku("SAME-SKU").stockQuantity(0).build();
            VariantRequest dupB = VariantRequest.builder().sku(" same-sku ").stockQuantity(0).build();
            CreateProductRequest reqInternalDup = CreateProductRequest.builder()
                    .name("Giày Mới")
                    .mainImage("data:image/png;base64,xxx")
                    .variants(List.of(dupA, dupB))
                    .build();
            when(variantRepository.existsBySku("SAME-SKU")).thenReturn(false);

            AppException exInternal = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(reqInternalDup, "admin@apsports.com"));
            assertEquals(HttpStatus.BAD_REQUEST, exInternal.getStatus());
            assertTrue(exInternal.getMessage().contains("bị trùng lặp ngay trong danh sách biến thể gửi lên"));

            // Đảm bảo không gọi upload ảnh lên Cloudinary khi dữ liệu đầu vào không hợp lệ
            verify(cloudinaryService, never()).uploadBase64OrUrlBatch(anyList(), anyString());
        }

        @Test
        @DisplayName("TC-PROD-03.3: Chặn tạo sản phẩm khi categoryIds rỗng/không tồn tại trong DB")
        void createProduct_Fail_InvalidCategories() {
            VariantRequest v1 = VariantRequest.builder().sku("SKU-01").stockQuantity(0).build();
            CreateProductRequest req = CreateProductRequest.builder()
                    .name("Giày Mới")
                    .categoryIds(Set.of(999L))
                    .variants(List.of(v1))
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(productRepository.existsBySlug("giay-moi")).thenReturn(false);
            when(variantRepository.existsBySku("SKU-01")).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(999L))).thenReturn(Collections.emptyList());

            AppException ex = assertThrows(AppException.class,
                    () -> adminProductService.createProduct(req, "admin@apsports.com"));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Danh mục đã chọn không hợp lệ.", ex.getMessage());
        }
    }

    // =========================================================================
    // NHÓM 3.2: CẬP NHẬT SẢN PHẨM, KHÓA TỒN KHO, BẢO VỆ BIẾN THỂ & XÓA SẢN PHẨM (14 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 3.2: Cập nhật Sản phẩm, Khóa Tồn Kho (Locked Stock Rule), Bảo vệ Biến thể & Xóa Sản phẩm (TC-PROD-04 -> TC-PROD-08)")
    class UpdateDeleteAndVariantAttributeTests {

        private Product existingProduct;
        private ProductVariant existingVar1;
        private ProductVariant existingVar2;

        @BeforeEach
        void initExistingProduct() {
            existingProduct = Product.builder()
                    .id(50L)
                    .name("Giày Cũ")
                    .slug("giay-cu")
                    .category(mainCategory)
                    .categories(Set.of(mainCategory))
                    .price(new BigDecimal("1000000"))
                    .stock(30)
                    .status("in_stock")
                    .unit("Đôi")
                    .weight(500)
                    .build();

            existingVar1 = ProductVariant.builder()
                    .id(101L)
                    .product(existingProduct)
                    .sku("OLD-SKU-1")
                    .stockQuantity(30)
                    .price(new BigDecimal("1000000"))
                    .costPrice(new BigDecimal("700000"))
                    .build();

            existingVar2 = ProductVariant.builder()
                    .id(102L)
                    .product(existingProduct)
                    .sku("OLD-SKU-2")
                    .stockQuantity(5)
                    .price(new BigDecimal("1000000"))
                    .costPrice(new BigDecimal("700000"))
                    .build();
        }

        @Test
        @DisplayName("TC-PROD-04.1: Quy tắc Khóa Tồn Kho (LOCKED STOCK RULE) khi Cập nhật sản phẩm -> Giữ nguyên tồn kho biến thể cũ & Gán 0 cho biến thể mới")
        void updateProduct_EnforcesLockedStockRule_Success() {
            // Biến thể cũ id=101L đang có stock=30 trong DB, nhưng request cố tình gửi stockQuantity=999
            VariantRequest updateOldVar = VariantRequest.builder()
                    .id(101L)
                    .sku("OLD-SKU-1")
                    .price(new BigDecimal("1200000"))
                    .costPrice(new BigDecimal("800000"))
                    .stockQuantity(999)
                    .build();
            // Biến thể mới id=null cố tình gửi stockQuantity=100
            VariantRequest addNewVar = VariantRequest.builder()
                    .id(null)
                    .sku("NEW-SKU-3")
                    .price(new BigDecimal("1300000"))
                    .costPrice(new BigDecimal("850000"))
                    .stockQuantity(100)
                    .build();

            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Giày Đã Cập Nhật")
                    .slug("giay-da-cap-nhat")
                    .categoryIds(Set.of(5L))
                    .primaryCategoryId(5L)
                    .price(new BigDecimal("1200000"))
                    .unit("Đôi")
                    .variants(List.of(updateOldVar, addNewVar))
                    .build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-da-cap-nhat", 50L)).thenReturn(false);
            when(variantRepository.existsBySkuAndIdNot("OLD-SKU-1", 101L)).thenReturn(false);
            when(variantRepository.existsBySku("NEW-SKU-3")).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(existingVar1));
            when(variantRepository.findById(101L)).thenReturn(Optional.of(existingVar1));

            ArgumentCaptor<ProductVariant> varCaptor = ArgumentCaptor.forClass(ProductVariant.class);
            when(variantRepository.save(varCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

            adminProductService.updateProduct(50L, req);

            List<ProductVariant> savedVariants = varCaptor.getAllValues();
            assertEquals(2, savedVariants.size());
            assertEquals(30, savedVariants.get(0).getStockQuantity(), "Biến thể cũ phải giữ nguyên tồn kho 30 từ DB");
            assertEquals(new BigDecimal("1200000"), savedVariants.get(0).getPrice());
            assertEquals(0, savedVariants.get(1).getStockQuantity(), "Biến thể mới thêm khi update phải có tồn kho = 0");
            assertEquals(30, existingProduct.getStock(), "Tổng tồn kho sản phẩm = 30 + 0 = 30");
        }

        @Test
        @DisplayName("TC-PROD-04.2: Cập nhật sản phẩm -> Thay thế ảnh đại diện (isPrimary = true) và làm mới danh sách ảnh riêng của từng Biến thể")
        void updateProduct_ReplacesPrimaryImageAndVariantImages() {
            ProductImage oldPrimaryImg = ProductImage.builder().id(1L).product(existingProduct).isPrimary(true).imagePath("old_main.png").build();
            ProductImage oldSecondaryImg = ProductImage.builder().id(2L).product(existingProduct).isPrimary(false).imagePath("old_sub.png").build();
            List<ProductImage> oldVarImgs = List.of(ProductImage.builder().id(3L).variant(existingVar1).imagePath("old_v1.png").build());

            VariantRequest vr = VariantRequest.builder()
                    .id(101L)
                    .sku("OLD-SKU-1")
                    .price(new BigDecimal("1000000"))
                    .costPrice(new BigDecimal("700000"))
                    .images(List.of("new_v1_a.png", "new_v1_b.png"))
                    .build();

            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Giày Cũ")
                    .slug("giay-cu")
                    .categoryIds(Set.of(5L))
                    .price(new BigDecimal("1000000"))
                    .mainImage("new_main.png")
                    .variants(List.of(vr))
                    .build();

            when(cloudinaryService.uploadBase64OrUrlBatch(anyList(), anyString())).thenReturn(Map.of());
            when(cloudinaryService.uploadBase64OrUrl(anyString(), anyString())).thenAnswer(inv -> inv.getArgument(0));
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-cu", 50L)).thenReturn(false);
            when(variantRepository.existsBySkuAndIdNot("OLD-SKU-1", 101L)).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(existingVar1));
            when(variantRepository.findById(101L)).thenReturn(Optional.of(existingVar1));
            when(variantRepository.save(any(ProductVariant.class))).thenReturn(existingVar1);
            when(imageRepository.findByProductId(50L)).thenReturn(List.of(oldPrimaryImg, oldSecondaryImg));
            when(imageRepository.findByVariantId(101L)).thenReturn(oldVarImgs);

            adminProductService.updateProduct(50L, req);

            verify(imageRepository, times(1)).delete(oldPrimaryImg);
            verify(imageRepository, never()).delete(oldSecondaryImg);
            verify(imageRepository, times(1)).deleteAll(oldVarImgs);
            // 1 ảnh main mới + 2 ảnh variant mới = 3 lần save ảnh
            verify(imageRepository, times(3)).save(any(ProductImage.class));
        }

        @Test
        @DisplayName("TC-PROD-04.3: Chặn cập nhật sản phẩm khi Slug mới trùng với sản phẩm khác (existsBySlugAndIdNot)")
        void updateProduct_Fail_DuplicateSlugWithOtherProduct() {
            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Tên Mới")
                    .slug("slug-bi-trung")
                    .build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("slug-bi-trung", 50L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminProductService.updateProduct(50L, req));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã trùng với sản phẩm khác"));
        }

        @Test
        @DisplayName("TC-PROD-04.4: Chặn cập nhật sản phẩm khi mã SKU của biến thể mới hoặc biến thể cũ bị trùng lặp")
        void updateProduct_Fail_DuplicateVariantSkuOnNewOrExistingVariant() {
            // Nhánh 1: Biến thể mới (id == null) trùng SKU
            VariantRequest newDupVar = VariantRequest.builder().id(null).sku("DUP-SKU").build();
            UpdateProductRequest req1 = UpdateProductRequest.builder()
                    .name("Giày").slug("giay-cu").variants(List.of(newDupVar)).build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-cu", 50L)).thenReturn(false);
            when(variantRepository.existsBySku("DUP-SKU")).thenReturn(true);

            assertThrows(AppException.class, () -> adminProductService.updateProduct(50L, req1));

            // Nhánh 2: Biến thể cũ (id = 101L) đổi sang SKU trùng với biến thể khác
            VariantRequest oldDupVar = VariantRequest.builder().id(101L).sku("OTHER-VAR-SKU").build();
            UpdateProductRequest req2 = UpdateProductRequest.builder()
                    .name("Giày").slug("giay-cu").variants(List.of(oldDupVar)).build();

            when(variantRepository.existsBySkuAndIdNot("OTHER-VAR-SKU", 101L)).thenReturn(true);

            AppException ex2 = assertThrows(AppException.class, () -> adminProductService.updateProduct(50L, req2));
            assertTrue(ex2.getMessage().contains("đã trùng với biến thể khác"));
        }

        @Test
        @DisplayName("TC-PROD-05.1: Cập nhật sản phẩm -> Xóa thành công biến thể cũ không còn trong Request khi chưa phát sinh Đơn hàng và Phiếu kho")
        void updateProduct_DeletesRemovedVariant_WhenNoOrdersOrTransactions() {
            VariantRequest keepVar1Only = VariantRequest.builder()
                    .id(101L).sku("OLD-SKU-1").price(BigDecimal.TEN).costPrice(BigDecimal.ONE).build();
            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Giày Cũ").slug("giay-cu").categoryIds(Set.of(5L))
                    .price(BigDecimal.TEN).variants(List.of(keepVar1Only)).build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-cu", 50L)).thenReturn(false);
            when(variantRepository.existsBySkuAndIdNot("OLD-SKU-1", 101L)).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(existingVar1, existingVar2));
            when(orderItemRepository.existsByVariantId(102L)).thenReturn(false);
            when(transactionRepository.existsByVariantId(102L)).thenReturn(false);
            when(variantRepository.findById(101L)).thenReturn(Optional.of(existingVar1));
            when(variantRepository.save(any())).thenReturn(existingVar1);

            adminProductService.updateProduct(50L, req);

            verify(variantRepository, times(1)).delete(existingVar2);
        }

        @Test
        @DisplayName("TC-PROD-05.2: Chặn xóa biến thể cũ trong lúc Cập nhật sản phẩm nếu biến thể đó đã phát sinh trong Đơn hàng của khách")
        void updateProduct_Fail_RemovedVariantHasOrderHistory() {
            VariantRequest keepVar1Only = VariantRequest.builder().id(101L).sku("OLD-SKU-1").build();
            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Giày Cũ").slug("giay-cu").categoryIds(Set.of(5L)).variants(List.of(keepVar1Only)).build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-cu", 50L)).thenReturn(false);
            when(variantRepository.existsBySkuAndIdNot("OLD-SKU-1", 101L)).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(existingVar1, existingVar2));
            when(orderItemRepository.existsByVariantId(102L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminProductService.updateProduct(50L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã phát sinh trong đơn hàng của khách, không thể xóa bỏ"));
            verify(variantRepository, never()).delete(any());
        }

        @Test
        @DisplayName("TC-PROD-05.3: Chặn xóa biến thể cũ trong lúc Cập nhật sản phẩm nếu biến thể đó đã phát sinh Phiếu nhập/xuất kho")
        void updateProduct_Fail_RemovedVariantHasInventoryTransactionHistory() {
            VariantRequest keepVar1Only = VariantRequest.builder().id(101L).sku("OLD-SKU-1").build();
            UpdateProductRequest req = UpdateProductRequest.builder()
                    .name("Giày Cũ").slug("giay-cu").categoryIds(Set.of(5L)).variants(List.of(keepVar1Only)).build();

            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.existsBySlugAndIdNot("giay-cu", 50L)).thenReturn(false);
            when(variantRepository.existsBySkuAndIdNot("OLD-SKU-1", 101L)).thenReturn(false);
            when(categoryRepository.findAllById(Set.of(5L))).thenReturn(List.of(mainCategory));
            when(categoryRepository.findById(5L)).thenReturn(Optional.of(mainCategory));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(existingVar1, existingVar2));
            when(orderItemRepository.existsByVariantId(102L)).thenReturn(false);
            when(transactionRepository.existsByVariantId(102L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminProductService.updateProduct(50L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã phát sinh phiếu nhập/xuất kho, không thể xóa bỏ"));
            verify(variantRepository, never()).delete(any());
        }

        @Test
        @DisplayName("TC-PROD-06.1: Đảo trạng thái sản phẩm (toggleProductStatus) qua lại giữa in_stock, discontinued và out_of_stock")
        void toggleProductStatus_AllTransitions_Success() {
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

            // 1. in_stock -> discontinued
            ProductResponse res1 = adminProductService.toggleProductStatus(50L);
            assertEquals("discontinued", res1.getStatus());

            // 2. discontinued -> in_stock
            ProductResponse res2 = adminProductService.toggleProductStatus(50L);
            assertEquals("in_stock", res2.getStatus());

            // 3. out_of_stock -> in_stock
            existingProduct.setStatus("out_of_stock");
            ProductResponse res3 = adminProductService.toggleProductStatus(50L);
            assertEquals("in_stock", res3.getStatus());
        }

        @Test
        @DisplayName("TC-PROD-06.2: Xóa cứng sản phẩm (deleteProduct) thành công theo đúng thứ tự (Ảnh -> Biến thể -> Sản phẩm)")
        void deleteProduct_Success_InOrder() {
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(orderItemRepository.existsByProductId(50L)).thenReturn(false);
            when(transactionRepository.existsByVariant_ProductId(50L)).thenReturn(false);

            adminProductService.deleteProduct(50L);

            InOrder inOrder = inOrder(imageRepository, variantRepository, productRepository);
            inOrder.verify(imageRepository).deleteByProductId(50L);
            inOrder.verify(variantRepository).deleteByProductId(50L);
            inOrder.verify(productRepository).delete(existingProduct);
        }

        @Test
        @DisplayName("TC-PROD-06.3: Chặn xóa cứng sản phẩm khi đã có lịch sử Đơn hàng (existsByProductId == true)")
        void deleteProduct_Fail_HasOrderHistory() {
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(orderItemRepository.existsByProductId(50L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminProductService.deleteProduct(50L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã có lịch sử đơn hàng, không thể xóa khỏi hệ thống"));
            verify(productRepository, never()).delete(any(Product.class));
        }

        @Test
        @DisplayName("TC-PROD-06.4: Chặn xóa cứng sản phẩm khi đã phát sinh Giao dịch kho (existsByVariant_ProductId == true)")
        void deleteProduct_Fail_HasTransactionHistory() {
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            when(orderItemRepository.existsByProductId(50L)).thenReturn(false);
            when(transactionRepository.existsByVariant_ProductId(50L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminProductService.deleteProduct(50L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã phát sinh giao dịch kho, không thể xóa khỏi hệ thống"));
            verify(productRepository, never()).delete(any(Product.class));
        }

        @Test
        @DisplayName("TC-PROD-07.1: Phân tách tự động thuộc tính Biến thể đa cấp ngăn cách bởi dấu '|' (resolveAttributesJson & Customer variantName)")
        void resolveAttributesJson_MultiPartPipeDelimiter_Success() {
            ProductVariant pipeVariant = ProductVariant.builder()
                    .id(301L)
                    .product(existingProduct)
                    .sku("PIPE-SKU-01")
                    .color("Xanh Neon")
                    .size("42 | Đinh TF | Cổ Cao")
                    .attributes(null)
                    .price(new BigDecimal("1500000"))
                    .stockQuantity(5)
                    .build();

            when(productRepository.findBySlug("giay-cu")).thenReturn(Optional.of(existingProduct));
            when(variantRepository.findByProductId(50L)).thenReturn(List.of(pipeVariant));
            when(imageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());

            ProductDetailResponse detail = customerProductService.getProductBySlugOrId("giay-cu");

            assertEquals(1, detail.getVariants().size());
            String attrsJson = detail.getVariants().get(0).getAttributes();
            String variantName = detail.getVariants().get(0).getVariantName();

            assertNotNull(attrsJson);
            assertTrue(attrsJson.contains("\"Màu sắc\":\"Xanh Neon\""));
            assertTrue(attrsJson.contains("\"Kích thước / Size\":\"42\""));
            assertTrue(attrsJson.contains("\"Thuộc tính bổ sung\":\"Đinh TF\""));
            assertTrue(attrsJson.contains("\"Thuộc tính 3\":\"Cổ Cao\""));
            assertEquals("Xanh Neon | 42 | Đinh TF | Cổ Cao", variantName);
        }

        @Test
        @DisplayName("TC-PROD-07.2: Kiểm thử tiện ích VariantAttributeUtil.buildSummary với đầy đủ 4 nhánh (JSON hợp lệ, JSON lỗi, Fallback Color/Size, Fallback SKU)")
        void variantAttributeUtil_BuildSummary_AllBranches() {
            // 1. JSON hợp lệ
            String validJson = "{\"Màu sắc\":\"Đỏ\",\"Kích thước\":\"XL\"}";
            assertEquals("Màu sắc: Đỏ, Kích thước: XL",
                    VariantAttributeUtil.buildSummary(validJson, "Đen", "S", "SKU-1"));

            // 2. Chuỗi không phải JSON hợp lệ -> trả về chuỗi đã trim
            assertEquals("Phiên bản Giới hạn 2026",
                    VariantAttributeUtil.buildSummary("  Phiên bản Giới hạn 2026  ", null, null, "SKU-1"));

            // 3. attributesJson rỗng -> fallback dùng Color và Size
            assertEquals("Màu: Trắng, Size: 41",
                    VariantAttributeUtil.buildSummary(null, " Trắng ", " 41 ", "SKU-1"));

            // 4. Cả attributesJson, Color, Size đều rỗng -> fallback dùng SKU
            assertEquals("SKU-999",
                    VariantAttributeUtil.buildSummary("", null, "   ", "  SKU-999  "));
        }

        @Test
        @DisplayName("TC-PROD-08.1: Khách hàng xem chi tiết sản phẩm qua getProductBySlugOrId -> Ưu tiên tìm theo Slug, Fallback sang ID số, và báo lỗi 404 khi không tồn tại")
        void getProductBySlugOrId_SlugAndNumericIdFallbackAndNotFound() {
            // Nhánh 1: Tìm thấy bằng Slug
            when(productRepository.findBySlug("giay-cu")).thenReturn(Optional.of(existingProduct));
            ProductDetailResponse bySlug = customerProductService.getProductBySlugOrId("giay-cu");
            assertEquals(50L, bySlug.getId());

            // Nhánh 2: Không khớp Slug, tự động parse sang ID = 50L
            when(productRepository.findBySlug("50")).thenReturn(Optional.empty());
            when(productRepository.findById(50L)).thenReturn(Optional.of(existingProduct));
            ProductDetailResponse byId = customerProductService.getProductBySlugOrId("50");
            assertEquals("giay-cu", byId.getSlug());

            // Nhánh 3: Chuỗi chữ không tồn tại -> Không văng NumberFormatException mà ném AppException 404
            when(productRepository.findBySlug("khong-ton-tai")).thenReturn(Optional.empty());
            AppException ex = assertThrows(AppException.class,
                    () -> customerProductService.getProductBySlugOrId("khong-ton-tai"));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        }
    }
}
