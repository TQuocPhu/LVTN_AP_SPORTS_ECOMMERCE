package com.web.ap_sports.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class VariantAttributeUtil {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private VariantAttributeUtil() {
    }

    /**
     * Parse chuỗi attributes JSON (ví dụ: {"Màu sắc": "Đen", "Kích thước": "42"})
     * và tạo chuỗi tổng quan phân loại hàng (ví dụ: "Màu sắc: Đen, Kích thước: 42").
     */
    public static String buildSummary(String attributesJson, String fallbackColor, String fallbackSize, String fallbackSku) {
        if (StringUtils.hasText(attributesJson)) {
            try {
                Map<String, Object> map = OBJECT_MAPPER.readValue(
                        attributesJson.trim(),
                        new TypeReference<Map<String, Object>>() {}
                );

                List<String> summaryParts = new ArrayList<>();
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    String key = entry.getKey();
                    String val = entry.getValue() != null ? String.valueOf(entry.getValue()).trim() : "";
                    if (StringUtils.hasText(val)) {
                        summaryParts.add(key + ": " + val);
                    }
                }

                if (!summaryParts.isEmpty()) {
                    return String.join(", ", summaryParts);
                }
            } catch (Exception ignored) {
                return attributesJson.trim();
            }
        }

        List<String> fallbackParts = new ArrayList<>();
        if (StringUtils.hasText(fallbackColor)) {
            fallbackParts.add("Màu: " + fallbackColor.trim());
        }
        if (StringUtils.hasText(fallbackSize)) {
            fallbackParts.add("Size: " + fallbackSize.trim());
        }

        if (!fallbackParts.isEmpty()) {
            return String.join(", ", fallbackParts);
        }

        return StringUtils.hasText(fallbackSku) ? fallbackSku.trim() : null;
    }
}
