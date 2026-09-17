package com.web.ap_sports.search;

import lombok.Getter;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Class biểu diễn không gian Vector TF-IDF (Term Frequency - Inverse Document Frequency Vector Space).
 * Mỗi Vector là một HashMap chứa các cặp (Term -> Weight), biểu thị mức độ quan trọng của từ khóa.
 * Phục vụ tính toán đại số tuyến tính:
 * - Nhân vô hướng (Dot Product)
 * - Độ dài Vector (Norm/Magnitude: ||V||)
 * - Độ tương đồng góc Cosine (Cosine Similarity: (A . B) / (||A|| * ||B||))
 */
@Getter
public class SearchVector {

    // Map lưu trữ trọng số (Weight) của từng từ khóa (Term) trong Vector
    private final Map<String, Double> weights;

    public SearchVector() {
        this.weights = new HashMap<>();
    }

    public SearchVector(Map<String, Double> weights) {
        this.weights = weights != null ? weights : new HashMap<>();
    }

    /**
     * Gán trọng số cho một từ khóa trong Vector
     */
    public void setWeight(String term, double weight) {
        if (weight > 0) {
            weights.put(term, weight);
        }
    }

    /**
     * Lấy trọng số của từ khóa (Trả về 0.0 nếu từ khóa không tồn tại trong Vector)
     */
    public double getWeight(String term) {
        return weights.getOrDefault(term, 0.0);
    }

    /**
     * Lấy tập hợp tất cả các từ khóa có trong Vector này
     */
    public Set<String> getTerms() {
        return weights.keySet();
    }

    /**
     * Tính toán Độ dài (Norm hay Magnitude) của Vector trong không gian Euclidean.
     * Công thức: ||V|| = sqrt(w1^2 + w2^2 + ... + wn^2)
     */
    public double norm() {
        double sumSquare = 0.0;
        for (double w : weights.values()) {
            sumSquare += w * w;
        }
        return Math.sqrt(sumSquare);
    }

    /**
     * Tính phép Nhân Vô Hướng (Dot Product) giữa Vector này và Vector khác.
     * Công thức: A . B = sum(A_i * B_i) cho tất cả các từ khóa chung
     */
    public double dotProduct(SearchVector other) {
        if (other == null || other.weights.isEmpty() || this.weights.isEmpty()) {
            return 0.0;
        }

        double dot = 0.0;
        // Tối ưu hiệu năng: Duyệt qua Map có số lượng phần tử nhỏ hơn để tiết kiệm vòng lặp
        Map<String, Double> smallerMap = this.weights.size() < other.weights.size() ? this.weights : other.weights;
        Map<String, Double> largerMap = this.weights.size() < other.weights.size() ? other.weights : this.weights;

        for (Map.Entry<String, Double> entry : smallerMap.entrySet()) {
            Double otherVal = largerMap.get(entry.getKey());
            if (otherVal != null) {
                // Nếu từ khóa xuất hiện ở cả 2 Vector, nhân trọng số của chúng và cộng dồn
                dot += entry.getValue() * otherVal;
            }
        }
        return dot;
    }

    /**
     * Tính Độ Tương Đồng Góc Cosine (Cosine Similarity) giữa Vector này (ví dụ: Query Vector)
     * và Vector khác (ví dụ: Product Document Vector).
     * Công thức: CosineSimilarity(A, B) = (A . B) / (||A|| * ||B||)
     * @return Giá trị thuộc khoảng [0.0, 1.0], với 1.0 là hoàn toàn trùng khớp ngữ nghĩa/từ khóa, 0.0 là hoàn toàn không liên quan.
     */
    public double cosineSimilarity(SearchVector other) {
        // 1. Tính tích vô hướng
        double dot = dotProduct(other);
        if (dot <= 0.0) return 0.0;

        // 2. Tính độ dài 2 Vector
        double normA = this.norm();
        double normB = other.norm();

        // Tránh lỗi chia cho 0 (Division by zero)
        if (normA == 0.0 || normB == 0.0) return 0.0;

        // 3. Trả về kết quả chuẩn hóa thuộc khoảng [0.0, 1.0]
        return dot / (normA * normB);
    }
}
