package com.web.ap_sports.dto.request.staff;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyContactRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String replyMessage;
}
