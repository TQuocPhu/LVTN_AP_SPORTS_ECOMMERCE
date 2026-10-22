package com.web.ap_sports.dto.response.ai;

import lombok.*;

import java.util.List;

/**
 * DTO phản hồi danh sách các câu trả lời nhanh thông minh cho nhân viên CSKH.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatSuggestResponse {

    // Danh sách 3 gợi ý phản hồi nhanh theo ngữ cảnh
    private List<String> suggestions;
}
