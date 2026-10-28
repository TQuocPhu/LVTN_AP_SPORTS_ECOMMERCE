package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO Từ chối Yêu Cầu Nhập Kho
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectImportRequestDto {

    @NotBlank(message = "Lý do từ chối không được để trống")
    private String reason;
}
