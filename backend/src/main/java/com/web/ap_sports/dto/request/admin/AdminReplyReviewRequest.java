package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReplyReviewRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(min = 5, max = 2000, message = "Nội dung phản hồi từ 5 đến 2000 ký tự")
    private String replyContent;
}
