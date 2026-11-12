package com.web.ap_sports.warehouse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.warehouse.ApproveImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.CreateImportRequestItemDto;
import com.web.ap_sports.dto.request.warehouse.RejectImportRequestDto;
import com.web.ap_sports.dto.request.warehouse.SupplierRequest;
import com.web.ap_sports.dto.response.warehouse.ImportRequestResponse;
import com.web.ap_sports.dto.response.warehouse.SupplierResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.ImportRequestStatus;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.enums.ProductVariantStatus;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.customer.ProductRestockNotificationService;
import com.web.ap_sports.service.warehouse.impl.WarehouseImportRequestServiceImpl;
import com.web.ap_sports.service.warehouse.impl.WarehouseSupplierServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Tích hợp Quản lý Kho bãi & Chuỗi cung ứng Nhà cung cấp (Chapter 3 & 4 - Nhóm 4)")
public class WarehouseSupplyChainAndSupplierTest {

    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private ImportRequestRepository importRequestRepository;
    @Mock
    private ImportRequestItemRepository importRequestItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private InventoryTransactionRepository transactionRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private InventoryAlertService inventoryAlertService;
    @Mock
    private ProductRestockNotificationService restockNotificationService;

    private ObjectMapper objectMapper;

    private WarehouseSupplierServiceImpl supplierService;
    private WarehouseImportRequestServiceImpl importRequestService;

    private User warehouseManagerUser;
    private User staffUser;
    private Supplier sampleSupplier;
    private Product sampleProduct;
    private ProductVariant sampleVariant;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        Role warehouseRole = Role.builder().id(3L).name("WAREHOUSE_MANAGER").build();
        Role staffRole = Role.builder().id(2L).name("STAFF").build();

        warehouseManagerUser = User.builder()
                .id(30L)
                .email("warehouse@apsports.vn")
                .name("Lê Văn Thủ Kho")
                .role(warehouseRole)
                .status(UserStatus.active)
                .build();

        staffUser = User.builder()
                .id(20L)
                .email("staff@apsports.vn")
                .name("Nguyễn Văn Nhân Viên")
                .role(staffRole)
                .status(UserStatus.active)
                .build();

        sampleSupplier = Supplier.builder()
                .id(1L)
                .code("NCC-NIKE-VN")
                .name("Nike Việt Nam Official")
                .phone("02838123456")
                .email("contact@nike.vn")
                .address("Quận 1, TP. Hồ Chí Minh")
                .build();

        sampleProduct = Product.builder()
                .id(100L)
                .name("Giày đá bóng Nike Mercurial Superfly")
                .price(new BigDecimal("3500000"))
                .stock(10)
                .status("in_stock")
                .build();

        sampleVariant = ProductVariant.builder()
                .id(200L)
                .product(sampleProduct)
                .sku("NIK-MERC-42-RED")
                .barcode("8930001002001")
                .size("42")
                .color("Đỏ")
                .costPrice(new BigDecimal("2100000"))
                .price(new BigDecimal("3500000"))
                .stockQuantity(10)
                .status(ProductVariantStatus.ACTIVE)
                .build();

        supplierService = new WarehouseSupplierServiceImpl(supplierRepository);

        importRequestService = new WarehouseImportRequestServiceImpl(
                importRequestRepository,
                importRequestItemRepository,
                productRepository,
                variantRepository,
                supplierRepository,
                userRepository,
                productImageRepository,
                transactionRepository,
                notificationService,
                inventoryAlertService,
                restockNotificationService,
                objectMapper
        );
    }

    // =========================================================================
    // 1. KIỂM THỬ QUẢN LÝ NHÀ CUNG CẤP (Warehouse Supplier Service)
    // =========================================================================
    @Nested
    @DisplayName("1. Kiểm thử Nghiệp vụ Quản lý Nhà cung cấp (Suppliers)")
    class SupplierManagementTests {

        @Test
        @DisplayName("TC-SUP-01: Tạo mới nhà cung cấp thành công -> Lưu DB và trả về DTO")
        void testCreateSupplier_Success() {
            SupplierRequest request = SupplierRequest.builder()
                    .code("NCC-ADIDAS")
                    .name("Adidas Vietnam Distribution")
                    .phone("02839999999")
                    .email("b2b@adidas.vn")
                    .address("Tòa nhà Bitexco, Q.1, TP.HCM")
                    .build();

            when(supplierRepository.existsByCode("NCC-ADIDAS")).thenReturn(false);

            Supplier saved = Supplier.builder()
                    .id(2L)
                    .code(request.getCode())
                    .name(request.getName())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .address(request.getAddress())
                    .build();
            when(supplierRepository.save(any(Supplier.class))).thenReturn(saved);

            SupplierResponse response = supplierService.createSupplier(request);

            assertNotNull(response);
            assertEquals(2L, response.getId());
            assertEquals("NCC-ADIDAS", response.getCode());
            assertEquals("Adidas Vietnam Distribution", response.getName());
            verify(supplierRepository).save(any(Supplier.class));
        }

        @Test
        @DisplayName("TC-SUP-02: Tạo nhà cung cấp với mã trùng lặp -> Báo lỗi BAD_REQUEST")
        void testCreateSupplier_DuplicateCode_ShouldThrow() {
            SupplierRequest request = SupplierRequest.builder()
                    .code("NCC-NIKE-VN")
                    .name("Nike Duplicate")
                    .build();

            when(supplierRepository.existsByCode("NCC-NIKE-VN")).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> supplierService.createSupplier(request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã tồn tại"));
            verify(supplierRepository, never()).save(any(Supplier.class));
        }

        @Test
        @DisplayName("TC-SUP-03: Cập nhật nhà cung cấp thành công -> Lưu DB")
        void testUpdateSupplier_Success() {
            SupplierRequest request = SupplierRequest.builder()
                    .code("NCC-NIKE-VN")
                    .name("Nike Vietnam HQ")
                    .phone("02838000000")
                    .email("hq@nike.vn")
                    .address("Quận 7, TP.HCM")
                    .build();

            when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
            when(supplierRepository.existsByCodeAndIdNot("NCC-NIKE-VN", 1L)).thenReturn(false);
            when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> inv.getArgument(0));

            SupplierResponse response = supplierService.updateSupplier(1L, request);

            assertNotNull(response);
            assertEquals("Nike Vietnam HQ", response.getName());
            assertEquals("Quận 7, TP.HCM", response.getAddress());
        }

        @Test
        @DisplayName("TC-SUP-04: Xóa nhà cung cấp thành công -> Gọi deleteById")
        void testDeleteSupplier_Success() {
            when(supplierRepository.existsById(1L)).thenReturn(true);

            supplierService.deleteSupplier(1L);

            verify(supplierRepository).deleteById(1L);
        }

        @Test
        @DisplayName("TC-SUP-05: Lấy thông tin nhà cung cấp không tồn tại -> Báo lỗi NOT_FOUND")
        void testGetSupplierById_NotFound_ShouldThrow() {
            when(supplierRepository.findById(999L)).thenReturn(Optional.empty());

            AppException ex = assertThrows(AppException.class, () -> supplierService.getSupplierById(999L));
            assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        }
    }

    // =========================================================================
    // 2. KIỂM THỬ YÊU CẦU NHẬP KHO & PHÊ DUYỆT (Import Requests)
    // =========================================================================
    @Nested
    @DisplayName("2. Kiểm thử Lập đề xuất & Phê duyệt Nhập kho (Import Requests)")
    class ImportRequestTests {

        @Test
        @DisplayName("TC-IMP-01: Thủ kho lập phiếu yêu cầu nhập hàng thành công -> Lưu DB với trạng thái PENDING")
        void testCreateImportRequest_Success() {
            CreateImportRequestDto dto = CreateImportRequestDto.builder()
                    .productId(100L)
                    .supplierId(1L)
                    .note("Nhập bù hàng chuẩn bị mùa giải mới")
                    .items(List.of(
                            CreateImportRequestItemDto.builder()
                                    .variantId(200L)
                                    .requestedQuantity(50)
                                    .expectedCostPrice(new BigDecimal("2100000"))
                                    .build()
                    ))
                    .build();

            when(userRepository.findByEmail(warehouseManagerUser.getEmail())).thenReturn(Optional.of(warehouseManagerUser));
            when(productRepository.findById(100L)).thenReturn(Optional.of(sampleProduct));
            when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
            when(variantRepository.findById(200L)).thenReturn(Optional.of(sampleVariant));

            ImportRequest savedRequest = ImportRequest.builder()
                    .id(10L)
                    .code("YCNK-20261112-001")
                    .status(ImportRequestStatus.PENDING)
                    .product(sampleProduct)
                    .supplier(sampleSupplier)
                    .requestedBy(warehouseManagerUser)
                    .note(dto.getNote())
                    .createdAt(LocalDateTime.now())
                    .items(new ArrayList<>())
                    .build();

            when(importRequestRepository.save(any(ImportRequest.class))).thenReturn(savedRequest);

            ImportRequestResponse response = importRequestService.createImportRequest(dto, warehouseManagerUser.getEmail());

            assertNotNull(response);
            assertEquals(10L, response.getId());
            assertEquals(ImportRequestStatus.PENDING, response.getStatus());
            verify(importRequestRepository).save(any(ImportRequest.class));
            verify(notificationService).sendToInternalUsers(anyList(), eq(warehouseManagerUser.getId()), eq(NotificationActionType.IMPORT_REQUEST_CREATED), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-IMP-02: Nhân viên bán hàng (Staff) tự ý tạo yêu cầu nhập kho -> Bị chặn với FORBIDDEN")
        void testCreateImportRequest_ByStaff_ShouldThrowForbidden() {
            CreateImportRequestDto dto = CreateImportRequestDto.builder()
                    .productId(100L)
                    .supplierId(1L)
                    .build();

            when(userRepository.findByEmail(staffUser.getEmail())).thenReturn(Optional.of(staffUser));

            AppException ex = assertThrows(AppException.class, () ->
                    importRequestService.createImportRequest(dto, staffUser.getEmail()));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
            assertTrue(ex.getMessage().contains("không có quyền"));
            verify(importRequestRepository, never()).save(any(ImportRequest.class));
        }

        @Test
        @DisplayName("TC-IMP-03: Phê duyệt yêu cầu nhập kho -> Cập nhật tồn kho biến thể, sinh phiếu kho và bắn thông báo")
        void testApproveImportRequest_Success() {
            ImportRequestItem item = ImportRequestItem.builder()
                    .id(50L)
                    .variant(sampleVariant)
                    .requestedQuantity(50)
                    .expectedCostPrice(new BigDecimal("2100000"))
                    .build();

            ImportRequest request = ImportRequest.builder()
                    .id(10L)
                    .code("YCNK-20261112-001")
                    .status(ImportRequestStatus.PENDING)
                    .product(sampleProduct)
                    .supplier(sampleSupplier)
                    .requestedBy(warehouseManagerUser)
                    .items(new ArrayList<>(List.of(item)))
                    .createdAt(LocalDateTime.now())
                    .build();

            ApproveImportRequestDto approveDto = ApproveImportRequestDto.builder()
                    .supplierId(1L)
                    .note("Kiểm đếm đủ 50 đôi giày thực nhập")
                    .items(List.of(
                            ApproveImportRequestDto.ApproveItemDto.builder()
                                    .itemId(50L)
                                    .approvedQuantity(50)
                                    .actualCostPrice(new BigDecimal("2100000"))
                                    .build()
                    ))
                    .build();

            when(userRepository.findByEmail(warehouseManagerUser.getEmail())).thenReturn(Optional.of(warehouseManagerUser));
            when(importRequestRepository.findById(10L)).thenReturn(Optional.of(request));
            when(supplierRepository.findById(1L)).thenReturn(Optional.of(sampleSupplier));
            when(variantRepository.findByIdForUpdate(200L)).thenReturn(Optional.of(sampleVariant));
            when(variantRepository.findByProductId(sampleProduct.getId())).thenReturn(List.of(sampleVariant));
            when(importRequestRepository.save(any(ImportRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ImportRequestResponse response = importRequestService.approveImportRequest(10L, approveDto, warehouseManagerUser.getEmail());

            assertNotNull(response);
            assertEquals(ImportRequestStatus.COMPLETED, response.getStatus());
            assertEquals(60, sampleVariant.getStockQuantity()); // 10 cũ + 50 mới = 60
            verify(transactionRepository).save(any(InventoryTransaction.class)); // Lưu phiếu nhập kho
            verify(variantRepository).save(sampleVariant);
            verify(productRepository).save(sampleProduct);
            verify(notificationService).sendToUser(eq(warehouseManagerUser.getId()), eq(warehouseManagerUser.getId()), eq(NotificationActionType.IMPORT_REQUEST_APPROVED), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-IMP-04: Từ chối yêu cầu nhập kho -> Cập nhật trạng thái REJECTED và lưu lý do")
        void testRejectImportRequest_Success() {
            ImportRequest request = ImportRequest.builder()
                    .id(10L)
                    .code("YCNK-20261112-001")
                    .status(ImportRequestStatus.PENDING)
                    .product(sampleProduct)
                    .supplier(sampleSupplier)
                    .requestedBy(warehouseManagerUser)
                    .items(new ArrayList<>())
                    .build();

            RejectImportRequestDto rejectDto = RejectImportRequestDto.builder()
                    .reason("Nhà cung cấp báo hết hàng tạm thời")
                    .build();

            when(userRepository.findByEmail(warehouseManagerUser.getEmail())).thenReturn(Optional.of(warehouseManagerUser));
            when(importRequestRepository.findById(10L)).thenReturn(Optional.of(request));
            when(importRequestRepository.save(any(ImportRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ImportRequestResponse response = importRequestService.rejectImportRequest(10L, rejectDto, warehouseManagerUser.getEmail());

            assertNotNull(response);
            assertEquals(ImportRequestStatus.REJECTED, response.getStatus());
            assertEquals("Nhà cung cấp báo hết hàng tạm thời", response.getRejectionReason());
            verify(notificationService).sendToUser(eq(warehouseManagerUser.getId()), eq(warehouseManagerUser.getId()), eq(NotificationActionType.IMPORT_REQUEST_REJECTED), anyString(), anyString());
        }
    }
}
