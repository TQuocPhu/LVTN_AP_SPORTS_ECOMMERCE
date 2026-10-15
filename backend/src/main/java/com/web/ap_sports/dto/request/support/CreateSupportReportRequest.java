package com.web.ap_sports.dto.request.support;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSupportReportRequest {

    @NotBlank(message = "Lý do báo cáo vi phạm không được để trống")
    private String reason;

    private List<String> evidenceImageUrls; // Danh sách tối đa 3 link ảnh Cloudinary bằng chứng
}
