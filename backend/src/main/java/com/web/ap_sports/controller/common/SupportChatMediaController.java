package com.web.ap_sports.controller.common;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.CloudinaryService.CloudinaryUploadResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/support-chat")
@RequiredArgsConstructor
@Slf4j
public class SupportChatMediaController {

    private final CloudinaryService cloudinaryService;

    public static final String FOLDER_MESSAGES = "ap-sports-e-commerce/support-chat/messages";
    public static final String FOLDER_REPORTS = "ap-sports-e-commerce/support-chat/reports";

    /**
     * Tải ảnh đính kèm vào tin nhắn cuộc trò chuyện trực tiếp (Khách hàng & Nhân viên).
     * Tự động resize max 1280px & nén JPEG 80% trước khi lưu trữ Cloudinary.
     * Rate limit: Tối đa 10 ảnh / 1 phút per IP (chống spam upload tràn dung lượng Cloudinary).
     */
    @PostMapping("/upload-message-image")
    @RateLimit(key = "chat_media_upload", maxRequests = 10, windowSeconds = 60)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMessageImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("File ảnh đính kèm không được để trống", HttpStatus.BAD_REQUEST);
        }

        CloudinaryUploadResult result = cloudinaryService.uploadChatImage(file, FOLDER_MESSAGES);
        return ResponseEntity.ok(ApiResponse.success(
                "Tải ảnh tin nhắn thành công",
                Map.of("url", result.secureUrl(), "publicId", result.publicId())
        ));
    }

    /**
     * Tải ảnh bằng chứng vi phạm khi Nhân viên báo cáo khách hàng lên Quản trị viên (Admin).
     * Chỉ nhân viên có quyền SUPPORT_LIVE_CHAT hoặc Quản trị viên ADMIN được phép thực hiện.
     * Cho phép tải tối đa 3 ảnh cùng lúc.
     */
    @PostMapping("/upload-report-evidence")
    @PreAuthorize("hasAuthority('SUPPORT_LIVE_CHAT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadReportEvidence(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new AppException("Vui lòng đính kèm ít nhất 1 ảnh bằng chứng vi phạm", HttpStatus.BAD_REQUEST);
        }
        if (files.size() > 3) {
            throw new AppException("Chỉ được đính kèm tối đa 3 ảnh bằng chứng vi phạm", HttpStatus.BAD_REQUEST);
        }

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                CloudinaryUploadResult result = cloudinaryService.uploadChatImage(file, FOLDER_REPORTS);
                uploadedUrls.add(result.secureUrl());
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Tải ảnh bằng chứng vi phạm thành công", uploadedUrls));
    }
}
