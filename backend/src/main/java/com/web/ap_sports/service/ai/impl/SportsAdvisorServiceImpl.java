package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.ai.AiSportsAdvisorRequest;
import com.web.ap_sports.dto.response.ai.AiSportsAdvisorResponse;
import com.web.ap_sports.dto.response.ai.ChatMessageResponse;
import com.web.ap_sports.entity.ChatMessage;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.ChatMessageRepository;
import com.web.ap_sports.repository.ProductRepository;
import com.web.ap_sports.repository.ProductVariantRepository;
import com.web.ap_sports.service.ai.AiPromptSanitizer;
import com.web.ap_sports.service.ai.GeminiRestClient;
import com.web.ap_sports.service.ai.SportsAdvisorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.util.*;

/**
 * Triển khai nghiệp vụ cho Agent 1: AI Sports Advisor.
 * Tuân thủ nghiêm ngặt:
 * 1. Không tự ý đặt hàng hoặc thêm vào giỏ hàng giùm khách.
 * 2. Pre-filtering nén ngữ cảnh sản phẩm siêu gọn (~200 tokens).
 * 3. Ứng xử lịch sự, khéo léo bẻ lái khi khách hỏi ngoài lề hoặc đùa giỡn.
 * 4. Đồng bộ tin nhắn vào bảng chat_messages (sender = user / bot).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SportsAdvisorServiceImpl implements SportsAdvisorService {

    private final GeminiRestClient geminiRestClient;
    private final AiPromptSanitizer promptSanitizer;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    private static final Locale VI_LOCALE = new Locale("vi", "VN");

    @Override
    @Transactional
    public AiSportsAdvisorResponse advise(AiSportsAdvisorRequest request, User currentUser) {
        // 1. Làm sạch prompt đầu vào, chống injection và che giấu PII
        String cleanQuestion = promptSanitizer.sanitizeUserPrompt(request.getQuestion(), 400);
        if (cleanQuestion.isBlank()) {
            return AiSportsAdvisorResponse.builder()
                    .reply("Dạ em chào anh/chị! Em có thể hỗ trợ anh/chị tư vấn chọn size giày, quần áo thể thao hay dụng cụ tập luyện nào hôm nay ạ?")
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }

        // 2. Lấy lịch sử hội thoại gần nhất (cửa sổ trượt 6 tin nhắn gần nhất)
        List<ChatMessage> recentDbMessages;
        if (currentUser != null) {
            recentDbMessages = chatMessageRepository.findRecentMessagesByUserId(currentUser.getId(), PageRequest.of(0, 6));
        } else if (request.getGuestToken() != null && !request.getGuestToken().isBlank()) {
            recentDbMessages = chatMessageRepository.findRecentMessagesByGuestToken(request.getGuestToken().trim(), PageRequest.of(0, 6));
        } else {
            recentDbMessages = Collections.emptyList();
        }

        // Đảo ngược lại theo thứ tự thời gian tăng dần để gửi lên Gemini
        List<ChatMessage> chronologicalMessages = new ArrayList<>(recentDbMessages);
        Collections.reverse(chronologicalMessages);

        List<GeminiRestClient.GeminiMessage> geminiMessages = new ArrayList<>();
        for (ChatMessage msg : chronologicalMessages) {
            String role = (msg.getSender() == ChatMessage.ChatSender.bot) ? "model" : "user";
            geminiMessages.add(new GeminiRestClient.GeminiMessage(role, msg.getMessage()));
        }

        // Thêm câu hỏi hiện tại vào danh sách hội thoại
        geminiMessages.add(new GeminiRestClient.GeminiMessage("user", cleanQuestion));

        // 3. Pre-filtering dữ liệu sản phẩm để nén context siêu nhẹ và chuẩn xác
        List<Product> allInStockProducts = productRepository.findAllInStockProductsWithCategories();
        List<Product> relevantProducts = preFilterProducts(cleanQuestion, request.getActiveProductSlug(), allInStockProducts);
        String productContextJson = buildCompactProductContext(relevantProducts);

        // 4. Xây dựng System Prompt với ranh giới an toàn nghiêm ngặt
        String systemInstruction = buildSystemInstruction(productContextJson);

        // 5. Gọi Gemini Flash API (nhiệt độ 0.4 để câu trả lời sinh động nhưng chuẩn xác)
        String rawReply = geminiRestClient.generateChatContent(systemInstruction, geminiMessages, 0.4, 2048);

        // Loại bỏ hoàn toàn ký tự ** (in đậm markdown) và chuyển đổi [Tên](/link) thành Tên thuần để tránh rối mắt
        String cleanReply = (rawReply != null) ? rawReply : "";
        cleanReply = cleanReply.replaceAll("\\[([^\\]]+)\\]\\([^\\)]+\\)", "$1");
        cleanReply = cleanReply.replace("**", "").trim();

        // 6. Tạo danh sách SuggestedProduct để Client render thẻ sản phẩm trực quan bên dưới
        List<AiSportsAdvisorResponse.SuggestedProduct> suggestedProducts = extractSuggestedProducts(relevantProducts, allInStockProducts, cleanReply, cleanQuestion);

        // 7. Lưu tin nhắn sạch vào cơ sở dữ liệu chat_messages kèm sản phẩm gợi ý của bot
        saveChatMessage(cleanQuestion, ChatMessage.ChatSender.user, currentUser, request.getGuestToken(), null);
        saveChatMessage(cleanReply, ChatMessage.ChatSender.bot, currentUser, request.getGuestToken(), suggestedProducts);

        return AiSportsAdvisorResponse.builder()
                .reply(cleanReply)
                .suggestedProducts(suggestedProducts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatHistory(User currentUser, String guestToken) {
        List<ChatMessage> entities;
        if (currentUser != null) {
            entities = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(currentUser.getId());
        } else if (guestToken != null && !guestToken.isBlank()) {
            entities = chatMessageRepository.findByGuestTokenOrderByCreatedAtAsc(guestToken.trim());
        } else {
            return Collections.emptyList();
        }

        return entities.stream().map(this::toChatMessageResponse).toList();
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage entity) {
        List<AiSportsAdvisorResponse.SuggestedProduct> products = null;
        if (entity.getSuggestedProductsJson() != null && !entity.getSuggestedProductsJson().isBlank()) {
            try {
                products = objectMapper.readValue(
                        entity.getSuggestedProductsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, AiSportsAdvisorResponse.SuggestedProduct.class)
                );
            } catch (Exception e) {
                log.warn("Không thể parse suggestedProductsJson cho message id {}: {}", entity.getId(), e.getMessage());
            }
        }
        return ChatMessageResponse.builder()
                .id(entity.getId())
                .sender(entity.getSender() != null ? entity.getSender().name() : "bot")
                .message(entity.getMessage())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .suggestedProducts(products)
                .build();
    }

    /**
     * Lọc thông minh sản phẩm liên quan:
     * - Nếu có activeProductSlug: lấy trực tiếp sản phẩm đó
     * - Nếu không: chấm điểm ngữ nghĩa sản phẩm dựa trên nhu cầu của khách (môn thể thao, ngành hàng, loại trang phục, màu sắc...)
     */
    private List<Product> preFilterProducts(String question, String activeProductSlug, List<Product> allInStock) {
        if (activeProductSlug != null && !activeProductSlug.isBlank()) {
            Optional<Product> directProduct = productRepository.findBySlug(activeProductSlug.trim());
            if (directProduct.isPresent()) {
                return List.of(directProduct.get());
            }
        }

        if (allInStock == null || allInStock.isEmpty()) {
            return Collections.emptyList();
        }

        String lowerQuestion = question.toLowerCase(Locale.ROOT);
        Map<Product, Integer> scoreMap = new LinkedHashMap<>();

        for (Product p : allInStock) {
            int score = calculateRelevanceScore(p, lowerQuestion);
            if (score > 0) {
                scoreMap.put(p, score);
            }
        }

        if (!scoreMap.isEmpty()) {
            return scoreMap.entrySet().stream()
                    .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                    .limit(6)
                    .map(Map.Entry::getKey)
                    .toList();
        }

        // Nếu câu hỏi chung chung (ví dụ "tư vấn giúp tôi"), lấy tối đa 6 sản phẩm mới nhất
        return allInStock.stream().limit(6).toList();
    }

    private int calculateRelevanceScore(Product p, String lowerQuestion) {
        int score = 0;
        String pName = p.getName() != null ? p.getName().toLowerCase(Locale.ROOT) : "";
        String cName = (p.getCategory() != null && p.getCategory().getName() != null)
                ? p.getCategory().getName().toLowerCase(Locale.ROOT) : "";

        // Khớp cụm từ chuyên biệt (ưu tiên cao nhất)
        if (lowerQuestion.contains("chạy bộ") || lowerQuestion.contains("chay bo") || lowerQuestion.contains("chạy")) {
            if (cName.contains("chạy") || pName.contains("chạy") || pName.contains("running") || pName.contains("jogger")) {
                score += 50;
            }
        }
        if (lowerQuestion.contains("đồ bộ") || lowerQuestion.contains("do bo") || lowerQuestion.contains("bộ đồ") || lowerQuestion.contains("bộ") || lowerQuestion.contains("set")) {
            if (cName.contains("bộ") || pName.contains("bộ") || pName.contains("set") || pName.contains("track set")) {
                score += 50;
            }
        }
        if (lowerQuestion.contains("bóng đá") || lowerQuestion.contains("bong da") || lowerQuestion.contains("đá bóng")) {
            if (cName.contains("bóng đá") || pName.contains("bóng đá") || pName.contains("mercurial") || pName.contains("fifa") || pName.contains("bóng")) {
                score += 50;
            }
        }
        if (lowerQuestion.contains("cầu lông") || lowerQuestion.contains("cau long")) {
            if (cName.contains("cầu lông") || pName.contains("cầu lông") || pName.contains("vợt") || pName.contains("badminton")) {
                score += 50;
            }
        }

        // Khớp từ khóa trang phục / dụng cụ
        String[] apparelKeywords = {"áo", "quần", "giày", "vợt", "bóng", "găng", "tất", "balô", "túi"};
        for (String kw : apparelKeywords) {
            if (lowerQuestion.contains(kw)) {
                if (pName.contains(kw) || cName.contains(kw)) {
                    score += 25;
                }
            }
        }

        // Khớp thương hiệu
        String[] brands = {"adidas", "nike", "puma", "lining", "yonex", "mizuno"};
        for (String b : brands) {
            if (lowerQuestion.contains(b) && pName.contains(b)) {
                score += 30;
            }
        }

        return score;
    }

    /**
     * Nén danh sách sản phẩm thành định dạng JSON Micro Context siêu gọn (~150-250 tokens)
     */
    private String buildCompactProductContext(List<Product> products) {
        if (products.isEmpty()) {
            return "[]";
        }

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(VI_LOCALE);
        List<Map<String, Object>> compactList = new ArrayList<>();

        for (Product p : products) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("name", p.getName());
            map.put("slug", p.getSlug());
            map.put("price", currencyFormat.format(p.getPrice()));
            map.put("link", "/products/" + p.getSlug());

            // Thu thập các size có sẵn từ bảng product_variants
            Set<String> sizes = new LinkedHashSet<>();
            List<ProductVariant> variants = productVariantRepository.findByProductId(p.getId());
            if (variants != null) {
                for (ProductVariant v : variants) {
                    if (v.getStockQuantity() != null && v.getStockQuantity() > 0 && v.getSize() != null) {
                        sizes.add(v.getSize());
                    }
                }
            }
            if (!sizes.isEmpty()) {
                map.put("available_sizes", sizes);
            }
            compactList.add(map);
        }

        try {
            return objectMapper.writeValueAsString(compactList);
        } catch (Exception e) {
            return "[]";
        }
    }

    /**
     * Xây dựng System Instruction chuẩn xác với Guardrails an toàn tuyệt đối
     */
    private String buildSystemInstruction(String productContextJson) {
        return """
                Bạn là Trợ lý AI Chuyên gia Tư vấn Thể thao của cửa hàng AP Sports.
                Bạn xưng 'em' và gọi khách hàng là 'anh/chị' với thái độ lịch sự, năng động, nhiệt tình, chuẩn phong cách thể thao.

                ⛔ CÁC NGUYÊN TẮC BẢO MẬT & TRÌNH BÀY BẮT BUỘC (QUAN TRỌNG NHẤT):
                1. BẠN TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN ĐẶT HÀNG GIÙM HOẶC THÊM SẢN PHẨM VÀO GIỎ HÀNG GIÚP KHÁCH HÀNG.
                2. Khi khách hàng bảo "đặt hàng giúp tôi", "thêm vào giỏ giùm tôi", bạn PHẢI TỪ CHỐI LỊCH SỰ:
                   "Dạ em là Trợ lý tư vấn thể thao AP Sports, em chỉ hỗ trợ tư vấn chọn đồ chuẩn. Anh/chị xem thẻ sản phẩm ở ngay bên dưới khung chat để chọn size và tự bấm 'Thêm vào giỏ hàng' giúp em nhé!"
                3. TUYỆT ĐỐI KHÔNG CHÈN ĐƯỜNG LINK HAY CÚ PHÁP MARKDOWN [Tên](/products/...) HOẶC URL VÀO VĂN BẢN. Chỉ cần nhắc tên sản phẩm tự nhiên trong câu nói, vì hệ thống giao diện sẽ tự động hiển thị Thẻ Sản Phẩm trực quan có link và nút bấm ngay dưới tin nhắn của bạn.
                4. TUYỆT ĐỐI KHÔNG SỬ DỤNG KÝ TỰ SAO ĐÔI ** ĐỂ IN ĐẬM (ví dụ: không viết **size L**, không viết **1m75**, không viết **Giá:**). Hãy viết văn tự nhiên, mộc mạc, ngắt dòng gạch đầu dòng rõ ràng, độ dài từ 2 đến 3 đoạn văn ngắn gọn, dễ đọc và không gây rối mắt.

                💡 QUY TẮC ỨNG XỬ KHI KHÁCH HỎI NGOÀI LỀ HOẶC TRÊU ĐÙA:
                - Nếu khách hỏi trêu đùa, chuyện phiếm ("shop có người yêu chưa", "buồn quá nói chuyện đi"): Phản hồi vui vẻ, lịch sự, thân thiện và khéo léo bẻ lái về việc tập luyện thể thao (Ví dụ: "Hôm nay anh/chị có dự định tập gym hay chạy bộ gì không để em tư vấn đồ tập siêu thoáng mát nè!").
                - Nếu khách hỏi bài tập, viết code, chính trị, chuyện ngoài luồng: Cảm ơn lịch sự và nói rõ em chỉ chuyên sâu về giày thể thao, vợt, trang bị tập luyện tại AP Sports.
                - Nếu khách bức xúc khiếu nại, phản ánh bảo hành/giao hàng: Hướng dẫn lịch sự: "Dạ AP Sports rất tiếc nếu đã làm anh/chị phiền lòng. Nếu mình đang gặp vấn đề về đơn hàng, bảo hành hoặc khiếu nại sản phẩm, anh/chị vui lòng bấm vào mục 'Hỗ trợ trực tuyến' (kênh Live Chat với nhân viên) hoặc liên hệ trực tiếp hotline CSKH của shop để được các bạn chuyên viên hỗ trợ kiểm tra và xử lý tận tình cho mình nhé ạ!"

                📦 DANH SÁCH SẢN PHẨM THAM KHẢO HIỆN CÓ CỦA SHOP (Dùng để gợi ý chính xác):
                %s

                HƯỚNG DẪN TƯ VẤN KỸ THUẬT:
                - Chiều cao & cân nặng: Quần áo nam form Á Đông: <1m65 55kg (M), 1m65-1m72 65kg (L), 1m72-1m78 75kg (XL), >1m78 >80kg (XXL).
                - Giày bóng đá/chạy bộ: Nếu mu bàn chân dày hoặc bè ngang, khuyên tăng 0.5 đến 1 size so với giày thường; sân cỏ nhân tạo mưa ướt nên dùng đinh TF cao su mềm bám sân.
                """.formatted(productContextJson);
    }

    private void saveChatMessage(String message, ChatMessage.ChatSender sender, User user, String guestToken, List<AiSportsAdvisorResponse.SuggestedProduct> suggestedProducts) {
        if (message == null || message.isBlank()) return;
        try {
            String json = null;
            if (suggestedProducts != null && !suggestedProducts.isEmpty()) {
                json = objectMapper.writeValueAsString(suggestedProducts);
            }
            ChatMessage chatMessage = ChatMessage.builder()
                    .user(user)
                    .guestToken(user == null ? guestToken : null)
                    .sender(sender)
                    .message(message)
                    .suggestedProductsJson(json)
                    .isRead(false)
                    .build();
            chatMessageRepository.save(chatMessage);
        } catch (Exception e) {
            log.warn("Không thể lưu tin nhắn chat vào CSDL: {}", e.getMessage());
        }
    }

    private List<AiSportsAdvisorResponse.SuggestedProduct> extractSuggestedProducts(
            List<Product> relevantProducts,
            List<Product> allInStockProducts,
            String reply,
            String question) {

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(VI_LOCALE);
        List<AiSportsAdvisorResponse.SuggestedProduct> list = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();
        String lowerReply = (reply != null) ? reply.toLowerCase(Locale.ROOT) : "";

        // Ưu tiên 1: Quét toàn bộ sản phẩm đang kinh doanh xem AI có nhắc đích danh hoặc tên rút gọn không
        if (allInStockProducts != null) {
            for (Product p : allInStockProducts) {
                if (isProductMentionedInReply(p, lowerReply)) {
                    if (addedIds.add(p.getId())) {
                        list.add(toSuggestedProduct(p, currencyFormat));
                    }
                }
            }
        }

        // Ưu tiên 2: Nếu AI không nêu đích danh nhưng có relevantProducts,
        // CHỈ lấy sản phẩm nếu sản phẩm đó THỰC SỰ phù hợp với câu hỏi của khách (không bao giờ lấy bóng đá khi hỏi đồ bộ)
        if (list.isEmpty() && relevantProducts != null && !relevantProducts.isEmpty()) {
            String lowerQuestion = (question != null) ? question.toLowerCase(Locale.ROOT) : "";
            for (Product p : relevantProducts) {
                if (calculateRelevanceScore(p, lowerQuestion) > 0) {
                    if (addedIds.add(p.getId())) {
                        list.add(toSuggestedProduct(p, currencyFormat));
                    }
                    if (list.size() >= 2) break;
                }
            }
        }

        return list;
    }

    private boolean isProductMentionedInReply(Product p, String lowerReply) {
        if (lowerReply.isBlank() || p == null) return false;

        // 1. Khớp theo slug
        if (p.getSlug() != null && lowerReply.contains(p.getSlug().toLowerCase(Locale.ROOT))) {
            return true;
        }

        String rawName = p.getName() == null ? "" : p.getName();
        String normalizedName = normalizeForSearch(rawName);
        String normalizedReply = normalizeForSearch(lowerReply);

        // 2. Khớp trọn vẹn tên đã chuẩn hóa
        if (!normalizedName.isBlank() && normalizedReply.contains(normalizedName)) {
            return true;
        }

        // 3. Khớp tên cốt lõi (bỏ các chi tiết phụ sau dấu -, –, phẩy, ngoặc)
        // Ví dụ: "adidas boys’ 2-piece full-zip jacket and jogger set – side pockets..." 
        // -> core: "adidas boys 2 piece full zip jacket and jogger set"
        String[] parts = rawName.split("[-–,(]");
        if (parts.length > 0) {
            String core = normalizeForSearch(parts[0]);
            if (core.length() >= 8 && normalizedReply.contains(core)) {
                return true;
            }
        }

        return false;
    }

    private String normalizeForSearch(String text) {
        if (text == null) return "";
        return text.toLowerCase(Locale.ROOT)
                .replace("’", "'")
                .replace("`", "'")
                .replace("“", "\"")
                .replace("”", "\"")
                .replaceAll("[^a-z0-9\\u00C0-\\u1EF9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private AiSportsAdvisorResponse.SuggestedProduct toSuggestedProduct(Product p, NumberFormat currencyFormat) {
        return AiSportsAdvisorResponse.SuggestedProduct.builder()
                .name(p.getName())
                .slug(p.getSlug())
                .price(currencyFormat.format(p.getPrice()))
                .link("/products/" + p.getSlug())
                .build();
    }
}
