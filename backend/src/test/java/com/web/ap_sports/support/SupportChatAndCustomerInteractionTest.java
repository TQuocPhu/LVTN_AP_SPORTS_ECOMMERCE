package com.web.ap_sports.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.request.customer.CreateContactRequest;
import com.web.ap_sports.dto.request.customer.CreateReviewRequest;
import com.web.ap_sports.dto.request.staff.ReplyContactRequest;
import com.web.ap_sports.dto.request.support.CreateConversationRequest;
import com.web.ap_sports.dto.request.support.CreateSupportReportRequest;
import com.web.ap_sports.dto.request.support.RateConversationRequest;
import com.web.ap_sports.dto.request.support.SendSupportMessageRequest;
import com.web.ap_sports.dto.response.admin.AdminReviewDetailResponse;
import com.web.ap_sports.dto.response.customer.ContactResponse;
import com.web.ap_sports.dto.response.customer.ReviewResponse;
import com.web.ap_sports.dto.response.support.SupportConversationResponse;
import com.web.ap_sports.dto.response.support.SupportMessageResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.ai.ContentModerationAiService;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.customer.impl.CustomerContactServiceImpl;
import com.web.ap_sports.service.customer.impl.CustomerReviewServiceImpl;
import com.web.ap_sports.service.customer.impl.CustomerSupportChatServiceImpl;
import com.web.ap_sports.service.staff.impl.StaffContactServiceImpl;
import com.web.ap_sports.service.staff.impl.StaffSupportChatServiceImpl;
import com.web.ap_sports.service.admin.impl.AdminReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Tích hợp Phân hệ Hỗ trợ, Đánh giá và Tương tác Khách hàng (Chapter 3 & 4 - Nhóm 5)")
public class SupportChatAndCustomerInteractionTest {

    @Mock
    private SupportConversationRepository conversationRepository;
    @Mock
    private SupportMessageRepository messageRepository;
    @Mock
    private SupportReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewImageRepository reviewImageRepository;
    @Mock
    private ContactRepository contactRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private ContentModerationAiService contentModerationAiService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private EmailService emailService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private ObjectMapper objectMapper;

    private CustomerSupportChatServiceImpl customerSupportChatService;
    private StaffSupportChatServiceImpl staffSupportChatService;
    private CustomerContactServiceImpl customerContactService;
    private StaffContactServiceImpl staffContactService;
    private CustomerReviewServiceImpl customerReviewService;
    private AdminReviewServiceImpl adminReviewService;

    private User sampleCustomer;
    private User sampleStaff;
    private Role customerRole;
    private Role staffRole;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        customerRole = Role.builder().id(1L).name("CUSTOMER").build();
        staffRole = Role.builder().id(2L).name("STAFF").build();

        sampleCustomer = User.builder()
                .id(10L)
                .email("customer@apsports.vn")
                .name("Trần Văn Khách")
                .role(customerRole)
                .status(UserStatus.active)
                .build();

        sampleStaff = User.builder()
                .id(20L)
                .email("staff@apsports.vn")
                .name("Nguyễn Văn Nhân Viên")
                .role(staffRole)
                .employeeCode("NV-001")
                .status(UserStatus.active)
                .build();

        customerSupportChatService = new CustomerSupportChatServiceImpl(
                conversationRepository,
                messageRepository,
                userRepository,
                orderRepository,
                messagingTemplate,
                contentModerationAiService,
                notificationService,
                objectMapper
        );

        staffSupportChatService = new StaffSupportChatServiceImpl(
                conversationRepository,
                messageRepository,
                reportRepository,
                userRepository,
                messagingTemplate,
                notificationService,
                objectMapper,
                contentModerationAiService
        );

        customerContactService = new CustomerContactServiceImpl(contactRepository);

        staffContactService = new StaffContactServiceImpl(
                contactRepository,
                userRepository,
                emailService,
                cloudinaryService
        );

        customerReviewService = new CustomerReviewServiceImpl(
                reviewRepository,
                reviewImageRepository,
                userRepository,
                productRepository,
                orderItemRepository,
                orderRepository,
                orderStatusHistoryRepository,
                cloudinaryService,
                eventPublisher
        );

        adminReviewService = new AdminReviewServiceImpl(
                reviewRepository,
                userRepository,
                productImageRepository,
                eventPublisher
        );
    }

    // =========================================================================
    // 1. KIỂM THỬ HỖ TRỢ TRỰC TUYẾN PHÍA KHÁCH HÀNG (Customer Support Chat)
    // =========================================================================
    @Nested
    @DisplayName("1. Kiểm thử Hỗ trợ trực tuyến thời gian thực phía Khách hàng (WebSocket STOMP)")
    class CustomerSupportChatTests {

        @Test
        @DisplayName("TC-CHAT-01: Lấy ca hỗ trợ đang hoạt động - Không có ca nào -> trả về null")
        void testGetActiveConversation_WhenNone_ShouldReturnNull() {
            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findActiveConversationsForCustomer(sampleCustomer.getId()))
                    .thenReturn(Collections.emptyList());

            SupportConversationResponse response = customerSupportChatService.getActiveConversation(sampleCustomer.getEmail());
            assertNull(response);
        }

        @Test
        @DisplayName("TC-CHAT-02: Lấy ca hỗ trợ đang hoạt động - Đã có ca WAITING -> trả về thông tin ca")
        void testGetActiveConversation_WhenExists_ShouldReturnResponse() {
            SupportConversation conv = SupportConversation.builder()
                    .id(100L)
                    .customer(sampleCustomer)
                    .status("WAITING")
                    .subject("Hỗ trợ tư vấn size giày")
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findActiveConversationsForCustomer(sampleCustomer.getId()))
                    .thenReturn(List.of(conv));

            SupportConversationResponse response = customerSupportChatService.getActiveConversation(sampleCustomer.getEmail());
            assertNotNull(response);
            assertEquals(100L, response.getId());
            assertEquals("WAITING", response.getStatus());
            assertEquals("Hỗ trợ tư vấn size giày", response.getSubject());
        }

        @Test
        @DisplayName("TC-CHAT-03: Khởi tạo ca hỗ trợ mới - Chưa có ca -> Tạo phiên WAITING, sinh tin nhắn chào mừng và gửi WebSocket")
        void testGetOrCreateActiveConversation_WhenNoExisting_ShouldCreateNew() {
            CreateConversationRequest request = CreateConversationRequest.builder()
                    .subject("Tư vấn bảo hành")
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findActiveConversationsForCustomer(sampleCustomer.getId()))
                    .thenReturn(Collections.emptyList());

            SupportConversation savedConv = SupportConversation.builder()
                    .id(101L)
                    .customer(sampleCustomer)
                    .status("WAITING")
                    .subject("Tư vấn bảo hành")
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            when(conversationRepository.save(any(SupportConversation.class))).thenReturn(savedConv);

            SupportConversationResponse response = customerSupportChatService.getOrCreateActiveConversation(sampleCustomer.getEmail(), request);

            assertNotNull(response);
            assertEquals(101L, response.getId());
            assertEquals("WAITING", response.getStatus());
            verify(conversationRepository, atLeastOnce()).save(any(SupportConversation.class));
            verify(messageRepository, times(1)).save(any(SupportMessage.class)); // Tin nhắn chào mừng hệ thống
            verify(messagingTemplate, atLeastOnce()).convertAndSend(eq("/topic/support-queue"), any(String.class));
        }

        @Test
        @DisplayName("TC-CHAT-04: Khách hàng gửi tin nhắn hợp lệ -> Kiểm duyệt AI sạch, lưu DB và bắn WebSocket")
        void testSendMessage_WhenContentClean_ShouldSaveAndBroadcast() {
            SupportConversation conv = SupportConversation.builder()
                    .id(100L)
                    .customer(sampleCustomer)
                    .status("IN_PROGRESS")
                    .staff(sampleStaff)
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            SendSupportMessageRequest request = SendSupportMessageRequest.builder()
                    .content("Shop ơi chân em dài 26cm thì đi giày đá bóng size nào vừa ạ?")
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findById(100L)).thenReturn(Optional.of(conv));
            when(contentModerationAiService.moderate(request.getContent()))
                    .thenReturn(ContentModerationAiService.ModerationResult.clean());

            SupportMessage savedMsg = SupportMessage.builder()
                    .id(501L)
                    .conversation(conv)
                    .sender(sampleCustomer)
                    .senderRole("CUSTOMER")
                    .content(request.getContent())
                    .isViolation(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            when(messageRepository.save(any(SupportMessage.class))).thenReturn(savedMsg);

            SupportMessageResponse response = customerSupportChatService.sendMessage(sampleCustomer.getEmail(), 100L, request);

            assertNotNull(response);
            assertEquals(501L, response.getId());
            assertFalse(response.isViolation());
            verify(messagingTemplate, atLeastOnce()).convertAndSendToUser(eq(String.valueOf(sampleCustomer.getId())), eq("/queue/support-chat"), any());
        }

        @Test
        @DisplayName("TC-CHAT-05: Khách hàng gửi tin nhắn vi phạm tiêu chuẩn -> AI Guardrails phát hiện, che giấu nội dung và gắn cờ")
        void testSendMessage_WhenContentViolates_ShouldMaskAndFlagViolation() {
            SupportConversation conv = SupportConversation.builder()
                    .id(100L)
                    .customer(sampleCustomer)
                    .status("IN_PROGRESS")
                    .staff(sampleStaff)
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            SendSupportMessageRequest request = SendSupportMessageRequest.builder()
                    .content("Đồ lừa đảo, cút đi đụ má shop")
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findById(100L)).thenReturn(Optional.of(conv));
            when(contentModerationAiService.moderate(request.getContent()))
                    .thenReturn(ContentModerationAiService.ModerationResult.violation("PROFANITY", "Sử dụng từ ngữ xúc phạm"));

            SupportMessage savedMsg = SupportMessage.builder()
                    .id(502L)
                    .conversation(conv)
                    .sender(sampleCustomer)
                    .senderRole("CUSTOMER")
                    .content(request.getContent())
                    .isViolation(true)
                    .violationReason("Sử dụng từ ngữ xúc phạm")
                    .maskedContent("[Nội dung đã bị ẩn do vi phạm tiêu chuẩn cộng đồng]")
                    .createdAt(LocalDateTime.now())
                    .build();
            when(messageRepository.save(any(SupportMessage.class))).thenReturn(savedMsg);

            SupportMessageResponse response = customerSupportChatService.sendMessage(sampleCustomer.getEmail(), 100L, request);

            assertNotNull(response);
            assertTrue(response.isViolation());
            assertEquals("Sử dụng từ ngữ xúc phạm", response.getViolationReason());
        }

        @Test
        @DisplayName("TC-CHAT-06: Khách hàng đánh giá chất lượng ca hỗ trợ -> Cập nhật rating và feedback")
        void testRateConversation_Success() {
            SupportConversation conv = SupportConversation.builder()
                    .id(100L)
                    .customer(sampleCustomer)
                    .status("RESOLVED")
                    .staff(sampleStaff)
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            RateConversationRequest request = RateConversationRequest.builder()
                    .rating(5)
                    .feedbackNote("Nhân viên tư vấn rất nhiệt tình và chu đáo!")
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(conversationRepository.findById(100L)).thenReturn(Optional.of(conv));
            when(conversationRepository.save(any(SupportConversation.class))).thenAnswer(inv -> inv.getArgument(0));
            when(messageRepository.save(any(SupportMessage.class))).thenAnswer(inv -> {
                SupportMessage m = inv.getArgument(0);
                m.setId(999L);
                return m;
            });

            SupportConversationResponse response = customerSupportChatService.rateConversation(sampleCustomer.getEmail(), 100L, request);

            assertNotNull(response);
            assertEquals(5, conv.getRating());
            assertEquals("Nhân viên tư vấn rất nhiệt tình và chu đáo!", conv.getFeedbackNote());
            verify(conversationRepository).save(conv);
        }
    }

    // =========================================================================
    // 2. KIỂM THỬ HỖ TRỢ TRỰC TUYẾN PHÍA NHÂN VIÊN (Staff Support Chat)
    // =========================================================================
    @Nested
    @DisplayName("2. Kiểm thử Điều phối ca hỗ trợ & Chăm sóc khách hàng phía Nhân viên")
    class StaffSupportChatTests {

        @Test
        @DisplayName("TC-STAFF-CHAT-01: Lấy hàng đợi chờ tiếp nhận (WAITING) -> Trả về danh sách ca chờ")
        void testGetWaitingQueue_ShouldReturnList() {
            SupportConversation waitingConv = SupportConversation.builder()
                    .id(105L)
                    .customer(sampleCustomer)
                    .status("WAITING")
                    .subject("Hỏi thông tin đơn hàng")
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            when(conversationRepository.findByStatusOrderByCreatedAtAsc("WAITING"))
                    .thenReturn(List.of(waitingConv));

            List<SupportConversationResponse> queue = staffSupportChatService.getWaitingQueue();

            assertNotNull(queue);
            assertEquals(1, queue.size());
            assertEquals("WAITING", queue.get(0).getStatus());
        }

        @Test
        @DisplayName("TC-STAFF-CHAT-02: Nhân viên tiếp nhận ca hỗ trợ thành công -> Gán staff, đổi trạng thái IN_PROGRESS")
        void testAcceptConversation_Success() {
            SupportConversation inProgressConv = SupportConversation.builder()
                    .id(105L)
                    .customer(sampleCustomer)
                    .status("IN_PROGRESS")
                    .staff(sampleStaff)
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(conversationRepository.assignStaffAtomically(eq(105L), eq(sampleStaff))).thenReturn(1);
            when(conversationRepository.findById(105L)).thenReturn(Optional.of(inProgressConv));
            when(conversationRepository.save(any(SupportConversation.class))).thenAnswer(inv -> inv.getArgument(0));

            SupportConversationResponse response = staffSupportChatService.acceptConversation(sampleStaff.getEmail(), 105L);

            assertNotNull(response);
            assertEquals("IN_PROGRESS", response.getStatus());
            assertEquals(sampleStaff.getName(), response.getStaffName());
            verify(messageRepository).save(any(SupportMessage.class)); // Thông báo nhân viên đã tham gia
            verify(messagingTemplate, atLeastOnce()).convertAndSend(eq("/topic/support-queue"), any(String.class));
        }

        @Test
        @DisplayName("TC-STAFF-CHAT-03: Nhân viên tiếp nhận ca đã có người khác nhận -> Báo lỗi xung đột")
        void testAcceptConversation_WhenAlreadyAccepted_ShouldThrow() {
            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(conversationRepository.assignStaffAtomically(eq(105L), eq(sampleStaff))).thenReturn(0);

            assertThrows(IllegalArgumentException.class, () ->
                    staffSupportChatService.acceptConversation(sampleStaff.getEmail(), 105L));
        }

        @Test
        @DisplayName("TC-STAFF-CHAT-04: Nhân viên hoàn tất / giải quyết ca hỗ trợ -> Đổi trạng thái RESOLVED")
        void testResolveConversation_Success() {
            SupportConversation conv = SupportConversation.builder()
                    .id(105L)
                    .customer(sampleCustomer)
                    .status("IN_PROGRESS")
                    .staff(sampleStaff)
                    .createdAt(LocalDateTime.now())
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(conversationRepository.findById(105L)).thenReturn(Optional.of(conv));
            when(conversationRepository.save(any(SupportConversation.class))).thenAnswer(inv -> inv.getArgument(0));
            when(messageRepository.save(any(SupportMessage.class))).thenAnswer(inv -> {
                SupportMessage m = inv.getArgument(0);
                m.setId(997L);
                return m;
            });

            SupportConversationResponse response = staffSupportChatService.resolveConversation(sampleStaff.getEmail(), 105L);

            assertNotNull(response);
            assertEquals("RESOLVED", conv.getStatus());
            verify(conversationRepository).save(conv);
        }

        @Test
        @DisplayName("TC-STAFF-CHAT-05: Nhân viên báo cáo khách hàng vi phạm nghiêm trọng -> Tạo phiếu SupportReport và cảnh báo Admin")
        void testReportCustomer_Success() {
            SupportConversation conv = SupportConversation.builder()
                    .id(105L)
                    .customer(sampleCustomer)
                    .status("IN_PROGRESS")
                    .staff(sampleStaff)
                    .build();

            CreateSupportReportRequest request = CreateSupportReportRequest.builder()
                    .reason("Khách hàng liên tục đe dọa và dùng lời lẽ thô tục")
                    .evidenceImageUrls(List.of("https://cloudinary.com/evidence1.jpg"))
                    .build();

            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(conversationRepository.findById(105L)).thenReturn(Optional.of(conv));

            SupportReport savedReport = SupportReport.builder()
                    .id(901L)
                    .conversation(conv)
                    .reportedCustomer(sampleCustomer)
                    .reportedByStaff(sampleStaff)
                    .reason(request.getReason())
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(reportRepository.save(any(SupportReport.class))).thenReturn(savedReport);

            SupportReportResponse response = staffSupportChatService.reportCustomer(sampleStaff.getEmail(), 105L, request);

            assertNotNull(response);
            assertEquals(901L, response.getId());
            assertEquals("PENDING", response.getStatus());
            verify(reportRepository).save(any(SupportReport.class));
            verify(notificationService).sendToInternalUsers(eq(List.of("ADMIN")), eq(sampleStaff.getId()), eq(NotificationActionType.SYSTEM_ALERT), anyString(), anyString());
        }
    }

    // =========================================================================
    // 3. KIỂM THỬ ĐÁNH GIÁ SẢN PHẨM (Product Reviews - Customer & Admin)
    // =========================================================================
    @Nested
    @DisplayName("3. Kiểm thử Đánh giá sản phẩm & Phản hồi đánh giá (Reviews)")
    class ProductReviewTests {

        @Test
        @DisplayName("TC-REV-01: Khách hàng gửi đánh giá sản phẩm đã mua thành công -> Lưu DB và phát sự kiện")
        void testCreateReview_Success() {
            Product product = Product.builder().id(50L).name("Giày đá bóng Nike Mercurial").build();
            Order deliveredOrder = Order.builder()
                    .id(10L)
                    .user(sampleCustomer)
                    .status(OrderStatus.delivered)
                    .build();

            OrderItem orderItem = OrderItem.builder()
                    .id(200L)
                    .order(deliveredOrder)
                    .product(product)
                    .build();

            CreateReviewRequest request = CreateReviewRequest.builder()
                    .productId(50L)
                    .orderItemId(200L)
                    .rating(5)
                    .comment("Giày đá rất êm, ôm chân và bám sân cực tốt!")
                    .imageUrls(Collections.emptyList())
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(productRepository.findById(50L)).thenReturn(Optional.of(product));
            when(orderItemRepository.findById(200L)).thenReturn(Optional.of(orderItem));
            when(reviewRepository.existsByOrderItemId(200L)).thenReturn(false);

            Review savedReview = Review.builder()
                    .id(301L)
                    .user(sampleCustomer)
                    .product(product)
                    .orderItem(orderItem)
                    .rating(5)
                    .comment(request.getComment())
                    .status("approved")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(reviewRepository.saveAndFlush(any(Review.class))).thenReturn(savedReview);

            ReviewResponse response = customerReviewService.createReview(sampleCustomer.getEmail(), request);

            assertNotNull(response);
            assertEquals(301L, response.getId());
            assertEquals(5, response.getRating());
            verify(reviewRepository).saveAndFlush(any(Review.class));
            verify(eventPublisher).publishEvent(any(Object.class)); // Bắn sự kiện NewReviewEvent
        }

        @Test
        @DisplayName("TC-REV-02: Khách hàng đánh giá sản phẩm không khớp với mục đơn hàng -> Báo lỗi")
        void testCreateReview_WhenProductDoesNotMatchOrderItem_ShouldThrow() {
            Product product1 = Product.builder().id(50L).name("Giày Nike").build();
            Product product2 = Product.builder().id(51L).name("Áo Adidas").build();
            OrderItem orderItem = OrderItem.builder().id(200L).product(product2).build();

            CreateReviewRequest request = CreateReviewRequest.builder()
                    .productId(50L)
                    .orderItemId(200L)
                    .rating(5)
                    .comment("Giày đẹp")
                    .build();

            when(userRepository.findByEmail(sampleCustomer.getEmail())).thenReturn(Optional.of(sampleCustomer));
            when(productRepository.findById(50L)).thenReturn(Optional.of(product1));
            when(orderItemRepository.findById(200L)).thenReturn(Optional.of(orderItem));

            assertThrows(IllegalArgumentException.class, () ->
                    customerReviewService.createReview(sampleCustomer.getEmail(), request));
        }

        @Test
        @DisplayName("TC-REV-03: Quản trị viên phản hồi đánh giá của khách hàng -> Cập nhật adminReply và phát sự kiện")
        void testAdminReplyReview_Success() {
            Product product = Product.builder().id(50L).name("Giày đá bóng").build();
            Review review = Review.builder()
                    .id(301L)
                    .user(sampleCustomer)
                    .product(product)
                    .rating(5)
                    .comment("Sản phẩm rất tốt")
                    .status("approved")
                    .createdAt(LocalDateTime.now())
                    .build();

            AdminReplyReviewRequest request = AdminReplyReviewRequest.builder()
                    .replyContent("AP Sports chân thành cảm ơn đánh giá của anh/chị!")
                    .build();

            when(reviewRepository.findById(301L)).thenReturn(Optional.of(review));
            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

            AdminReviewDetailResponse response = adminReviewService.replyReview(301L, sampleStaff.getEmail(), request);

            assertNotNull(response);
            assertEquals("AP Sports chân thành cảm ơn đánh giá của anh/chị!", response.getAdminReply());
            assertEquals(sampleStaff.getName(), response.getRepliedByName());
            verify(eventPublisher).publishEvent(any(Object.class));
        }
    }

    // =========================================================================
    // 4. KIỂM THỬ LIÊN HỆ & GIẢI ĐÁP LIÊN HỆ (Customer Contact & Staff Reply)
    // =========================================================================
    @Nested
    @DisplayName("4. Kiểm thử Hộp thư Liên hệ & Giải đáp phản hồi khách hàng")
    class ContactManagementTests {

        @Test
        @DisplayName("TC-CONT-01: Khách hàng gửi biểu mẫu liên hệ -> Lưu Contact với trạng thái pending")
        void testCreateContact_Success() {
            CreateContactRequest request = CreateContactRequest.builder()
                    .name("Nguyễn Văn A")
                    .email("nguyenvana@gmail.com")
                    .phone("0901234567")
                    .message("Tôi muốn hợp tác đại lý bóng đá thể thao khu vực Cần Thơ")
                    .build();

            Contact savedContact = Contact.builder()
                    .id(401L)
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .message(request.getMessage())
                    .status("pending")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(contactRepository.save(any(Contact.class))).thenReturn(savedContact);

            ContactResponse response = customerContactService.createContact(request);

            assertNotNull(response);
            assertEquals(401L, response.getId());
            assertEquals("pending", response.getStatus());
            assertEquals("nguyenvana@gmail.com", response.getEmail());
            verify(contactRepository).save(any(Contact.class));
        }

        @Test
        @DisplayName("TC-CONT-02: Nhân viên trả lời thư liên hệ -> Cập nhật replyMessage, gửi email và đổi trạng thái replied")
        void testReplyContact_Success() {
            Contact contact = Contact.builder()
                    .id(401L)
                    .name("Nguyễn Văn A")
                    .email("nguyenvana@gmail.com")
                    .message("Muốn làm đại lý")
                    .status("pending")
                    .createdAt(LocalDateTime.now())
                    .build();

            ReplyContactRequest request = ReplyContactRequest.builder()
                    .replyMessage("Dạ shop đã nhận được thông tin, bộ phận kinh doanh sẽ liên hệ sớm nhất ạ.")
                    .build();

            when(contactRepository.findById(401L)).thenReturn(Optional.of(contact));
            when(userRepository.findByEmail(sampleStaff.getEmail())).thenReturn(Optional.of(sampleStaff));
            when(contactRepository.save(any(Contact.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ContactResponse response = staffContactService.replyContact(401L, request, sampleStaff.getEmail());

            assertNotNull(response);
            assertEquals("replied", response.getStatus());
            assertEquals("Dạ shop đã nhận được thông tin, bộ phận kinh doanh sẽ liên hệ sớm nhất ạ.", response.getReplyMessage());
            verify(emailService).sendContactReplyEmail(eq("nguyenvana@gmail.com"), eq("Nguyễn Văn A"), eq("Muốn làm đại lý"), anyString());
            verify(contactRepository).save(contact);
        }

        @Test
        @DisplayName("TC-CONT-03: Nhân viên trả lời thư liên hệ không tồn tại -> Báo lỗi NotFound")
        void testReplyContact_WhenNotFound_ShouldThrow() {
            ReplyContactRequest request = ReplyContactRequest.builder()
                    .replyMessage("Phản hồi...")
                    .build();

            when(contactRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(AppException.class, () ->
                    staffContactService.replyContact(999L, request, sampleStaff.getEmail()));
        }
    }
}
