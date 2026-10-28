package com.web.ap_sports.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.common.ProductFilterRequest;
import com.web.ap_sports.dto.response.common.ProductResponse;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.search.HybridSearchEngineService;
import com.web.ap_sports.search.SearchVector;
import com.web.ap_sports.search.VietnameseTokenizer;
import com.web.ap_sports.service.customer.impl.CustomerProductServiceImpl;
import com.web.ap_sports.specification.ProductSpecifications;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Tìm kiếm Thông minh Hybrid Search & Bộ lọc Specification (Phần 4: TC-SRCH-01.1 -> TC-SRCH-04.3, gồm 16 Unit Tests).
 * Bao phủ: VietnameseTokenizer, SearchVector, HybridSearchEngineService, CustomerProductServiceImpl & ProductSpecifications.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Hybrid Search Engine & Product Specifications Unit Tests (Phần 4 - 16 Tests)")
class HybridSearchAndSpecificationTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private ProductImageRepository imageRepository;

    private HybridSearchEngineService hybridSearchEngineService;
    private CustomerProductServiceImpl customerProductService;

    private Category footballCategory;

    @BeforeEach
    void setUp() {
        hybridSearchEngineService = new HybridSearchEngineService();
        customerProductService = new CustomerProductServiceImpl(
                productRepository,
                variantRepository,
                imageRepository,
                hybridSearchEngineService,
                new ObjectMapper()
        );

        footballCategory = Category.builder()
                .id(1L)
                .name("Giày Bóng Đá")
                .slug("giay-bong-da")
                .build();
    }

    // =========================================================================
    // NHÓM 4.1: XỬ LÝ NGÔN NGỮ TIẾNG VIỆT & KHÔNG GIAN VECTOR TF-IDF (6 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 4.1: Xử lý Ngôn ngữ Tiếng Việt & Không gian Vector TF-IDF (TC-SRCH-01 -> TC-SRCH-02)")
    class TokenizerAndSearchVectorTests {

        @Test
        @DisplayName("TC-SRCH-01.1: Khử dấu tiếng Việt chuẩn Unicode NFD và chuyển đổi Đ/đ -> D/d (VietnameseTokenizer.stripAccents)")
        void stripAccents_VietnameseDiacriticsAndLetterD_Success() {
            String raw = "Đội tuyển Bóng Đá Quốc Gia Việt Nam - Đệm giảm chấn";
            String stripped = VietnameseTokenizer.stripAccents(raw);

            assertEquals("Doi tuyen Bong Da Quoc Gia Viet Nam - Dem giam chan", stripped);
            assertEquals("", VietnameseTokenizer.stripAccents(null));
        }

        @Test
        @DisplayName("TC-SRCH-01.2: Chuẩn hóa chuỗi (normalizeText) -> Đưa về chữ thường, xóa ký tự đặc biệt và gộp khoảng trắng thừa")
        void normalizeText_RemovesSpecialCharsAndCollapsesSpaces() {
            String raw = "  GIÀY   ĐÁ-BÓNG   @Nike#Mercurial!! (Size: 42)  ";
            String normalized = VietnameseTokenizer.normalizeText(raw);

            assertEquals("giay da bong nike mercurial size 42", normalized);
            assertEquals("", VietnameseTokenizer.normalizeText("   "));
        }

        @Test
        @DisplayName("TC-SRCH-01.3: Bóc tách từ khóa (tokenize) và lọc bỏ hoàn toàn các Stop-words hội thoại mua sắm tiếng Việt")
        void tokenize_RemovesConversationalStopWords_Success() {
            String query = "Shop ơi cho tui hỏi mình muốn mua và tìm xem giày chạy bộ của hãng Nike";
            List<String> tokens = VietnameseTokenizer.tokenize(query);

            // Các từ dừng bắt buộc bị loại bỏ: shop, cho, tui, minh, muon, mua, va, tim, xem, cua
            assertFalse(tokens.contains("shop"));
            assertFalse(tokens.contains("tui"));
            assertFalse(tokens.contains("muon"));
            assertFalse(tokens.contains("mua"));
            assertFalse(tokens.contains("tim"));
            assertTrue(tokens.containsAll(List.of("giay", "chay", "bo", "nike")));
        }

        @Test
        @DisplayName("TC-SRCH-02.1: Tính độ dài Euclidean (norm) và Tích vô hướng (dotProduct) của SearchVector")
        void searchVector_NormAndDotProduct_Success() {
            SearchVector vecA = new SearchVector();
            vecA.setWeight("nike", 3.0);
            vecA.setWeight("giay", 4.0);
            vecA.setWeight("ignored_zero", 0.0);

            SearchVector vecB = new SearchVector();
            vecB.setWeight("nike", 2.0);
            vecB.setWeight("ao", 5.0);

            assertEquals(2, vecA.getTerms().size());
            assertEquals(5.0, vecA.norm(), 1e-6, "sqrt(3^2 + 4^2) = 5.0");
            assertEquals(6.0, vecA.dotProduct(vecB), 1e-6, "3.0 * 2.0 = 6.0");
        }

        @Test
        @DisplayName("TC-SRCH-02.2: Tính Độ tương đồng góc Cosine (cosineSimilarity) cho 2 Vector cùng phương và trực giao")
        void searchVector_CosineSimilarity_CollinearAndOrthogonal() {
            SearchVector vecA = new SearchVector(Map.of("nike", 2.0, "mercurial", 4.0));
            SearchVector vecB = new SearchVector(Map.of("nike", 1.0, "mercurial", 2.0));
            SearchVector vecC = new SearchVector(Map.of("adidas", 3.0, "predator", 5.0));

            assertEquals(1.0, vecA.cosineSimilarity(vecB), 1e-6);
            assertEquals(0.0, vecA.cosineSimilarity(vecC), 1e-6);
        }

        @Test
        @DisplayName("TC-SRCH-02.3: Chống lỗi chia cho 0 (Division by zero) trên SearchVector khi Vector rỗng hoặc null")
        void searchVector_CosineSimilarity_ZeroVectorAndNullSafety() {
            SearchVector emptyVec = new SearchVector();
            SearchVector validVec = new SearchVector(Map.of("nike", 2.0));

            assertEquals(0.0, emptyVec.cosineSimilarity(validVec));
            assertEquals(0.0, validVec.cosineSimilarity(emptyVec));
            assertEquals(0.0, validVec.cosineSimilarity(null));
        }
    }

    // =========================================================================
    // NHÓM 4.2: THUẬT TOÁN XẾP HẠNG HYBRID SEARCH ENGINE & BỘ LỌC SPECIFICATION (10 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 4.2: Thuật toán Xếp hạng Hybrid Search Engine & Bộ lọc JPA Specification (TC-SRCH-03 -> TC-SRCH-04)")
    class HybridRankingAndSpecificationTests {

        @Test
        @DisplayName("TC-SRCH-03.1: Chấm điểm ưu tiên cao nhất cho Sản phẩm khớp 100% Tên (+100đ) so với Chứa cụm từ (+80đ) và Khớp một phần (+60đ*ratio)")
        void rankProducts_NameMatchingHierarchy_OrdersCorrectly() {
            Product pExact = Product.builder().id(1L).name("Giày Nike Mercurial").category(footballCategory).build();
            Product pContains = Product.builder().id(2L).name("Giày Nike Mercurial Superfly 9 Elite").category(footballCategory).build();
            Product pPartial = Product.builder().id(3L).name("Giày đá bóng Nike Tiempo").category(footballCategory).build();

            List<Product> ranked = hybridSearchEngineService.rankProducts(
                    "Giày Nike Mercurial",
                    List.of(pPartial, pContains, pExact),
                    Collections.emptyMap()
            );

            assertEquals(3, ranked.size());
            assertEquals(1L, ranked.get(0).getId(), "Khớp 100% tên phải đứng hạng 1");
            assertEquals(2L, ranked.get(1).getId(), "Chứa trọn cụm từ phải đứng hạng 2");
            assertEquals(3L, ranked.get(2).getId(), "Khớp một phần từ phải đứng hạng 3");
        }

        @Test
        @DisplayName("TC-SRCH-03.2: Cộng điểm Thuộc tính Biến thể (+30đ cho SKU, Màu sắc, Kích thước) & Danh mục (+40đ) + Specifications (+20đ)")
        void rankProducts_VariantColorSizeAndSpecsBoostScore() {
            Product pWithMatchingVariant = Product.builder()
                    .id(10L)
                    .name("Giày Bóng Đá Pro")
                    .category(footballCategory)
                    .specifications("{\"Đế giày\":\"TF\"}")
                    .build();
            Product pWithoutMatchingVariant = Product.builder()
                    .id(20L)
                    .name("Giày Bóng Đá Pro")
                    .category(footballCategory)
                    .build();

            ProductVariant red42 = ProductVariant.builder()
                    .id(100L).product(pWithMatchingVariant).sku("PRO-RED-42").color("Đỏ").size("42").build();
            ProductVariant black39 = ProductVariant.builder()
                    .id(200L).product(pWithoutMatchingVariant).sku("PRO-BLK-39").color("Đen").size("39").build();

            Map<Long, List<ProductVariant>> variantMap = Map.of(
                    10L, List.of(red42),
                    20L, List.of(black39)
            );

            List<Product> ranked = hybridSearchEngineService.rankProducts(
                    "Giày bóng đá đỏ 42 TF",
                    List.of(pWithoutMatchingVariant, pWithMatchingVariant),
                    variantMap
            );

            assertFalse(ranked.isEmpty());
            assertEquals(10L, ranked.get(0).getId(), "Sản phẩm có biến thể khớp Màu Đỏ + Size 42 + Specs TF phải xếp hạng 1");
        }

        @Test
        @DisplayName("TC-SRCH-03.3: Tìm kiếm chính xác sản phẩm theo Mã SKU của Biến thể (VD: 'NIKE-MER-RED-42')")
        void rankProducts_ExactVariantSkuMatch_Success() {
            Product p1 = Product.builder().id(1L).name("Giày Đá Bóng").category(footballCategory).build();
            Product p2 = Product.builder().id(2L).name("Áo Đấu Thể Thao").category(footballCategory).build();

            ProductVariant v1 = ProductVariant.builder().id(11L).product(p1).sku("NIKE-MER-RED-42").color("Đỏ").size("42").build();

            List<Product> ranked = hybridSearchEngineService.rankProducts(
                    "NIKE-MER-RED-42",
                    List.of(p1, p2),
                    Map.of(1L, List.of(v1))
            );

            assertEquals(1, ranked.size());
            assertEquals(1L, ranked.get(0).getId());
        }

        @Test
        @DisplayName("TC-SRCH-03.4: Loại bỏ sản phẩm nhiễu có điểm HybridScore < SEARCH_THRESHOLD (0.15)")
        void rankProducts_FiltersOutLowRelevanceNoiseBelowThreshold() {
            Product targetProduct = Product.builder()
                    .id(1L)
                    .name("Vợt Cầu Lông Yonex Astrox 100ZZ")
                    .description("Vợt cầu lông chính hãng công nghệ cao")
                    .build();

            // Sản phẩm nhiễu: không khớp tên/danh mục/biến thể, chỉ dính 1 từ trong mô tả rất dài -> HybridScore < 0.15
            String longIrrelevantDesc = "Bình nước thể thao cao cấp giữ nhiệt lạnh suốt 24 giờ thích hợp tập gym đạp xe leo núi " +
                    "chất liệu inox 304 an toàn sức khỏe thiết kế nắp bật chống tràn tiện lợi mang đi học đi làm " +
                    "bền bỉ chịu va đập tốt dung tích lớn 1000ml màu bạc sang trọng bảo hành chính hãng 12 tháng cầu";
            Product noiseProduct = Product.builder()
                    .id(2L)
                    .name("Bình Nước Giữ Nhiệt Inox 1000ml")
                    .description(longIrrelevantDesc)
                    .build();

            List<Product> ranked = hybridSearchEngineService.rankProducts(
                    "Vợt cầu lông Yonex Astrox 100ZZ",
                    List.of(targetProduct, noiseProduct),
                    Collections.emptyMap()
            );

            assertEquals(1, ranked.size());
            assertEquals(1L, ranked.get(0).getId());
            assertFalse(ranked.contains(noiseProduct));
        }

        @Test
        @DisplayName("TC-SRCH-03.5: Quy tắc Tie-Breaking khi 2 sản phẩm có cùng điểm HybridScore -> Ưu tiên sản phẩm mới hơn (Product ID lớn hơn)")
        void rankProducts_TieBreakingByHigherProductId() {
            Product olderProduct = Product.builder().id(10L).name("Giày Nike").build();
            Product newerProduct = Product.builder().id(99L).name("Giày Nike").build();

            List<Product> ranked = hybridSearchEngineService.rankProducts(
                    "Giày Nike",
                    List.of(olderProduct, newerProduct),
                    Collections.emptyMap()
            );

            assertEquals(2, ranked.size());
            assertEquals(99L, ranked.get(0).getId());
            assertEquals(10L, ranked.get(1).getId());
        }

        @Test
        @DisplayName("TC-SRCH-03.6: Xử lý an toàn khi rawQuery rỗng, chỉ chứa Stop-words, hoặc Corpus rỗng")
        void searchProductsByRelevance_EmptyOrStopWordsQueryOrEmptyCorpus_ReturnsEmptyPage() {
            // 1. Keyword rỗng
            Page<ProductResponse> emptyQueryPage = customerProductService.searchProductsByRelevance("   ", 0, 10);
            assertTrue(emptyQueryPage.getContent().isEmpty());

            // 2. Corpus rỗng
            when(productRepository.findAllInStockProductsWithCategories()).thenReturn(Collections.emptyList());
            Page<ProductResponse> emptyCorpusPage = customerProductService.searchProductsByRelevance("Nike", 0, 10);
            assertTrue(emptyCorpusPage.getContent().isEmpty());

            // 3. Query chỉ chứa stop-words ("tui muốn mua")
            Product p1 = Product.builder().id(1L).name("Giày Nike").categories(Set.of()).build();
            when(productRepository.findAllInStockProductsWithCategories()).thenReturn(List.of(p1));
            when(variantRepository.findByProductIdIn(List.of(1L))).thenReturn(Collections.emptyList());

            Page<ProductResponse> stopWordPage = customerProductService.searchProductsByRelevance("tui muốn mua", 0, 10);
            assertTrue(stopWordPage.getContent().isEmpty());
        }

        @Test
        @DisplayName("TC-SRCH-03.7: Phân trang (Pagination) chính xác trên danh sách kết quả đã xếp hạng trong CustomerProductServiceImpl")
        void searchProductsByRelevance_PaginationSlice_Success() {
            Product p1 = Product.builder().id(1L).name("Giày Nike 1").categories(Set.of()).build();
            Product p2 = Product.builder().id(2L).name("Giày Nike 2").categories(Set.of()).build();
            Product p3 = Product.builder().id(3L).name("Giày Nike 3").categories(Set.of()).build();

            when(productRepository.findAllInStockProductsWithCategories()).thenReturn(List.of(p1, p2, p3));
            when(variantRepository.findByProductIdIn(anyList())).thenReturn(Collections.emptyList());

            // Lấy trang 2 (page = 1) với size = 2 -> Chỉ chứa phần tử thứ 3
            Page<ProductResponse> page1 = customerProductService.searchProductsByRelevance("Giày Nike", 1, 2);
            assertEquals(3, page1.getTotalElements());
            assertEquals(1, page1.getContent().size());

            // Lấy trang vượt quá giới hạn (page = 5) -> Danh sách rỗng nhưng totalElements vẫn = 3
            Page<ProductResponse> pageOut = customerProductService.searchProductsByRelevance("Giày Nike", 5, 2);
            assertTrue(pageOut.getContent().isEmpty());
            assertEquals(3, pageOut.getTotalElements());
        }

        @Test
        @SuppressWarnings({"unchecked", "rawtypes"})
        @DisplayName("TC-SRCH-04.1: Bộ lọc ProductSpecifications -> Tìm kiếm theo keyword kết hợp Tên, Slug và Subquery ProductVariant.sku")
        void productSpecifications_KeywordWithVariantSkuSubquery_Success() {
            Root<Product> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder cb = mock(CriteriaBuilder.class);
            Subquery<Long> subquery = mock(Subquery.class);
            Root<ProductVariant> variantRoot = mock(Root.class);
            Path path = mock(Path.class);
            Predicate dummyPred = mock(Predicate.class);
            CriteriaBuilder.In inClause = mock(CriteriaBuilder.In.class);

            when(root.get(anyString())).thenReturn(path);
            when(path.get(anyString())).thenReturn(path);
            when(cb.lower(any())).thenReturn(path);
            when(cb.like(any(), anyString())).thenReturn(dummyPred);
            when(query.subquery(Long.class)).thenReturn(subquery);
            when(subquery.from(ProductVariant.class)).thenReturn(variantRoot);
            when(variantRoot.get(anyString())).thenReturn(path);
            when(subquery.select(any())).thenReturn(subquery);
            when(subquery.where(any(Predicate.class))).thenReturn(subquery);
            when(cb.in(any())).thenReturn(inClause);
            when(inClause.value(subquery)).thenReturn(inClause);
            when(cb.or(any(), any(), any())).thenReturn(dummyPred);
            when(cb.and(any(Predicate[].class))).thenReturn(dummyPred);

            ProductFilterRequest filter = ProductFilterRequest.builder().keyword("  NIKE-SKU-01  ").build();
            ProductSpecifications.filterProducts(filter).toPredicate(root, query, cb);

            verify(query, times(1)).distinct(true);
            verify(query, times(1)).subquery(Long.class);
            verify(cb, times(3)).like(any(), eq("%nike-sku-01%"));
        }

        @Test
        @SuppressWarnings({"unchecked", "rawtypes"})
        @DisplayName("TC-SRCH-04.2: Bộ lọc ProductSpecifications -> Lọc theo categoryId bao phủ cả Danh mục chính và LEFT JOIN Danh mục phụ")
        void productSpecifications_CategoryFilterPrimaryAndSecondaryJoin_Success() {
            Root<Product> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder cb = mock(CriteriaBuilder.class);
            Path path = mock(Path.class);
            Join categoryJoin = mock(Join.class);
            Predicate dummyPred = mock(Predicate.class);

            when(root.get(anyString())).thenReturn(path);
            when(path.get(anyString())).thenReturn(path);
            when(root.join("categories", JoinType.LEFT)).thenReturn(categoryJoin);
            when(categoryJoin.get("id")).thenReturn(path);
            when(cb.equal(any(), eq(7L))).thenReturn(dummyPred);
            when(cb.or(any(), any())).thenReturn(dummyPred);
            when(cb.and(any(Predicate[].class))).thenReturn(dummyPred);

            ProductFilterRequest filter = ProductFilterRequest.builder().categoryId(7L).build();
            ProductSpecifications.filterProducts(filter).toPredicate(root, query, cb);

            verify(root, times(1)).join("categories", JoinType.LEFT);
            verify(cb, times(2)).equal(any(), eq(7L));
            verify(cb, times(1)).or(any(), any());
        }

        @Test
        @SuppressWarnings({"unchecked", "rawtypes"})
        @DisplayName("TC-SRCH-04.3: Bộ lọc ProductSpecifications -> Lọc theo nhiều kích cỡ biến thể (variantSize = 'S, M, XL') và khoảng giá (minPrice, maxPrice)")
        void productSpecifications_MultiVariantSizeAndPriceRange_Success() {
            Root<Product> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder cb = mock(CriteriaBuilder.class);
            Subquery<Long> sizeSubquery = mock(Subquery.class);
            Root<ProductVariant> variantRoot = mock(Root.class);
            Path path = mock(Path.class);
            Predicate dummyPred = mock(Predicate.class);
            CriteriaBuilder.In inClause = mock(CriteriaBuilder.In.class);

            when(root.get(anyString())).thenReturn(path);
            when(path.get(anyString())).thenReturn(path);
            when(cb.lower(any())).thenReturn(path);
            lenient().when(cb.equal(any(), any(Object.class))).thenReturn(dummyPred);
            when(query.subquery(Long.class)).thenReturn(sizeSubquery);
            when(sizeSubquery.from(ProductVariant.class)).thenReturn(variantRoot);
            when(variantRoot.get(anyString())).thenReturn(path);
            when(path.in(anyList())).thenReturn(dummyPred);
            when(sizeSubquery.select(any())).thenReturn(sizeSubquery);
            when(sizeSubquery.where(any(Predicate.class))).thenReturn(sizeSubquery);
            when(cb.in(any())).thenReturn(inClause);
            when(inClause.value(sizeSubquery)).thenReturn(inClause);
            when(cb.greaterThanOrEqualTo(any(), any(BigDecimal.class))).thenReturn(dummyPred);
            when(cb.lessThanOrEqualTo(any(), any(BigDecimal.class))).thenReturn(dummyPred);
            when(cb.and(any(Predicate[].class))).thenReturn(dummyPred);

            ProductFilterRequest filter = ProductFilterRequest.builder()
                    .status("in_stock")
                    .unit("Đôi")
                    .variantSize(" S, M , XL ")
                    .minPrice(new BigDecimal("200000"))
                    .maxPrice(new BigDecimal("1000000"))
                    .build();

            ProductSpecifications.filterProducts(filter).toPredicate(root, query, cb);

            verify(path, times(1)).in(List.of("s", "m", "xl"));
            verify(cb, times(1)).greaterThanOrEqualTo(any(), eq(new BigDecimal("200000")));
            verify(cb, times(1)).lessThanOrEqualTo(any(), eq(new BigDecimal("1000000")));
        }
    }
}
