package com.web.ap_sports.dto.request.ai;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

/**
 * Request gửi từ màn hình Live Chat CSKH của nhân viên để AI gợi ý câu trả lời nhanh (Smart Reply).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatSuggestRequest {

    // Danh sách 3 - 5 tin nhắn gần nhất trong phòng chat
    @NotEmpty(message = "Lịch sử tin nhắn gần nhất không được rỗng")
    private List<String> recentMessages;

    // Tên khách hàng (nếu có để xưng hô lịch sự)
    private String customerName;
}
