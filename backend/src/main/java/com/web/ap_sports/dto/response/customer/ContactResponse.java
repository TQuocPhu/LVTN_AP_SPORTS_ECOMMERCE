package com.web.ap_sports.dto.response.customer;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String message;
    private String status; // pending, replied
    private String replyMessage;
    private Long repliedByUserId;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
