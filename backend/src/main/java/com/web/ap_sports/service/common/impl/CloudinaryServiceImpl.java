package com.web.ap_sports.service.common.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.web.ap_sports.service.common.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import org.springframework.util.StringUtils;

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

    /** ThreadPool Executor dành riêng cho việc upload ảnh song song lên Cloudinary (10 threads concurrent) */
    private final ExecutorService uploadExecutor = Executors.newFixedThreadPool(10);

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

    @Override
    public CloudinaryUploadResult uploadChatImage(MultipartFile file, String folder) {
        validateImageFile(file);

        try {
            byte[] fileBytes = file.getBytes();
            byte[] optimizedBytes = fileBytes;

            // Nén và resize nếu ảnh vượt quá 200KB hoặc kích thước lớn
            if (fileBytes.length > 200 * 1024) {
                try {
                    BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(fileBytes));
                    if (originalImage != null) {
                        int originWidth = originalImage.getWidth();
                        int originHeight = originalImage.getHeight();
                        int maxDimension = 1280;

                        int targetWidth = originWidth;
                        int targetHeight = originHeight;

                        if (originWidth > maxDimension || originHeight > maxDimension) {
                            double ratio = Math.min((double) maxDimension / originWidth, (double) maxDimension / originHeight);
                            targetWidth = (int) Math.round(originWidth * ratio);
                            targetHeight = (int) Math.round(originHeight * ratio);
                        }

                        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
                        Graphics2D g2d = resizedImage.createGraphics();
                        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                        g2d.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
                        g2d.dispose();

                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
                        if (writers.hasNext()) {
                            ImageWriter writer = writers.next();
                            try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
                                writer.setOutput(ios);
                                ImageWriteParam param = writer.getDefaultWriteParam();
                                if (param.canWriteCompressed()) {
                                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                                    param.setCompressionQuality(0.80f);
                                }
                                writer.write(null, new javax.imageio.IIOImage(resizedImage, null, null), param);
                            } finally {
                                writer.dispose();
                            }
                            optimizedBytes = baos.toByteArray();
                            log.info("⚡ Đã nén & tối ưu ảnh chat: {} KB -> {} KB (Resize: {}x{} -> {}x{})",
                                    fileBytes.length / 1024, optimizedBytes.length / 1024, originWidth, originHeight, targetWidth, targetHeight);
                        }
                    }
                } catch (Exception ex) {
                    log.warn("Lỗi tối ưu ảnh chat, upload ảnh gốc: {}", ex.getMessage());
                }
            }

            log.info("Đang tải ảnh chat lên Cloudinary thư mục: {}", folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    optimizedBytes,
                    ObjectUtils.asMap(
                            "folder", folder,
                            "overwrite", false,
                            "resource_type", "image"
                    )
            );

            String secureUrl  = (String) uploadResult.get("secure_url");
            String publicId   = (String) uploadResult.get("public_id");
            log.info("Tải ảnh chat lên Cloudinary thành công. public_id: {}, URL: {}", publicId, secureUrl);
            return new CloudinaryUploadResult(secureUrl, publicId);

        } catch (IOException e) {
            log.error("Lỗi tải ảnh chat lên Cloudinary", e);
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
                log.info("Đang xử lý & tải ảnh Base64 lên Cloudinary thư mục: {}", folder);
                // Gọi hàm nén & thu nhỏ ảnh độc lập bên ngoài trước khi upload
                byte[] optimizedBytes = optimizeAndResizeImageBase64(trimmed);
                Object uploadPayload = (optimizedBytes != null && optimizedBytes.length > 0) ? optimizedBytes : trimmed;

                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        uploadPayload,
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

    /**
     * Hàm phụ trợ độc lập: Tự động thu nhỏ (resize) & nén ảnh JPEG chất lượng cao trước khi đẩy lên Cloudinary.
     * Tách riêng hoàn toàn để dễ kiểm soát, phục vụ đồng bộ cho cả Web và Mobile App sau này.
     * 
     * @param base64Source Chuỗi data URL (data:image/...;base64,...) hoặc chuỗi base64 thô
     * @return Mảng byte ảnh đã nén/resize hoặc mảng byte gốc nếu không cần nén / lỗi fallback
     */
    private byte[] optimizeAndResizeImageBase64(String base64Source) {
        try {
            String base64Data = base64Source;
            int commaIdx = base64Source.indexOf(',');
            if (commaIdx >= 0) {
                base64Data = base64Source.substring(commaIdx + 1);
            }
            byte[] rawBytes = Base64.getDecoder().decode(base64Data.trim());

            // Nếu ảnh ban đầu đã nhẹ sẵn (< 300KB), giữ nguyên để tiết kiệm chu kỳ CPU
            if (rawBytes.length < 300 * 1024) {
                return rawBytes;
            }

            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(rawBytes));
            if (originalImage == null) {
                return rawBytes;
            }

            int originWidth = originalImage.getWidth();
            int originHeight = originalImage.getHeight();
            int maxDimension = 1280;

            int targetWidth = originWidth;
            int targetHeight = originHeight;

            if (originWidth > maxDimension || originHeight > maxDimension) {
                double ratio = Math.min((double) maxDimension / originWidth, (double) maxDimension / originHeight);
                targetWidth = (int) Math.round(originWidth * ratio);
                targetHeight = (int) Math.round(originHeight * ratio);
            }

            // Dùng BufferedImage TYPE_INT_RGB để tương thích chuẩn khi ghi file JPEG (tránh lỗi kênh Alpha)
            BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = resizedImage.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
            if (writers.hasNext()) {
                ImageWriter writer = writers.next();
                try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
                    writer.setOutput(ios);
                    ImageWriteParam param = writer.getDefaultWriteParam();
                    if (param.canWriteCompressed()) {
                        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                        param.setCompressionQuality(0.80f); // 80% JPEG quality
                    }
                    writer.write(null, new javax.imageio.IIOImage(resizedImage, null, null), param);
                } finally {
                    writer.dispose();
                }
                byte[] optimized = baos.toByteArray();
                log.info("⚡ Đã tối ưu ảnh trước khi upload: {} KB -> {} KB (Resize: {}x{} -> {}x{})",
                        rawBytes.length / 1024, optimized.length / 1024, originWidth, originHeight, targetWidth, targetHeight);
                return optimized;
            } else {
                ImageIO.write(resizedImage, "jpg", baos);
                return baos.toByteArray();
            }
        } catch (Exception ex) {
            log.warn("Không thể tối ưu ảnh Base64 trước upload, sử dụng dữ liệu gốc: {}", ex.getMessage());
            try {
                String base64Data = base64Source.contains(",") ? base64Source.substring(base64Source.indexOf(',') + 1) : base64Source;
                return Base64.getDecoder().decode(base64Data.trim());
            } catch (Exception e) {
                return null;
            }
        }
    }

    @Override
    public Map<String, String> uploadBase64OrUrlBatch(List<String> sources, String folder) {
        if (sources == null || sources.isEmpty()) return Collections.emptyMap();

        // Deduplication & filter blank
        Set<String> distinctSources = sources.stream()
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.toSet());

        if (distinctSources.isEmpty()) return Collections.emptyMap();

        log.info("⚡ Đang tải SONG SONG {} ảnh lên Cloudinary thư mục: {}", distinctSources.size(), folder);
        long startTime = System.currentTimeMillis();

        List<CompletableFuture<Map.Entry<String, String>>> futures = distinctSources.stream()
                .map(src -> CompletableFuture.supplyAsync(() -> {
                    String url = uploadBase64OrUrl(src, folder);
                    return Map.entry(src, url);
                }, uploadExecutor))
                .collect(Collectors.toList());

        // Wait for all uploads to complete concurrently
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        Map<String, String> resultMap = new ConcurrentHashMap<>();
        for (CompletableFuture<Map.Entry<String, String>> future : futures) {
            try {
                Map.Entry<String, String> entry = future.join();
                resultMap.put(entry.getKey(), entry.getValue());
            } catch (Exception e) {
                log.error("Lỗi khi join kết quả upload song song:", e);
                if (e.getCause() instanceof RuntimeException) {
                    throw (RuntimeException) e.getCause();
                }
                throw new AppException("Lỗi khi xử lý tải ảnh song song: " + e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("⚡ Tải SONG SONG {} ảnh lên Cloudinary hoàn tất trong {} ms!", resultMap.size(), duration);
        return resultMap;
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
}

