package com.web.ap_sports.service.common.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.web.ap_sports.service.common.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import com.web.ap_sports.exception.AppException;
import org.springframework.http.HttpStatus;

/**
 * Triển khai dịch vụ upload & quản lý ảnh Cloudinary.
 *
 * Bảo mật được tích hợp trực tiếp tại tầng service:
 *  - Giới hạn kích thước file ≤ 5 MB
 *  - Chỉ chấp nhận image/jpeg, image/png, image/webp (chặn .svg, .exe, ...)
 *  - Xóa ảnh cũ sau khi upload ảnh mới để tránh rò rỉ storage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    /** Kích thước tối đa cho phép upload: 5 MB */
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L;

    /** Các MIME type hợp lệ – chặn SVG (XSS) và các định dạng thực thi */
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    /**
     * {@inheritDoc}
     * Validate kích thước & định dạng trước khi upload. Kết quả trả về cả URL lẫn public_id
     * (được gói trong {@link CloudinaryUploadResult}) để caller có thể xóa ảnh cũ sau khi lưu.
     */
    @Override
    public CloudinaryUploadResult uploadImage(MultipartFile file, String folder) {
        validateImageFile(file);

        try {
            log.info("Đang tải ảnh lên Cloudinary thư mục: {}", folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "overwrite", false,       // tắt overwrite để mỗi ảnh có public_id riêng
                            "resource_type", "image"  // giới hạn chỉ ảnh, không phải video/raw
                    )
            );

            String secureUrl  = (String) uploadResult.get("secure_url");
            String publicId   = (String) uploadResult.get("public_id");
            log.info("Tải ảnh lên Cloudinary thành công. public_id: {}, URL: {}", publicId, secureUrl);
            return new CloudinaryUploadResult(secureUrl, publicId);

        } catch (IOException e) {
            log.error("Lỗi tải ảnh lên Cloudinary", e);
            throw new RuntimeException("Không thể tải ảnh lên hệ thống lưu trữ Cloudinary", e);
        }
    }

    /**
     * {@inheritDoc}
     * Xóa ảnh khỏi Cloudinary theo public_id. Ghi log cảnh báo nếu xóa thất bại
     * nhưng KHÔNG ném exception để không làm gián đoạn luồng chính (best-effort cleanup).
     */
    @Override
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String outcome = (String) result.get("result");
            if (!"ok".equalsIgnoreCase(outcome)) {
                log.warn("Cloudinary xóa ảnh public_id='{}' trả về kết quả: {}", publicId, outcome);
            } else {
                log.info("Đã xóa ảnh cũ Cloudinary public_id='{}'", publicId);
            }
        } catch (Exception e) {
            log.warn("Không thể xóa ảnh cũ Cloudinary public_id='{}': {}", publicId, e.getMessage());
        }
    }

    @Override
    public String uploadBase64OrUrl(String source, String folder) {
        if (source == null || source.isBlank()) return source;
        String trimmed = source.trim();
        
        // Kiểm tra nếu là chuỗi Base64 Data URL hoặc chuỗi ảnh dài không phải là HTTP URL
        if (trimmed.startsWith("data:") || (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && trimmed.length() > 200)) {
            try {
                log.info("Đang tải ảnh Base64 lên Cloudinary thư mục: {}", folder);
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        trimmed,
                        ObjectUtils.asMap(
                                "folder", folder,
                                "overwrite", false,
                                "resource_type", "auto"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Tải ảnh Base64 lên Cloudinary thành công: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                log.error("Lỗi khi tải ảnh Base64 lên Cloudinary:", e);
                throw new AppException("Không thể tải ảnh sản phẩm lên Cloudinary: " + e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }
        return trimmed;
    }

    // ─────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh tải lên không được rỗng.");
        }

        // Kiểm tra kích thước
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Kích thước ảnh vượt quá giới hạn cho phép (tối đa 5 MB). " +
                    "Kích thước hiện tại: " + (file.getSize() / 1024 / 1024) + " MB.");
        }

        // Kiểm tra MIME type (backend validation — không phụ thuộc frontend)
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận: JPEG, PNG, WebP. " +
                    "Định dạng hiện tại: " + contentType);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Inner Result DTO
    // ─────────────────────────────────────────────────────────────

    /**
     * Kết quả upload Cloudinary — chứa cả URL (hiển thị) lẫn public_id (để xóa sau).
     */
    public record CloudinaryUploadResult(String secureUrl, String publicId) {}
}
