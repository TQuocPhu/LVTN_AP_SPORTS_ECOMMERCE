package com.web.ap_sports.service.common;

import com.web.ap_sports.service.common.impl.CloudinaryServiceImpl.CloudinaryUploadResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface dịch vụ lưu trữ & quản lý ảnh Cloudinary.
 *
 * Tích hợp validate backend (kích thước, MIME type) và hỗ trợ
 * xóa ảnh cũ bằng public_id để tránh rò rỉ storage.
 */
public interface CloudinaryService {

    /**
     * Tải file ảnh lên Cloudinary sau khi validate kích thước & định dạng.
     *
     * @param file   File ảnh từ Multipart Request (tối đa 5 MB, JPEG/PNG/WebP)
     * @param folder Thư mục lưu trên Cloudinary (VD: "ap-sports-e-commerce/avatars")
     * @return {@link CloudinaryUploadResult} chứa secureUrl và publicId
     * @throws IllegalArgumentException nếu file vi phạm ràng buộc kích thước/định dạng
     */
    CloudinaryUploadResult uploadImage(MultipartFile file, String folder);

    /**
     * Xóa ảnh khỏi Cloudinary theo public_id (best-effort — không ném exception khi thất bại).
     *
     * @param publicId public_id Cloudinary trả về lúc upload (VD: "ap-sports-e-commerce/avatars/abc123")
     */
    void deleteImage(String publicId);
}
