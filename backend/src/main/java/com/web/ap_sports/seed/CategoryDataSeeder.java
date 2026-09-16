package com.web.ap_sports.seed;

import com.web.ap_sports.entity.Category;
import com.web.ap_sports.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryDataSeeder {

    private final CategoryRepository categoryRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedCategoriesIfEmpty() {
        if (categoryRepository.count() > 0) {
            log.info("Dữ liệu danh mục sản phẩm đã tồn tại ({}), bỏ qua bước seed.", categoryRepository.count());
            return;
        }

        log.info("Khởi tạo seed dữ liệu cây danh mục sản phẩm chuẩn AP Sports...");

        // 1. Danh mục Bóng Đá
        Category football = createCategory("Bóng Đá", "bong-da", "Trang thiết bị, trang phục và phụ kiện thi đấu bóng đá nguyên bản", null);
        createCategory("Giày bóng đá", "giay-bong-da", "Giày đinh FG, TF, IC chính hãng cao cấp", football);
        createCategory("Đồ bộ bóng đá", "do-bo-bong-da", "Quần áo câu lạc bộ và đội tuyển quốc gia chất liệu thoáng khí", football);
        createCategory("Quả bóng đá", "qua-bong-da", "Bóng thi đấu chuẩn FIFA và bóng tập luyện", football);
        createCategory("Găng tay thủ môn", "gang-tay-thu-mon", "Găng tay thủ môn dính bóng có xương bảo vệ", football);

        // 2. Danh mục Cầu Lông
        Category badminton = createCategory("Cầu Lông", "cau-long", "Dụng cụ và trang phục thi đấu cầu lông chuyên nghiệp", null);
        createCategory("Đồ bộ cầu lông", "do-bo-cau-long", "Áo quần cầu lông co giãn 4 chiều siêu nhẹ", badminton);
        createCategory("Vợt cầu lông", "vot-cau-long", "Vợt cầu lông trợ lực, công thủ toàn diện", badminton);
        createCategory("Ống cầu lông", "ong-cau-long", "Quả cầu lông lông vũ tốc độ 76/77 chuẩn thi đấu", badminton);

        // 3. Danh mục Bóng Chuyền
        createCategory("Bóng Chuyền", "bong-chuyen", "Bóng chuyền da, băng bó cơ gối và trang phục thi đấu", null);

        // 4. Danh mục Bóng Rổ
        createCategory("Bóng Rổ", "bong-ro", "Bóng rổ da thật, giáp bảo vệ và trang phục thi đấu bóng rổ", null);

        // 5. Danh mục Võ Thuật
        createCategory("Võ Thuật", "vo-thuat", "Võ phục Karate, Taekwondo, đai võ, giáp tập luyện và bảo hộ", null);

        log.info("Seed cây danh mục sản phẩm hoàn tất! Tổng cộng đã khởi tạo {} danh mục.", categoryRepository.count());
    }

    private Category createCategory(String name, String slug, String description, Category parent) {
        Category cat = Category.builder()
                .name(name)
                .slug(slug)
                .description(description)
                .parent(parent)
                .build();
        return categoryRepository.save(cat);
    }
}
