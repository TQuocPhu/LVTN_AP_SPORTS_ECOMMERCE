package com.web.ap_sports.seed;

import com.web.ap_sports.entity.Category;
import com.web.ap_sports.repository.CategoryRepository;
import com.web.ap_sports.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Seeder khởi tạo cây danh mục sản phẩm chuẩn SEO cho AP Sports:
 * - Đúng 6 danh mục gốc (Cấp 1):
 *   1. Bóng Đá (Chủ đạo - có tới con cấp 2)
 *   2. Cầu Lông (đến con cấp 1)
 *   3. Bóng Rổ (đến con cấp 1)
 *   4. Bóng Chuyền (đến con cấp 1)
 *   5. Gym & Chạy Bộ (đến con cấp 1)
 *   6. Võ Thuật (đến con cấp 1)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryDataSeeder {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    // Danh sách 6 slug danh mục gốc chuẩn
    private static final Set<String> VALID_ROOT_SLUGS = Set.of(
            "bong-da",
            "cau-long",
            "bong-ro",
            "bong-chuyen",
            "gym-chay-bo",
            "vo-thuat"
    );

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedCategories() {
        // Kiểm tra nếu hệ thống đã có đủ đúng 6 danh mục gốc hợp lệ thì bỏ qua không seed lại
        long validRootCount = categoryRepository.findByParentIsNull().stream()
                .filter(cat -> VALID_ROOT_SLUGS.contains(cat.getSlug()))
                .count();

        if (validRootCount == 6) {
            log.info("Hệ thống đã có đủ đúng 6 danh mục gốc chuẩn AP Sports, bỏ qua bước seed.");
            return;
        }

        log.info("Bắt đầu khởi tạo chuẩn xác cây 6 danh mục gốc cho AP Sports...");

        // Nếu trong DB chưa có sản phẩm nào, dọn sạch categories rác cũ để tránh bị nhân bản
        if (productRepository.count() == 0) {
            log.info("Chưa có sản phẩm trong hệ thống, dọn dẹp các danh mục cũ để đồng bộ chuẩn 6 danh mục gốc...");
            categoryRepository.deleteAll();
            categoryRepository.flush();
        }

        // =====================================================================
        // 1. ⚽ BÓNG ĐÁ (GỐC 1 - CHỦ ĐẠO - ĐẦY ĐỦ ĐẾN CON CẤP 2)
        // =====================================================================
        Category football = createOrUpdateCategory(
                "Bóng Đá",
                "bong-da",
                "Trang thiết bị, trang phục và phụ kiện thi đấu bóng đá chính hãng, chuyên nghiệp",
                null
        );

        // 1.1. Giày Bóng Đá (Con cấp 1)
        Category footballShoes = createOrUpdateCategory(
                "Giày Bóng Đá",
                "giay-bong-da",
                "Giày đá banh chính hãng đinh TF, FG hỗ trợ bứt tốc và kiểm soát bóng",
                football
        );
        // Con cấp 2 của Giày
        createOrUpdateCategory(
                "Giày Sân Cỏ Nhân Tạo (TF)",
                "giay-san-co-nhan-tao-tf",
                "Giày đinh dăm TF bám sân cỏ nhân tạo, êm chân và giảm chấn khớp gối",
                footballShoes
        );
        createOrUpdateCategory(
                "Giày Sân Cỏ Tự Nhiên (FG)",
                "giay-san-co-tu-nhien-fg",
                "Giày đinh cao FG bám sân cỏ tự nhiên, hỗ trợ xoay trở linh hoạt",
                footballShoes
        );

        // 1.2. Quần Áo Bóng Đá (Con cấp 1)
        Category footballApparel = createOrUpdateCategory(
                "Quần Áo Bóng Đá",
                "quan-ao-bong-da",
                "Đồ bộ bóng đá câu lạc bộ, đội tuyển quốc gia và đồ đá banh thoáng khí",
                football
        );
        // Con cấp 2 của Quần áo
        createOrUpdateCategory(
                "Đồ Bộ Câu Lạc Bộ",
                "do-bo-cau-lac-bo",
                "Áo đấu thi đấu các CLB hàng đầu: MU, Real Madrid, Arsenal, Barcelona, Man City...",
                footballApparel
        );
        createOrUpdateCategory(
                "Đồ Bộ Đội Tuyển Quốc Gia",
                "do-bo-doi-tuyen-quoc-gia",
                "Áo đấu World Cup, Euro của Việt Nam, Argentina, Bồ Đào Nha, Anh, Pháp...",
                footballApparel
        );

        // 1.3. Phụ Kiện Bóng Đá (Con cấp 1)
        Category footballAccessories = createOrUpdateCategory(
                "Phụ Kiện Bóng Đá",
                "phu-kien-bong-da",
                "Bóng thi đấu, găng tay bắt bóng, bọc ống đồng và vớ chống trượt",
                football
        );
        // Con cấp 2 của Phụ kiện
        createOrUpdateCategory(
                "Quả Bóng Đá",
                "qua-bong-da",
                "Quả bóng đá thi đấu size 4, size 5 chuẩn FIFA dành cho sân 5, 7, 11 người",
                footballAccessories
        );
        createOrUpdateCategory(
                "Găng Tay Thủ Môn",
                "gang-tay-thu-mon",
                "Găng tay thủ môn dính bóng có xương bảo vệ chống lật ngón",
                footballAccessories
        );

        // =====================================================================
        // 2. 🏸 CẦU LÔNG (GỐC 2 - ĐẾN CON CẤP 1)
        // =====================================================================
        Category badminton = createOrUpdateCategory(
                "Cầu Lông",
                "cau-long",
                "Dụng cụ thi đấu và trang phục cầu lông chính hãng, siêu nhẹ và trợ lực tốt",
                null
        );
        createOrUpdateCategory(
                "Vợt Cầu Lông",
                "vot-cau-long",
                "Vợt cầu lông công thủ toàn diện, trợ lực tốt cho người chơi phong trào",
                badminton
        );
        createOrUpdateCategory(
                "Giày Cầu Lông",
                "giay-cau-long",
                "Giày đánh cầu đế cao su bám sân gỗ, chống lật cổ chân",
                badminton
        );
        createOrUpdateCategory(
                "Quần Áo & Phụ Kiện Cầu Lông",
                "quan-ao-phu-kien-cau-long",
                "Đồ bộ cầu lông, quả cầu lông lông vũ, quấn cán vợt, băng chặn mồ hôi",
                badminton
        );

        // =====================================================================
        // 3. 🏀 BÓNG RỔ (GỐC 3 - ĐẾN CON CẤP 1)
        // =====================================================================
        Category basketball = createOrUpdateCategory(
                "Bóng Rổ",
                "bong-ro",
                "Quả bóng rổ da PU tiêu chuẩn thi đấu, trang phục và phụ kiện bóng rổ",
                null
        );
        createOrUpdateCategory(
                "Quả Bóng Rổ",
                "qua-bong-ro",
                "Quả bóng rổ da PU số 7 chuẩn thi đấu trong nhà và ngoài trời",
                basketball
        );
        createOrUpdateCategory(
                "Quần Áo & Phụ Kiện Bóng Rổ",
                "quan-ao-phu-kien-bong-ro",
                "Đồng phục bóng rổ sát nách thoáng khí, băng bảo vệ cổ tay và đầu gối",
                basketball
        );

        // =====================================================================
        // 4. 🏐 BÓNG CHUYỀN (GỐC 4 - ĐẾN CON CẤP 1)
        // =====================================================================
        Category volleyball = createOrUpdateCategory(
                "Bóng Chuyền",
                "bong-chuyen",
                "Quả bóng chuyền da mềm mại, trang phục thi đấu và bảo hộ khớp gối",
                null
        );
        createOrUpdateCategory(
                "Quả Bóng Chuyền",
                "qua-bong-chuyen",
                "Quả bóng chuyền da dán mềm mại chuẩn thi đấu trường học và phong trào",
                volleyball
        );
        createOrUpdateCategory(
                "Quần Áo & Băng Bảo Hộ Bóng Chuyền",
                "quan-ao-bang-bao-ho-bong-chuyen",
                "Trang phục bóng chuyền nam nữ và băng bọc gối giảm chấn trợ lực",
                volleyball
        );

        // =====================================================================
        // 5. 🏃 GYM & CHẠY BỘ (GỐC 5 - ĐẾN CON CẤP 1)
        // =====================================================================
        Category gymRunning = createOrUpdateCategory(
                "Gym & Chạy Bộ",
                "gym-chay-bo",
                "Trang phục thể hình, giày chạy marathon và dụng cụ tập thể thao cá nhân",
                null
        );
        createOrUpdateCategory(
                "Quần Áo Tập Gym & Running",
                "quan-ao-tap-gym-running",
                "Áo thun Dry-Fit, áo ba lỗ Tanktop thể hình, quần short 2 lớp và quần bó cơ",
                gymRunning
        );
        createOrUpdateCategory(
                "Giày Chạy Bộ",
                "giay-chay-bo",
                "Giày chạy bộ êm ái đệm bọt Eva, trợ lực nhẹ nhàng cho cự ly 5km, 10km, 21km",
                gymRunning
        );
        createOrUpdateCategory(
                "Phụ Kiện Thể Hình & Kháng Lực",
                "phu-kien-the-hinh-khang-luc",
                "Dây kháng lực mini band, găng tay tập tạ đệm mút, đai lưng và bình nước thể thao",
                gymRunning
        );

        // =====================================================================
        // 6. 🥊 VÕ THUẬT (GỐC 6 - ĐẾN CON CẤP 1)
        // =====================================================================
        Category martialArts = createOrUpdateCategory(
                "Võ Thuật",
                "vo-thuat",
                "Găng tay Boxing, võ phục truyền thống, đai võ và giáp bảo hộ thi đấu",
                null
        );
        createOrUpdateCategory(
                "Găng Tay & Băng Đấm Boxing",
                "gang-tay-bang-dam-boxing",
                "Găng tay quyền anh Boxing, găng đấm Muay Thái, MMA và băng quấn tay bảo vệ khớp",
                martialArts
        );
        createOrUpdateCategory(
                "Võ Phục & Giáp Bảo Hộ",
                "vo-phuc-giap-bao-ho",
                "Võ phục Karate, Taekwondo, Vovinam kèm đai, bảo hộ răng và giáp ngực",
                martialArts
        );

        log.info("Đã khởi tạo chuẩn xác cây 6 danh mục gốc cho AP Sports! Hiện có {} danh mục trong hệ thống.",
                categoryRepository.count());
    }

    /**
     * Tìm danh mục theo slug; nếu chưa có thì tạo mới, nếu đã có thì cập nhật đúng parent và description.
     */
    private Category createOrUpdateCategory(String name, String slug, String description, Category parent) {
        return categoryRepository.findBySlug(slug)
                .map(existing -> {
                    existing.setName(name);
                    existing.setDescription(description);
                    existing.setParent(parent);
                    return categoryRepository.save(existing);
                })
                .orElseGet(() -> {
                    Category cat = Category.builder()
                            .name(name)
                            .slug(slug)
                            .description(description)
                            .parent(parent)
                            .build();
                    return categoryRepository.save(cat);
                });
    }
}
