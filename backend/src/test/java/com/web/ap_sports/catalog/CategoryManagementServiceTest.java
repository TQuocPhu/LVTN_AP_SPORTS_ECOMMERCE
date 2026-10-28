package com.web.ap_sports.catalog;

import com.web.ap_sports.dto.request.admin.CategoryFilterRequest;
import com.web.ap_sports.dto.request.admin.CreateCategoryRequest;
import com.web.ap_sports.dto.request.admin.UpdateCategoryRequest;
import com.web.ap_sports.dto.response.common.CategoryResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.service.admin.impl.AdminCategoryServiceImpl;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.impl.CategoryServiceImpl;
import com.web.ap_sports.specification.CategorySpecifications;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Quản lý Danh mục Sản phẩm (Phần 2: TC-CAT-01.1 -> TC-CAT-06.1, gồm 20 Unit Tests).
 * Bao phủ: AdminCategoryServiceImpl, CategoryServiceImpl & CategorySpecifications.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Category Management Service & Tree Unit Tests (Phần 2 - 20 Tests)")
class CategoryManagementServiceTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AdminCategoryServiceImpl adminCategoryService;

    @InjectMocks
    private CategoryServiceImpl publicCategoryService;

    private Category rootCategory;
    private Category level2Category;
    private Category level3Category;

    @BeforeEach
    void setUp() {
        rootCategory = Category.builder()
                .id(1L)
                .name("Giày Thể Thao")
                .slug("giay-the-thao")
                .description("Danh mục gốc Cấp 1")
                .image("https://res.cloudinary.com/demo/categories/root.png")
                .parent(null)
                .build();

        level2Category = Category.builder()
                .id(2L)
                .name("Giày Bóng Đá")
                .slug("giay-bong-da")
                .description("Danh mục con Cấp 2")
                .image(null)
                .parent(rootCategory)
                .build();

        level3Category = Category.builder()
                .id(3L)
                .name("Giày Sân Cỏ Nhân Tạo TF")
                .slug("giay-san-co-nhan-tao-tf")
                .description("Danh mục con Cấp 3")
                .image(null)
                .parent(level2Category)
                .build();
    }

    // =========================================================================
    // NHÓM 2.1: TẠO MỚI DANH MỤC & QUY TẮC CẤP BẬC / ẢNH / SLUG (8 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 2.1: Tạo mới Danh mục & Quy tắc Cấp bậc / Ảnh / Slug (TC-CAT-01 -> TC-CAT-02)")
    class CreateCategoryTests {

        @Test
        @DisplayName("TC-CAT-01.1: Tạo danh mục gốc (Cấp 1) thành công với ảnh tải lên Cloudinary và tự sinh Slug từ tên tiếng Việt")
        void createCategory_RootSuccess_UploadsImageAndGeneratesSlug() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("  Giày Đá Bóng Sân Cỏ Nhân Tạo  ")
                    .slug(null)
                    .description("Mô tả danh mục gốc")
                    .image("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==")
                    .parentId(null)
                    .build();

            when(categoryRepository.existsByName("Giày Đá Bóng Sân Cỏ Nhân Tạo")).thenReturn(false);
            when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
            when(cloudinaryService.uploadBase64OrUrl(anyString(), eq("ap-sports-e-commerce/categories")))
                    .thenReturn("https://res.cloudinary.com/demo/categories/cat1.png");
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
                Category c = inv.getArgument(0);
                c.setId(10L);
                return c;
            });
            when(categoryRepository.findByParentId(10L)).thenReturn(Collections.emptyList());

            CategoryResponse res = adminCategoryService.createCategory(req);

            assertNotNull(res);
            assertEquals(10L, res.getId());
            assertEquals("Giày Đá Bóng Sân Cỏ Nhân Tạo", res.getName());
            assertEquals(1, res.getLevel());
            assertNull(res.getParentId());
            assertEquals("https://res.cloudinary.com/demo/categories/cat1.png", res.getImage());
            assertTrue(res.getSlug().matches("^giay-da-bong-san-co-nhan-tao-[a-z0-9]{5}$"),
                    "Slug tự sinh phải bỏ dấu tiếng Việt (Đ->d) và nối hậu tố 5 ký tự UUID");

            verify(cloudinaryService, times(1))
                    .uploadBase64OrUrl(eq("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="), eq("ap-sports-e-commerce/categories"));
        }

        @Test
        @DisplayName("TC-CAT-01.2: Tạo danh mục gốc thành công khi truyền sẵn slug hợp lệ chưa tồn tại")
        void createCategory_WithCustomSlug_Success() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Áo Đấu Đội Tuyển")
                    .slug("  Ao Dau Doi Tuyen 2026!@#  ")
                    .parentId(null)
                    .build();

            when(categoryRepository.existsByName("Áo Đấu Đội Tuyển")).thenReturn(false);
            when(categoryRepository.existsBySlug("ao-dau-doi-tuyen-2026")).thenReturn(false);
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
                Category c = inv.getArgument(0);
                c.setId(11L);
                return c;
            });

            CategoryResponse res = adminCategoryService.createCategory(req);

            assertEquals("ao-dau-doi-tuyen-2026", res.getSlug());
            verify(cloudinaryService, never()).uploadBase64OrUrl(anyString(), anyString());
        }

        @Test
        @DisplayName("TC-CAT-01.3: Tự động sinh lại Slug kèm hậu tố UUID khi slug truyền vào bị trùng (kể cả khi trùng lần 1)")
        void createCategory_DuplicateCustomSlug_FallbackToUniqueSlugWithRetry() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Phụ Kiện")
                    .slug("phu-kien")
                    .parentId(null)
                    .build();

            when(categoryRepository.existsByName("Phụ Kiện")).thenReturn(false);
            // Lần 1 kiểm tra "phu-kien" -> true (trùng), lần 2 kiểm tra candidate UUID đầu tiên -> true (trùng), nên sinh retryUid5
            when(categoryRepository.existsBySlug(anyString())).thenReturn(true, true);
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
                Category c = inv.getArgument(0);
                c.setId(12L);
                return c;
            });

            CategoryResponse res = adminCategoryService.createCategory(req);

            assertNotNull(res.getSlug());
            assertTrue(res.getSlug().matches("^phu-kien-[a-z0-9]{5}$"));
            verify(categoryRepository, times(1)).save(any(Category.class));
        }

        @Test
        @DisplayName("TC-CAT-02.1: Tạo danh mục thất bại khi Tên danh mục đã tồn tại trên hệ thống")
        void createCategory_Fail_DuplicateName() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("  Giày Chạy Bộ  ")
                    .image("data:image/png;base64,xxx")
                    .build();

            when(categoryRepository.existsByName("Giày Chạy Bộ")).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.createCategory(req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Tên danh mục 'Giày Chạy Bộ' đã tồn tại"));
            verify(cloudinaryService, never()).uploadBase64OrUrl(anyString(), anyString());
            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-CAT-02.2: Tạo danh mục con Cấp 2 & Cấp 3 thành công -> Cưỡng chế bỏ qua ảnh (image = null) dù Request có gửi ảnh")
        void createCategory_SubCategoryLevel3_IgnoresImageUpload() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Giày Đinh Sắt SG")
                    .parentId(2L) // Cha đang ở Cấp 2 -> Con mới sẽ ở Cấp 3
                    .image("https://example.com/should-be-ignored.png")
                    .build();

            when(categoryRepository.existsByName("Giày Đinh Sắt SG")).thenReturn(false);
            when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
            when(categoryRepository.findById(2L)).thenReturn(Optional.of(level2Category));
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
                Category c = inv.getArgument(0);
                c.setId(30L);
                return c;
            });

            CategoryResponse res = adminCategoryService.createCategory(req);

            assertEquals(3, res.getLevel());
            assertEquals(2L, res.getParentId());
            assertEquals("Giày Bóng Đá", res.getParentName());
            assertNull(res.getImage(), "Danh mục con không được phép lưu ảnh");
            verify(cloudinaryService, never()).uploadBase64OrUrl(anyString(), anyString());
        }

        @Test
        @DisplayName("TC-CAT-02.3: Chặn tạo danh mục con Cấp 4 khi danh mục cha đã ở Cấp 3 (parentDepth >= 3)")
        void createCategory_Fail_ExceedsMaxDepth3() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Danh mục Cấp 4 không hợp lệ")
                    .parentId(3L) // level3Category đang có depth = 3
                    .build();

            when(categoryRepository.existsByName(anyString())).thenReturn(false);
            when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
            when(categoryRepository.findById(3L)).thenReturn(Optional.of(level3Category));

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.createCategory(req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("Hệ thống chỉ hỗ trợ tối đa 3 cấp danh mục"));
            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-CAT-02.4: Tạo danh mục con thất bại khi parentId không tồn tại trong DB")
        void createCategory_Fail_ParentNotFound() {
            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Danh mục con")
                    .parentId(999L)
                    .build();

            when(categoryRepository.existsByName("Danh mục con")).thenReturn(false);
            when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
            when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.createCategory(req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Không tìm thấy danh mục cha với ID: 999", ex.getMessage());
        }

        @Test
        @DisplayName("TC-CAT-02.5: Chống treo vòng lặp vô hạn (Guard against loop depth > 10) khi dữ liệu cha-con bị vòng tròn")
        void createCategory_CircularParentGraph_TerminatesSafelyAndRejects() {
            Category cyclicA = Category.builder().id(100L).name("Cyclic A").build();
            Category cyclicB = Category.builder().id(101L).name("Cyclic B").parent(cyclicA).build();
            cyclicA.setParent(cyclicB); // Tạo chu trình A <-> B

            CreateCategoryRequest req = CreateCategoryRequest.builder()
                    .name("Child of Cyclic")
                    .parentId(100L)
                    .build();

            when(categoryRepository.existsByName(anyString())).thenReturn(false);
            when(categoryRepository.existsBySlug(anyString())).thenReturn(false);
            when(categoryRepository.findById(100L)).thenReturn(Optional.of(cyclicA));

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.createCategory(req));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        }
    }

    // =========================================================================
    // NHÓM 2.2: CẬP NHẬT, XÓA & TRUY VẤN DANH MỤC (12 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 2.2: Cập nhật, Xóa & Truy vấn Danh mục (TC-CAT-03 -> TC-CAT-06)")
    class UpdateDeleteAndQueryCategoryTests {

        @Test
        @DisplayName("TC-CAT-03.1: Cập nhật danh mục gốc thành công -> Giữ nguyên ảnh cũ khi không truyền ảnh mới")
        void updateCategory_RootWithoutNewImage_PreservesExistingImage() {
            UpdateCategoryRequest req = UpdateCategoryRequest.builder()
                    .name("Giày Thể Thao Mới")
                    .slug("giay-the-thao-moi")
                    .description("Mô tả mới")
                    .image("") // Không gửi ảnh mới
                    .parentId(null)
                    .build();

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(rootCategory));
            when(categoryRepository.existsByNameAndIdNot("Giày Thể Thao Mới", 1L)).thenReturn(false);
            when(categoryRepository.existsBySlugAndIdNot("giay-the-thao-moi", 1L)).thenReturn(false);
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

            CategoryResponse res = adminCategoryService.updateCategory(1L, req);

            assertEquals("Giày Thể Thao Mới", res.getName());
            assertEquals("https://res.cloudinary.com/demo/categories/root.png", res.getImage());
            verify(cloudinaryService, never()).uploadBase64OrUrl(anyString(), anyString());
        }

        @Test
        @DisplayName("TC-CAT-03.2: Cập nhật chuyển danh mục Gốc (đang có ảnh) xuống làm danh mục Con -> Tự động xóa ảnh về null")
        void updateCategory_DemoteRootToChild_ClearsImageToNull() {
            Category anotherRoot = Category.builder().id(99L).name("Thời Trang").parent(null).build();
            UpdateCategoryRequest req = UpdateCategoryRequest.builder()
                    .name("Giày Thể Thao")
                    .slug("giay-the-thao")
                    .parentId(99L)
                    .image("https://example.com/ignored.png")
                    .build();

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(rootCategory));
            when(categoryRepository.findById(99L)).thenReturn(Optional.of(anotherRoot));
            when(categoryRepository.existsByNameAndIdNot("Giày Thể Thao", 1L)).thenReturn(false);
            when(categoryRepository.existsBySlugAndIdNot("giay-the-thao", 1L)).thenReturn(false);
            when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));

            CategoryResponse res = adminCategoryService.updateCategory(1L, req);

            assertEquals(2, res.getLevel());
            assertEquals(99L, res.getParentId());
            assertNull(res.getImage(), "Khi chuyển danh mục gốc xuống danh mục con, ảnh phải bị xóa về null");
        }

        @Test
        @DisplayName("TC-CAT-03.3: Chặn cập nhật khi Danh mục tự chọn chính nó hoặc chọn Danh mục con/cháu làm Danh mục cha")
        void updateCategory_Fail_SelfParentOrDescendantParent() {
            UpdateCategoryRequest req = UpdateCategoryRequest.builder()
                    .name("Giày Thể Thao")
                    .slug("giay-the-thao")
                    .parentId(1L)
                    .build();

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(rootCategory));
            when(categoryRepository.existsByNameAndIdNot("Giày Thể Thao", 1L)).thenReturn(false);
            when(categoryRepository.existsBySlugAndIdNot("giay-the-thao", 1L)).thenReturn(false);

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(1L, req));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Danh mục không thể tự đặt chính nó làm danh mục cha.", ex.getMessage());

            // Nhánh 2: Chọn danh mục con (level2Category, id=2L) làm cha của danh mục gốc (id=1L)
            UpdateCategoryRequest childAsParentReq = UpdateCategoryRequest.builder()
                    .name("Giày Thể Thao")
                    .slug("giay-the-thao")
                    .parentId(2L)
                    .build();
            when(categoryRepository.findById(2L)).thenReturn(Optional.of(level2Category));

            AppException exCycle = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(1L, childAsParentReq));
            assertEquals(HttpStatus.BAD_REQUEST, exCycle.getStatus());
            assertTrue(exCycle.getMessage().contains("Không thể chọn danh mục con/cháu làm danh mục cha"));
        }

        @Test
        @DisplayName("TC-CAT-03.4: Chặn cập nhật khi Tên mới trùng với danh mục khác, chọn cha ở Cấp 3, hoặc di chuyển danh mục đang có con xuống Cấp 3")
        void updateCategory_Fail_DuplicateNameOrParentDepth3() {
            UpdateCategoryRequest dupNameReq = UpdateCategoryRequest.builder()
                    .name("Tên Đã Có")
                    .build();

            when(categoryRepository.findById(1L)).thenReturn(Optional.of(rootCategory));
            when(categoryRepository.existsByNameAndIdNot("Tên Đã Có", 1L)).thenReturn(true);

            AppException ex1 = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(1L, dupNameReq));
            assertEquals(HttpStatus.BAD_REQUEST, ex1.getStatus());

            // Nhánh 2: Chọn cha đang ở Cấp 3
            UpdateCategoryRequest depth3ParentReq = UpdateCategoryRequest.builder()
                    .name("Tên Hợp Lệ")
                    .parentId(3L)
                    .build();
            when(categoryRepository.existsByNameAndIdNot("Tên Hợp Lệ", 1L)).thenReturn(false);
            when(categoryRepository.existsBySlugAndIdNot(anyString(), eq(1L))).thenReturn(false);
            when(categoryRepository.findById(3L)).thenReturn(Optional.of(level3Category));

            AppException ex2 = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(1L, depth3ParentReq));
            assertEquals(HttpStatus.BAD_REQUEST, ex2.getStatus());
            assertTrue(ex2.getMessage().contains("đã ở Cấp 3 nên không thể chọn làm danh mục cha"));

            // Nhánh 3: Di chuyển danh mục đang có con (existsByParentId == true) vào cha Cấp 2
            Category otherRoot = Category.builder().id(80L).name("Gốc Khác").parent(null).build();
            Category otherLevel2 = Category.builder().id(81L).name("Cấp 2 Khác").parent(otherRoot).build();
            UpdateCategoryRequest moveWithChildrenReq = UpdateCategoryRequest.builder()
                    .name("Tên Hợp Lệ")
                    .parentId(81L)
                    .build();
            when(categoryRepository.findById(81L)).thenReturn(Optional.of(otherLevel2));
            when(categoryRepository.existsByParentId(1L)).thenReturn(true);

            AppException ex3 = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(1L, moveWithChildrenReq));
            assertEquals(HttpStatus.BAD_REQUEST, ex3.getStatus());
            assertTrue(ex3.getMessage().contains("sẽ vượt quá 3 cấp"));
        }

        @Test
        @DisplayName("TC-CAT-04.1: Xóa danh mục thành công khi không có danh mục con và không có sản phẩm liên kết")
        void deleteCategory_Success() {
            when(categoryRepository.findById(3L)).thenReturn(Optional.of(level3Category));
            when(categoryRepository.existsByParentId(3L)).thenReturn(false);
            when(productRepository.existsByCategoryId(3L)).thenReturn(false);
            when(productRepository.existsByCategoriesId(3L)).thenReturn(false);

            assertDoesNotThrow(() -> adminCategoryService.deleteCategory(3L));
            verify(categoryRepository, times(1)).delete(level3Category);
        }

        @Test
        @DisplayName("TC-CAT-04.2: Chặn xóa danh mục khi đang chứa danh mục con (existsByParentId == true)")
        void deleteCategory_Fail_HasSubCategories() {
            when(categoryRepository.findById(1L)).thenReturn(Optional.of(rootCategory));
            when(categoryRepository.existsByParentId(1L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.deleteCategory(1L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đang chứa các danh mục con"));
            verify(categoryRepository, never()).delete(any(Category.class));
        }

        @Test
        @DisplayName("TC-CAT-04.3: Chặn xóa danh mục khi đang có sản phẩm thuộc Danh mục chính (existsByCategoryId)")
        void deleteCategory_Fail_HasPrimaryProducts() {
            when(categoryRepository.findById(3L)).thenReturn(Optional.of(level3Category));
            when(categoryRepository.existsByParentId(3L)).thenReturn(false);
            when(productRepository.existsByCategoryId(3L)).thenReturn(true);
            when(productRepository.existsByCategoriesId(3L)).thenReturn(false);

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.deleteCategory(3L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đang có các sản phẩm thuộc danh mục này"));
            verify(categoryRepository, never()).delete(any(Category.class));
        }

        @Test
        @DisplayName("TC-CAT-04.4: Chặn xóa danh mục khi đang có sản phẩm thuộc Danh mục phụ n-n (existsByCategoriesId)")
        void deleteCategory_Fail_HasSecondaryProducts() {
            when(categoryRepository.findById(3L)).thenReturn(Optional.of(level3Category));
            when(categoryRepository.existsByParentId(3L)).thenReturn(false);
            when(productRepository.existsByCategoryId(3L)).thenReturn(false);
            when(productRepository.existsByCategoriesId(3L)).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminCategoryService.deleteCategory(3L));

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("đang có các sản phẩm thuộc danh mục này"));
            verify(categoryRepository, never()).delete(any(Category.class));
        }

        @Test
        @DisplayName("TC-CAT-04.5: Truy vấn getCategoryById, updateCategory, deleteCategory thất bại (404 NOT_FOUND) khi ID không tồn tại")
        void categoryOperations_Fail_WhenIdNotFound() {
            when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

            AppException exGet = assertThrows(AppException.class, () -> adminCategoryService.getCategoryById(999L));
            AppException exUpd = assertThrows(AppException.class, () -> adminCategoryService.updateCategory(999L, new UpdateCategoryRequest()));
            AppException exDel = assertThrows(AppException.class, () -> adminCategoryService.deleteCategory(999L));

            assertEquals(HttpStatus.NOT_FOUND, exGet.getStatus());
            assertEquals(HttpStatus.NOT_FOUND, exUpd.getStatus());
            assertEquals(HttpStatus.NOT_FOUND, exDel.getStatus());
        }

        @Test
        @DisplayName("TC-CAT-05.1: Xây dựng Cây danh mục Khách hàng (getCategoryTree) -> Cộng dồn đệ quy số lượng sản phẩm in_stock từ Cấp 3 lên Cấp 1")
        void getCategoryTree_RecursiveProductCountAggregation_Success() {
            when(categoryRepository.findByParentIsNull()).thenReturn(List.of(rootCategory));
            when(categoryRepository.findAll()).thenReturn(List.of(rootCategory, level2Category, level3Category));

            // Primary: ID=1 (2 SP), ID=2 (3 SP), ID=3 (5 SP)
            when(productRepository.countInStockProductsGroupedByPrimaryCategory()).thenReturn(List.of(
                    new Object[]{1L, 2L},
                    new Object[]{2L, 3L},
                    new Object[]{3L, 5L}
            ));
            // Secondary: ID=2 (4 SP), ID=3 (1 SP)
            when(productRepository.countInStockProductsGroupedBySecondaryCategory()).thenReturn(List.of(
                    new Object[]{2L, 4L},
                    new Object[]{3L, 1L}
            ));

            List<CategoryResponse> tree = publicCategoryService.getCategoryTree();

            assertEquals(1, tree.size());
            CategoryResponse rootNode = tree.get(0);
            CategoryResponse level2Node = rootNode.getChildren().get(0);
            CategoryResponse level3Node = level2Node.getChildren().get(0);

            assertEquals(6L, level3Node.getProductCount(), "Cấp 3: 5 (chính) + 1 (phụ) = 6");
            assertEquals(13L, level2Node.getProductCount(), "Cấp 2: 3 (chính) + 4 (phụ) + 6 (con Cấp 3) = 13");
            assertEquals(15L, rootNode.getProductCount(), "Cấp 1: 2 (chính) + 13 (con Cấp 2) = 15");
        }

        @Test
        @DisplayName("TC-CAT-05.2: Lấy danh sách danh mục phẳng (getAllCategoriesFlat), danh mục gốc (getPrimaryCategories / getRootCategories) & phân trang Admin")
        void getFlatAndRootAndPagedCategories_Success() {
            when(categoryRepository.findAll()).thenReturn(List.of(rootCategory, level2Category));
            when(categoryRepository.findByParentIsNull()).thenReturn(List.of(rootCategory));

            Pageable pageable = PageRequest.of(0, 10);
            when(categoryRepository.findAll(any(Specification.class), eq(pageable)))
                    .thenReturn(new PageImpl<>(List.of(rootCategory)));

            List<CategoryResponse> flat = publicCategoryService.getAllCategoriesFlat();
            List<CategoryResponse> primary = publicCategoryService.getPrimaryCategories();
            List<CategoryResponse> adminRoots = adminCategoryService.getRootCategories();
            Page<CategoryResponse> adminPage = adminCategoryService.getCategories(new CategoryFilterRequest(), pageable);

            assertEquals(2, flat.size());
            assertEquals(1L, flat.get(1).getParentId());
            assertTrue(flat.get(1).getChildren().isEmpty());
            assertEquals(1, primary.size());
            assertEquals(1, adminRoots.size());
            assertEquals(1, adminPage.getTotalElements());
        }

        @Test
        @SuppressWarnings({"unchecked", "rawtypes"})
        @DisplayName("TC-CAT-06.1: Kiểm thử Bộ lọc CategorySpecifications.filterCategories theo keyword và parentId (0 vs > 0)")
        void categorySpecifications_FilterByKeywordAndParentId_Success() {
            Root<Category> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder cb = mock(CriteriaBuilder.class);
            Path path = mock(Path.class);
            Predicate dummyPred = mock(Predicate.class);

            when(root.get(anyString())).thenReturn(path);
            when(path.get(anyString())).thenReturn(path);
            when(cb.lower(any())).thenReturn(path);
            when(cb.like(any(), anyString())).thenReturn(dummyPred);
            when(cb.or(any(), any(), any())).thenReturn(dummyPred);
            when(cb.isNull(any())).thenReturn(dummyPred);
            lenient().when(cb.equal(any(), any(Object.class))).thenReturn(dummyPred);
            when(cb.and(any(Predicate[].class))).thenReturn(dummyPred);

            // Case A: parentId = 0L (Root categories only) + keyword
            CategoryFilterRequest filterRoot = CategoryFilterRequest.builder()
                    .keyword("  Giày  ")
                    .parentId(0L)
                    .build();
            CategorySpecifications.filterCategories(filterRoot).toPredicate(root, query, cb);
            verify(cb, times(1)).isNull(any());
            verify(cb, times(3)).like(any(), eq("%giày%"));

            // Case B: parentId = 5L (Subcategories of parent 5)
            CategoryFilterRequest filterSub = CategoryFilterRequest.builder()
                    .parentId(5L)
                    .build();
            CategorySpecifications.filterCategories(filterSub).toPredicate(root, query, cb);
            verify(cb, times(1)).equal(any(), eq(5L));
        }
    }
}
