package com.web.ap_sports.search;

import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductVariant;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core Search Engine Service: Thực thi thuật toán Tìm kiếm Sản phẩm Thông minh theo mô hình Hybrid Search.
 * Mô hình kết hợp 2 thành phần:
 * 1. Structured Attribute Matching (Đánh giá độ trùng khớp thuộc tính cấu trúc: Name, Category, Variant Color/Size/SKU).
 * 2. TF-IDF Vector Space Model & Cosine Similarity (Đánh giá độ tương đồng tần số từ khóa trong không gian đa chiều).
 */
@Service
public class HybridSearchEngineService {

    /**
     * Ngưỡng lọc kết quả được lựa chọn thực nghiệm nhằm loại bỏ các sản phẩm có mức độ liên quan thấp.
     * Tự động loại bỏ sản phẩm không khớp tên/thuộc tính mà chỉ lỡ dính từ rác trong mô tả dài.
     */
    private static final double SEARCH_THRESHOLD = 0.15;

    /**
     * Trọng số thiết kế thực nghiệm cho điểm Thuộc tính Cấu trúc (Attribute Score)
     */
    private static final double ATTR_WEIGHT = 0.6;

    /**
     * Trọng số thiết kế thực nghiệm cho điểm Tương đồng Tần số Từ khóa (TF-IDF Cosine Similarity)
     */
    private static final double TFIDF_WEIGHT = 0.4;

    /**
     * Tổng trọng số tối đa cho Attribute Matching (Name: 100đ, Category: 40đ, Variant: 30đ, Specs: 20đ)
     */
    private static final double MAX_ATTR_WEIGHT = 190.0;

    /**
     * Class DTO nội bộ dùng để đóng gói thông tin Sản phẩm kèm các thành phần điểm số
     */
    public static class ScoredProduct {
        private final Product product;
        private final double hybridScore;
        private final double attributeScore;
        private final double tfidfScore;

        public ScoredProduct(Product product, double hybridScore, double attributeScore, double tfidfScore) {
            this.product = product;
            this.hybridScore = hybridScore;
            this.attributeScore = attributeScore;
            this.tfidfScore = tfidfScore;
        }

        public Product getProduct() {
            return product;
        }

        public double getHybridScore() {
            return hybridScore;
        }

        public double getAttributeScore() {
            return attributeScore;
        }

        public double getTfidfScore() {
            return tfidfScore;
        }
    }

    /**
     * Hàm chính thực thi Tìm kiếm, Tính điểm và Xếp hạng Danh sách Sản phẩm.
     * 
     * @param rawQuery Từ khóa người dùng nhập (Ví dụ: "Nike Mercurial đỏ 42")
     * @param corpus Tập dữ liệu toàn bộ sản phẩm đang kinh doanh (in_stock)
     * @param variantMap Map lưu trữ danh sách biến thể theo Product ID
     * @return Danh sách sản phẩm đã được lọc theo Ngưỡng thực nghiệm và sắp xếp giảm dần theo HybridScore
     */
    public List<Product> rankProducts(String rawQuery, List<Product> corpus, Map<Long, List<ProductVariant>> variantMap) {
        // Kiểm tra tính hợp lệ của tham số đầu vào
        if (rawQuery == null || rawQuery.isBlank() || corpus == null || corpus.isEmpty()) {
            return Collections.emptyList();
        }

        // BƯỚC 1: Tiền xử lý từ khóa tìm kiếm (Loại bỏ dấu, chữ thường, bóc tách tokens và lọc stop-words)
        List<String> queryTokens = VietnameseTokenizer.tokenize(rawQuery);
        if (queryTokens.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = VietnameseTokenizer.normalizeText(rawQuery);
        int corpusSize = corpus.size();

        // BƯỚC 2: Xây dựng Tập dữ liệu Văn bản (Corpus Tokens) và Ma trận Tần số Văn bản (Document Frequency - DF)
        Map<Long, List<String>> docTokensMap = new HashMap<>();
        Map<String, Integer> docFrequencyMap = new HashMap<>();

        for (Product product : corpus) {
            // Trích xuất toàn bộ token của sản phẩm (Name, Category, Variants, Description)
            List<String> docTokens = extractProductTokens(product, variantMap.get(product.getId()));
            docTokensMap.put(product.getId(), docTokens);

            // Đếm tần suất xuất hiện từ trong tập văn bản (Doc Frequency - DF)
            Set<String> uniqueTokensInDoc = new HashSet<>(docTokens);
            for (String token : uniqueTokensInDoc) {
                docFrequencyMap.put(token, docFrequencyMap.getOrDefault(token, 0) + 1);
            }
        }

        // BƯỚC 3: Xây dựng Vector TF-IDF đại diện cho User Query
        SearchVector queryVector = buildQueryTfidfVector(queryTokens, docFrequencyMap, corpusSize);

        // BƯỚC 4: Tính toán Điểm số cho từng Sản phẩm trong Corpus
        List<ScoredProduct> scoredProducts = new ArrayList<>();

        for (Product product : corpus) {
            List<String> docTokens = docTokensMap.get(product.getId());
            List<ProductVariant> variants = variantMap.getOrDefault(product.getId(), Collections.emptyList());

            // --- A. Điểm Thuộc tính Cấu trúc Chuẩn hóa (AttributeScore thuộc khoảng [0.0, 1.0]) ---
            double attrScore = calculateNormalizedAttributeScore(normalizedQuery, queryTokens, product, variants);

            // --- B. Điểm Tương đồng Cosine trên Ma trận TF-IDF (TFIDFScore thuộc khoảng [0.0, 1.0]) ---
            SearchVector docVector = buildDocumentTfidfVector(docTokens, docFrequencyMap, corpusSize);
            double tfidfScore = queryVector.cosineSimilarity(docVector);

            // --- C. Công thức Tổng hợp Hybrid Score ---
            // HybridScore = 0.6 * AttributeScore + 0.4 * TFIDFScore  (Đảm bảo 0.0 <= HybridScore <= 1.0)
            double hybridScore = (ATTR_WEIGHT * attrScore) + (TFIDF_WEIGHT * tfidfScore);

            // --- D. Lọc theo Ngưỡng Lọc Thực Nghiệm (Empirical Filtering Threshold T = 0.15) ---
            // Chỉ giữ lại các sản phẩm có điểm số >= 0.15. Loại bỏ hoàn toàn kết quả rác từ mô tả dài.
            if (hybridScore >= SEARCH_THRESHOLD) {
                scoredProducts.add(new ScoredProduct(product, hybridScore, attrScore, tfidfScore));
            }
        }

        // BƯỚC 5: Sắp xếp danh sách kết quả giảm dần theo HybridScore (Nếu bằng điểm thì xếp theo Product ID giảm dần)
        scoredProducts.sort((a, b) -> {
            int scoreCompare = Double.compare(b.getHybridScore(), a.getHybridScore());
            if (scoreCompare != 0) return scoreCompare;
            return Long.compare(b.getProduct().getId(), a.getProduct().getId());
        });

        // BƯỚC 6: Trả về danh sách đối tượng Product đã qua xếp hạng
        return scoredProducts.stream()
                .map(ScoredProduct::getProduct)
                .collect(Collectors.toList());
    }

    /**
     * Tính toán Điểm Thuộc tính Cấu trúc Chuẩn hóa (AttributeScore thuộc khoảng [0.0, 1.0]).
     * Ưu tiên tuyệt đối các thuộc tính quan trọng: Tên sản phẩm, Danh mục, Biến thể (Màu, Size, SKU).
     */
    private double calculateNormalizedAttributeScore(String normalizedQuery, List<String> queryTokens, Product product, List<ProductVariant> variants) {
        double totalMatchedWeight = 0.0;

        // --- 1. Đánh giá Tên Sản Phẩm (Tối đa 100 điểm) ---
        String normalizedName = VietnameseTokenizer.normalizeText(product.getName());
        if (normalizedName.equals(normalizedQuery)) {
            // Khớp hoàn toàn 100% cụm từ tìm kiếm
            totalMatchedWeight += 100.0;
        } else if (normalizedName.contains(normalizedQuery)) {
            // Chứa trọn vẹn cụm từ tìm kiếm
            totalMatchedWeight += 80.0;
        } else {
            // Tính tỷ lệ số từ trong truy vấn xuất hiện ở tên sản phẩm
            long matchedTokensInName = queryTokens.stream().filter(normalizedName::contains).count();
            if (matchedTokensInName > 0) {
                double ratio = (double) matchedTokensInName / queryTokens.size();
                totalMatchedWeight += (ratio * 60.0);
            }
        }

        // --- 2. Đánh giá Danh Mục Sản Phẩm (Tối đa 40 điểm) ---
        boolean categoryMatched = false;
        // Kiểm tra danh mục chính (Primary Category)
        if (product.getCategory() != null) {
            String normCat = VietnameseTokenizer.normalizeText(product.getCategory().getName());
            if (normCat.contains(normalizedQuery) || queryTokens.stream().anyMatch(normCat::contains)) {
                categoryMatched = true;
            }
        }
        // Kiểm tra danh mục phụ (Secondary Categories)
        if (!categoryMatched && product.getCategories() != null) {
            for (Category c : product.getCategories()) {
                String normCat = VietnameseTokenizer.normalizeText(c.getName());
                if (normCat.contains(normalizedQuery) || queryTokens.stream().anyMatch(normCat::contains)) {
                    categoryMatched = true;
                    break;
                }
            }
        }
        if (categoryMatched) {
            totalMatchedWeight += 40.0;
        }

        // --- 3. Đánh giá Thuộc tính Biến thể ProductVariant: SKU, Color, Size (Tối đa 30 điểm) ---
        if (variants != null && !variants.isEmpty()) {
            boolean variantMatched = false;
            for (ProductVariant v : variants) {
                // Khớp mã SKU sản phẩm
                if (v.getSku() != null && VietnameseTokenizer.normalizeText(v.getSku()).contains(normalizedQuery)) {
                    variantMatched = true;
                    break;
                }
                // Khớp màu sắc biến thể (Ví dụ: "Đỏ", "Đen", "Xanh")
                if (v.getColor() != null) {
                    String normColor = VietnameseTokenizer.normalizeText(v.getColor());
                    if (queryTokens.stream().anyMatch(t -> t.equals(normColor) || normColor.contains(t))) {
                        variantMatched = true;
                        break;
                    }
                }
                // Khớp kích thước biến thể (Ví dụ: "42", "XL", "L")
                if (v.getSize() != null) {
                    String normSize = VietnameseTokenizer.normalizeText(v.getSize());
                    if (queryTokens.stream().anyMatch(t -> t.equals(normSize))) {
                        variantMatched = true;
                        break;
                    }
                }
            }
            if (variantMatched) {
                totalMatchedWeight += 30.0;
            }
        }

        // --- 4. Đánh giá Thông số Kỹ thuật Specifications (Tối đa 20 điểm) ---
        if (product.getSpecifications() != null && !product.getSpecifications().isBlank()) {
            String normSpecs = VietnameseTokenizer.normalizeText(product.getSpecifications());
            if (queryTokens.stream().anyMatch(normSpecs::contains)) {
                totalMatchedWeight += 20.0;
            }
        }

        // Chuẩn hóa tổng điểm về khoảng [0.0, 1.0]: AttributeScore = totalMatchedWeight / 190.0
        return Math.min(1.0, totalMatchedWeight / MAX_ATTR_WEIGHT);
    }

    /**
     * Trích xuất danh sách Tokens từ Sản phẩm kèm theo Hệ số nhân vị trí (Field Weighting):
     * - Tên sản phẩm: Nhân trọng số x3 (lặp lại 3 lần)
     * - Danh mục: Nhân trọng số x2 (lặp lại 2 lần)
     * - Biến thể: Nhân trọng số x1.5
     * - Mô tả dài: Trọng số x1 (chỉ lấy token thô)
     */
    private List<String> extractProductTokens(Product product, List<ProductVariant> variants) {
        List<String> tokens = new ArrayList<>();

        // Tên sản phẩm có độ ưu tiên cao nhất -> Nhân trọng số x3
        List<String> nameTokens = VietnameseTokenizer.tokenize(product.getName());
        for (int i = 0; i < 3; i++) {
            tokens.addAll(nameTokens);
        }

        // Danh mục sản phẩm -> Nhân trọng số x2
        if (product.getCategory() != null) {
            List<String> catTokens = VietnameseTokenizer.tokenize(product.getCategory().getName());
            tokens.addAll(catTokens);
            tokens.addAll(catTokens);
        }

        // Thông tin biến thể (SKU, Color, Size) -> Nhân trọng số x1.5
        if (variants != null) {
            for (ProductVariant v : variants) {
                if (v.getSku() != null) tokens.addAll(VietnameseTokenizer.tokenize(v.getSku()));
                if (v.getColor() != null) tokens.addAll(VietnameseTokenizer.tokenize(v.getColor()));
                if (v.getSize() != null) tokens.addAll(VietnameseTokenizer.tokenize(v.getSize()));
            }
        }

        // Mô tả sản phẩm -> Trọng số x1
        if (product.getDescription() != null) {
            tokens.addAll(VietnameseTokenizer.tokenize(product.getDescription()));
        }

        return tokens;
    }

    /**
     * Xây dựng Vector TF-IDF cho User Query.
     * Công thức: TF(t) = count(t) / totalTokens, IDF(t) = ln(1 + N / (1 + df(t)))
     */
    private SearchVector buildQueryTfidfVector(List<String> queryTokens, Map<String, Integer> docFrequencyMap, int corpusSize) {
        Map<String, Integer> termCounts = new HashMap<>();
        for (String token : queryTokens) {
            termCounts.put(token, termCounts.getOrDefault(token, 0) + 1);
        }

        SearchVector vector = new SearchVector();
        int totalTokens = queryTokens.size();

        for (Map.Entry<String, Integer> entry : termCounts.entrySet()) {
            String term = entry.getKey();
            // TF (Term Frequency) = Số lần xuất hiện của từ trong Query / Tổng số từ của Query
            double tf = (double) entry.getValue() / totalTokens;
            int df = docFrequencyMap.getOrDefault(term, 0);

            // IDF (Inverse Document Frequency) = ln(1 + N / (1 + df))
            double idf = Math.log(1.0 + ((double) corpusSize / (1.0 + df)));
            vector.setWeight(term, tf * idf);
        }
        return vector;
    }

    /**
     * Xây dựng Vector TF-IDF cho Document của Sản phẩm trong Corpus.
     */
    private SearchVector buildDocumentTfidfVector(List<String> docTokens, Map<String, Integer> docFrequencyMap, int corpusSize) {
        if (docTokens.isEmpty()) return new SearchVector();

        Map<String, Integer> termCounts = new HashMap<>();
        for (String token : docTokens) {
            termCounts.put(token, termCounts.getOrDefault(token, 0) + 1);
        }

        SearchVector vector = new SearchVector();
        int totalTokens = docTokens.size();

        for (Map.Entry<String, Integer> entry : termCounts.entrySet()) {
            String term = entry.getKey();
            double tf = (double) entry.getValue() / totalTokens;
            int df = docFrequencyMap.getOrDefault(term, 0);

            double idf = Math.log(1.0 + ((double) corpusSize / (1.0 + df)));
            vector.setWeight(term, tf * idf);
        }
        return vector;
    }
}
