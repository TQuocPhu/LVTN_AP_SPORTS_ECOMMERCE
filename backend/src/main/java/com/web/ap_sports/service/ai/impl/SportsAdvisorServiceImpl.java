package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
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
import com.web.ap_sports.search.HybridSearchEngineService;
import com.web.ap_sports.search.VietnameseTokenizer;
import com.web.ap_sports.service.ai.AiPromptSanitizer;
import com.web.ap_sports.service.ai.ContentModerationAiService;
import com.web.ap_sports.service.ai.GeminiRestClient;
import com.web.ap_sports.service.ai.SportsAdvisorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

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
    private final ContentModerationAiService contentModerationAiService;
    private final HybridSearchEngineService hybridSearchEngineService;

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

        // 1.1 Kiểm duyệt nội dung bằng AI Guardrails L1 + L2
        ContentModerationAiService.ModerationResult modResult = contentModerationAiService.moderate(cleanQuestion);
        if (modResult.isViolation()) {
            String warningReply = "Dạ AP Sports xin phép từ chối phản hồi do câu hỏi có chứa nội dung vi phạm tiêu chuẩn cộng đồng ("
                    + modResult.reason() + "). Vui lòng sử dụng ngôn từ lịch sự để được trợ lý hỗ trợ tốt nhất ạ!";
            saveChatMessage(cleanQuestion, ChatMessage.ChatSender.user, currentUser, request.getGuestToken(), null,
                    true, modResult.reason(), modResult.maskedContent());
            saveChatMessage(warningReply, ChatMessage.ChatSender.bot, currentUser, request.getGuestToken(),
                    Collections.emptyList(), false, null, null);
            return AiSportsAdvisorResponse.builder()
                    .reply(warningReply)
                    .suggestedProducts(Collections.emptyList())
                    .build();
        }

        // 2. Lấy lịch sử hội thoại gần nhất (cửa sổ trượt 6 tin nhắn gần nhất)
        List<ChatMessage> recentDbMessages;
        if (currentUser != null) {
            recentDbMessages = chatMessageRepository.findRecentMessagesByUserId(currentUser.getId(),
                    PageRequest.of(0, 6));
        } else if (request.getGuestToken() != null && !request.getGuestToken().isBlank()) {
            recentDbMessages = chatMessageRepository.findRecentMessagesByGuestToken(request.getGuestToken().trim(),
                    PageRequest.of(0, 6));
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
        List<Product> relevantProducts = preFilterProducts(cleanQuestion, request.getActiveProductSlug(),
                allInStockProducts);
        String productContextJson = buildCompactProductContext(relevantProducts);

        // 4. Xây dựng System Prompt với ranh giới an toàn nghiêm ngặt
        String systemInstruction = buildSystemInstruction(productContextJson);

        // 5. Gọi Gemini Flash API (nhiệt độ 0.4 để câu trả lời sinh động nhưng chuẩn
        // xác)
        String rawReply = geminiRestClient.generateChatContent(systemInstruction, geminiMessages, 0.4, 2048);

        // Loại bỏ hoàn toàn ký tự ** (in đậm markdown) và chuyển đổi [Tên](/link) thành
        // Tên thuần để tránh rối mắt
        String cleanReply = (rawReply != null) ? rawReply : "";
        cleanReply = cleanReply.replaceAll("\\[([^\\]]+)\\]\\([^\\)]+\\)", "$1");
        cleanReply = cleanReply.replace("**", "").trim();

        // 6. Tạo danh sách SuggestedProduct để Client render thẻ sản phẩm trực quan bên
        // dưới
        List<AiSportsAdvisorResponse.SuggestedProduct> suggestedProducts = extractSuggestedProducts(relevantProducts,
                allInStockProducts, cleanReply, cleanQuestion);

        // 7. Lưu tin nhắn sạch vào cơ sở dữ liệu chat_messages kèm sản phẩm gợi ý của
        // bot
        saveChatMessage(cleanQuestion, ChatMessage.ChatSender.user, currentUser, request.getGuestToken(), null, false,
                null, null);
        saveChatMessage(cleanReply, ChatMessage.ChatSender.bot, currentUser, request.getGuestToken(), suggestedProducts,
                false, null, null);

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
                        objectMapper.getTypeFactory().constructCollectionType(List.class,
                                AiSportsAdvisorResponse.SuggestedProduct.class));
            } catch (Exception e) {
                log.warn("Không thể parse suggestedProductsJson cho message id {}: {}", entity.getId(), e.getMessage());
            }
        }
        String displayMessage = entity.isViolation() && entity.getMaskedContent() != null
                ? entity.getMaskedContent()
                : entity.getMessage();

        return ChatMessageResponse.builder()
                .id(entity.getId())
                .sender(entity.getSender() != null ? entity.getSender().name() : "bot")
                .message(displayMessage)
                .isRead(entity.isRead())
                .isViolation(entity.isViolation())
                .violationReason(entity.getViolationReason())
                .createdAt(entity.getCreatedAt())
                .suggestedProducts(products)
                .build();
    }

    /**
     * Lọc thông minh sản phẩm liên quan sử dụng mô hình kết hợp (Hybrid AI Search):
     * 1. Nếu người dùng đang xem trang chi tiết một sản phẩm (activeProductSlug):
     * ưu tiên trực tiếp sản phẩm đó.
     * 2. Mở rộng từ khóa & ý định ngữ nghĩa bằng Gemini siêu nhẹ (Query Expansion):
     * Ví dụ: "in tên CR7" -> "áo bóng đá bồ đào nha ronaldo portugal thi đấu"
     * 3. Thực thi Hybrid Search Engine (TF-IDF Vector Space Model + Structured
     * Attribute Matching):
     * Chấm điểm độ trùng khớp tên sản phẩm, danh mục, màu sắc, size và mô tả.
     * 4. Chọn lọc Top 4 sản phẩm đạt điểm cao nhất để nén vào Context cho Gemini
     * (~150 tokens),
     * giúp AI phản hồi siêu nhanh, chuẩn xác 100% và không bị quá tải token.
     */
    public record SearchIntent(String itemType, String searchKeywords) {}

    /**
     * Lọc thông minh sản phẩm liên quan sử dụng mô hình kết hợp AI Intent Extraction + Hybrid Search:
     * 1. Nếu người dùng đang xem trang chi tiết một sản phẩm (activeProductSlug): ưu tiên trực tiếp sản phẩm đó.
     * 2. Bóc tách ý định người dùng (Intent Extraction) ĐỘNG 100% bằng Gemini siêu nhẹ:
     *    Tự động nhận diện loại mặt hàng (itemType: giày, áo, vợt, bóng, bình nước, thảm...) mà KHÔNG hardcode.
     * 3. Thực thi Hybrid Search Engine (TF-IDF Vector Space Model + Structured Attribute Matching).
     * 4. Kiểm tra tính nhất quán ĐỘNG (Dynamic Item Type Check):
     *    Nếu khách hỏi GIÀY mà shop chỉ có BÓNG -> Tự động loại bỏ, trả về rỗng [] để AI thành thật báo chưa có hàng.
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

        // Bước 1: Phân tích ý định tìm kiếm ĐỘNG bằng AI (Intent Extraction: itemType & keywords)
        SearchIntent intent = analyzeSearchIntent(question);
        String searchInput = (intent.searchKeywords() != null && !intent.searchKeywords().isBlank())
                ? (question + " " + intent.searchKeywords()).trim()
                : question;

        // Bước 2: Nạp trước danh sách biến thể để phục vụ Hybrid Search Engine
        List<Long> productIds = allInStock.stream().map(Product::getId).filter(Objects::nonNull).toList();
        List<ProductVariant> allVariants = productVariantRepository.findByProductIdIn(productIds);
        Map<Long, List<ProductVariant>> variantMap = allVariants != null
                ? allVariants.stream()
                        .filter(v -> v.getProduct() != null && v.getProduct().getId() != null)
                        .collect(Collectors.groupingBy(v -> v.getProduct().getId()))
                : Collections.emptyMap();

        // Bước 3: Tìm kiếm và xếp hạng bằng Hybrid Search Engine (TF-IDF + Attribute Scoring)
        List<Product> rankedProducts = hybridSearchEngineService.rankProducts(searchInput, allInStock, variantMap);

        // Bước 4: Kiểm tra tính nhất quán ĐỘNG theo loại mặt hàng (Dynamic Item Type Check)
        // Nếu khách hỏi GIÀY (itemType = "giày") mà trong rankedProducts không có sản phẩm nào thuộc loại "giày":
        // -> strictlyFiltered sẽ RỖNG [] -> Trả về danh sách rỗng để AI thành thật báo chưa có hàng!
        if (intent.itemType() != null && !intent.itemType().isBlank()) {
            List<Product> strictlyFiltered = filterByDynamicItemType(rankedProducts, intent.itemType());
            return strictlyFiltered.stream().limit(4).toList(); // Trả về rỗng nếu shop không có đúng loại hàng khách tìm
        }

        if (rankedProducts != null && !rankedProducts.isEmpty()) {
            return rankedProducts.stream().limit(4).toList();
        }

        // Fallback: chỉ khi câu hỏi chào hỏi chung chung không khớp sản phẩm nào cụ thể
        return allInStock.stream().limit(4).toList();
    }

    /**
     * Lọc sản phẩm hoàn toàn ĐỘNG theo loại mặt hàng (itemType) mà AI trích xuất được.
     * Tuyệt đối KHÔNG gán cứng bất kỳ mảng danh mục nào.
     * Đối chiếu trực tiếp itemType với Tên sản phẩm (Product.name) và Tên danh mục (Category.name) trong CSDL.
     */
    private List<Product> filterByDynamicItemType(List<Product> products, String itemType) {
        if (products == null || products.isEmpty()) {
            return Collections.emptyList();
        }
        if (itemType == null || itemType.isBlank()) {
            return products;
        }

        String normalizedType = VietnameseTokenizer.normalizeText(itemType).trim();
        if (normalizedType.isBlank()) {
            return products;
        }

        return products.stream()
                .filter(p -> {
                    String pName = VietnameseTokenizer.normalizeText(p.getName());
                    if (pName.contains(normalizedType)) {
                        return true;
                    }
                    if (p.getCategory() != null && p.getCategory().getName() != null) {
                        String cName = VietnameseTokenizer.normalizeText(p.getCategory().getName());
                        if (cName.contains(normalizedType)) {
                            return true;
                        }
                    }
                    if (p.getCategories() != null) {
                        for (com.web.ap_sports.entity.Category c : p.getCategories()) {
                            if (c.getName() != null) {
                                String cName = VietnameseTokenizer.normalizeText(c.getName());
                                if (cName.contains(normalizedType)) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                })
                .toList();
    }

    /**
     * Mở rộng ngữ nghĩa và bóc tách loại mặt hàng ĐỘNG bằng Gemini siêu nhẹ (~100-150ms).
     * Trả về JSON: {"item_type": "...", "search_keywords": "..."}
     * - item_type: loại trang bị cụ thể mà khách hỏi (ví dụ: "giày", "áo", "quần", "vợt", "bóng", "bình nước", "thảm", "balo"...).
     *   Nếu khách không hỏi đích danh loại mặt hàng (hỏi chung chung), item_type sẽ là null.
     * - search_keywords: các từ khóa mở rộng về môn thể thao, CLB, ĐTQG, cầu thủ.
     */
    private SearchIntent analyzeSearchIntent(String userQuestion) {
        if (userQuestion == null || userQuestion.isBlank()) {
            return new SearchIntent(null, "");
        }
        String prompt = """
                Bạn là bộ máy phân tích ý định tìm kiếm sản phẩm thể thao (Sports Search Intent Engine).
                Nhiệm vụ: Phân tích câu hỏi của khách hàng và trích xuất đúng một JSON duy nhất có 2 trường:
                1. "item_type": Loại mặt hàng/trang bị cụ thể mà khách hàng đang muốn tìm (ví dụ: "giày", "áo", "quần", "vợt", "bóng", "bình nước", "thảm", "balo", "găng tay", "vớ", "bó gối"...).
                   Nếu câu hỏi chung chung, không chỉ đích danh một loại mặt hàng nào (ví dụ: "tư vấn đồ tập cho người mới", "shop có gì hot"), hãy để giá trị null.
                2. "search_keywords": Chuỗi từ khóa mở rộng chuẩn xác nhất để tìm kiếm sản phẩm trong kho (bao gồm môn thể thao, tên đội tuyển, CLB, cầu thủ, đặc tính).
                   Nếu câu hỏi nhắc đến cầu thủ, hãy suy luận đúng Đội tuyển quốc gia và CLB họ từng thi đấu.

                Quy tắc:
                - Chỉ trả về một JSON duy nhất dạng: {"item_type": "...", "search_keywords": "..."}
                - Không thêm bất kỳ giải thích, lời chào hay định dạng markdown nào ngoài JSON.

                Ví dụ:
                - "Chân bè thì mang giày đá bóng nào" -> {"item_type": "giày", "search_keywords": "giày đá bóng cỏ nhân tạo tf chân bè"}
                - "in tên Ronaldinho" -> {"item_type": "áo", "search_keywords": "áo bóng đá đội tuyển brazil barcelona ac milan psg ronaldinho"}
                - "có bình nước tập gym không" -> {"item_type": "bình nước", "search_keywords": "bình nước tập gym thể thao"}
                - "bóng đá đạt chuẩn thi đấu da êm" -> {"item_type": "bóng", "search_keywords": "quả bóng đá đạt chuẩn thi đấu giữ hơi"}
                - "tư vấn cho người mới tập" -> {"item_type": null, "search_keywords": "đồ tập thể thao tập luyện"}

                Câu hỏi của khách: "%s"
                """.formatted(userQuestion);

        try {
            String rawJson = geminiRestClient.generateContent(null, prompt, 0.1, 100);
            if (rawJson != null && !rawJson.isBlank() && !rawJson.startsWith("Hệ thống") && !rawJson.startsWith("Tính năng")) {
                String cleanJson = rawJson.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleanJson);
                String itemType = (root.has("item_type") && !root.get("item_type").isNull())
                        ? root.get("item_type").asText(null) : null;
                if ("null".equalsIgnoreCase(itemType) || (itemType != null && itemType.isBlank())) {
                    itemType = null;
                }
                String searchKeywords = (root.has("search_keywords") && !root.get("search_keywords").isNull())
                        ? root.get("search_keywords").asText(userQuestion) : userQuestion;

                log.info("AI Search Intent: question='{}' -> itemType='{}', keywords='{}'",
                        userQuestion, itemType, searchKeywords);
                return new SearchIntent(itemType, searchKeywords);
            }
        } catch (Exception e) {
            log.warn("Không thể bóc tách Search Intent bằng AI (dùng fallback): {}", e.getMessage());
        }
        return new SearchIntent(null, userQuestion);
    }

    /**
     * Nén danh sách sản phẩm thành định dạng JSON Micro Context siêu gọn (~150-250
     * tokens)
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

                                QUY TẮC ĐÚNG LOẠI MẶT HÀNG (PRODUCT TYPE MATCH) & XỬ LÝ KHI SHOP KHÔNG CÓ HÀNG:
                                - Nếu khách hỏi tìm một loại mặt hàng cụ thể (ví dụ: hỏi Giày, hỏi Vợt, hỏi Balo...) mà trong danh sách sản phẩm hiện có của shop KHÔNG CÓ đúng loại mặt hàng đó (danh sách là [] hoặc chỉ có Quả bóng, Áo đấu):
                                  + AI PHẢI THÀNH THẬT thông báo: "Dạ hiện tại shop chưa kinh doanh (hoặc đang tạm hết) mặt hàng [Giày/Vợt] ạ!"
                                  + TUYỆT ĐỐI KHÔNG BẺ LÁI sang chào mời một loại mặt hàng khác một cách gượng ép (khách hỏi giày tuyệt đối không mời mua quả bóng, áo hay vợt).
                                  + TUYỆT ĐỐI KHÔNG NÓI CÂU "Anh/chị xem thẻ sản phẩm ở ngay bên dưới khung chat để chọn size..." khi shop không có đúng mặt hàng khách cần!
                                  + Hãy tập trung tư vấn kiến thức kỹ thuật chuyên môn hữu ích cho khách (ví dụ: cách chọn form giày cho chân bè, cách chọn size) rồi kết thúc câu trả lời một cách lịch sự, thân thiện.
                                📦 DANH SÁCH SẢN PHẨM THAM KHẢO HIỆN CÓ CỦA SHOP (Dùng để gợi ý chính xác):
                                %s

                                HƯỚNG DẪN TƯ VẤN KỸ THUẬT:
                                - Chiều cao & cân nặng: Quần áo nam form Á Đông: <1m65 55kg (M), 1m65-1m72 65kg (L), 1m72-1m78 75kg (XL), >1m78 >80kg (XXL).
                                - Giày bóng đá/chạy bộ: Nếu mu bàn chân dày hoặc bè ngang, khuyên tăng 0.5 đến 1 size so với giày thường; sân cỏ nhân tạo mưa ướt nên dùng đinh TF cao su mềm bám sân.
                                - Tư vấn in tên, số áo cầu thủ và áo thi đấu thể thao:
                                  + BẢO TOÀN KIẾN THỨC BÓNG ĐÁ: Mỗi cầu thủ chỉ gắn liền với Đội tuyển quốc gia (theo quốc tịch) và các Câu lạc bộ họ THỰC SỰ từng thi đấu chính thức trong sự nghiệp. Tuyệt đối không gán ghép sai lệch một cầu thủ vào đội bóng họ chưa từng khoác áo.
                                    (Lưu ý: Các trường hợp sau đây CHỈ LÀ VÍ DỤ MINH HỌA để bạn hiểu nguyên tắc, hãy áp dụng tư duy chuẩn xác này cho MỌI cầu thủ trên thế giới):
                                    * Ví dụ như: Ronaldinho chỉ gắn liền với ĐT Brazil và các CLB như Barcelona, AC Milan, PSG... chứ không thi đấu cho ĐT Bồ Đào Nha hay CLB Juventus.
                                    * Ví dụ như: Cristiano Ronaldo (CR7) chỉ gắn với ĐT Bồ Đào Nha, MU, Real Madrid, Juventus, Al Nassr... chứ không thi đấu cho ĐT Brazil hay Barcelona.
                                    * Ví dụ như: Lionel Messi chỉ gắn với ĐT Argentina, Barcelona, PSG, Inter Miami... chứ không thi đấu cho ĐT Brazil hay Real Madrid.
                                    * Ví dụ như: Luka Modric gắn với ĐT Croatia, Kevin De Bruyne gắn với ĐT Bỉ và Man City, Son Heung-min gắn với ĐT Hàn Quốc và Tottenham...
                                  + NGUYÊN TẮC GỢI Ý ÁO KHI KHÁCH HỎI CẦU THỦ CỤ THỂ:
                                    * BẮT BUỘC chỉ gợi ý mẫu áo của ĐÚNG Đội tuyển quốc gia hoặc ĐÚNG CLB mà cầu thủ đó từng thi đấu chính thức.
                                    * Nếu trong danh sách sản phẩm trên chỉ có 1 mẫu áo đúng với cầu thủ đó (ví dụ chỉ có Áo Brazil cho Ronaldinho), thì CHỈ ĐƯỢC GỢI Ý DUY NHẤT mẫu áo đúng đó, TUYỆT ĐỐI KHÔNG gợi ý thêm các áo khác có trong danh sách (như áo Juventus hay áo Bồ Đào Nha) chỉ để cố bán thêm hàng.
                                    * Nếu trong danh sách sản phẩm hiện tại HOÀN TOÀN KHÔNG CÓ mẫu áo nào thuộc các đội bóng mà cầu thủ đó từng thi đấu: Bạn PHẢI THÀNH THẬT giải thích rằng shop hiện chưa có sẵn mẫu áo của các đội bóng mà cầu thủ đó từng khoác áo, TUYỆT ĐỐI KHÔNG tư vấn áo của một đội bóng khác để in tên họ.
                                  + Giải thích rõ các mẫu áo đấu thun thể thao chuyên dụng của shop có bề mặt vải dệt kim cao cấp, co giãn, thoáng khí và rất thích hợp để in nhiệt tên và số áo sắc nét, bền màu, không bong tróc khi thi đấu.
                                """
                .formatted(productContextJson);
    }

    private void saveChatMessage(
            String message,
            ChatMessage.ChatSender sender,
            User user,
            String guestToken,
            List<AiSportsAdvisorResponse.SuggestedProduct> suggestedProducts,
            boolean isViolation,
            String violationReason,
            String maskedContent) {
        if (message == null || message.isBlank())
            return;
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
                    .isViolation(isViolation)
                    .violationReason(violationReason)
                    .maskedContent(maskedContent)
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

        // Ưu tiên 1: Quét toàn bộ sản phẩm đang kinh doanh xem AI có nhắc đích danh
        // hoặc tên rút gọn không
        if (allInStockProducts != null) {
            for (Product p : allInStockProducts) {
                if (isProductMentionedInReply(p, lowerReply)) {
                    if (addedIds.add(p.getId())) {
                        list.add(toSuggestedProduct(p, currencyFormat));
                    }
                }
            }
        }

        // Ưu tiên 2: Nếu AI không nêu đích danh nhưng có relevantProducts (đã được lọc
        // & xếp hạng bởi Hybrid Search Engine)
        if (list.isEmpty() && relevantProducts != null && !relevantProducts.isEmpty()) {
            for (Product p : relevantProducts) {
                if (addedIds.add(p.getId())) {
                    list.add(toSuggestedProduct(p, currencyFormat));
                }
                if (list.size() >= 2)
                    break;
            }
        }

        return list;
    }

    private boolean isProductMentionedInReply(Product p, String lowerReply) {
        if (lowerReply.isBlank() || p == null)
            return false;

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
        // Ví dụ: "adidas boys’ 2-piece full-zip jacket and jogger set – side
        // pockets..."
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
        if (text == null)
            return "";
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
