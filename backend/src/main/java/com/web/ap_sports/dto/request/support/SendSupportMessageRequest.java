package com.web.ap_sports.dto.request.support;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendSupportMessageRequest {

    private String content;        // Nội dung tin nhắn text

    private String attachmentUrl;  // Link ảnh đã upload lên Cloudinary (nếu có)
}
