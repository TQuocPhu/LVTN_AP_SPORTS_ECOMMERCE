package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.CreateStaffRequest;
import com.web.ap_sports.dto.request.admin.UpdateUserStatusRequest;
import com.web.ap_sports.dto.response.admin.UserAdminResponse;
import com.web.ap_sports.dto.response.admin.UserDetailAdminResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.exception.ResourceNotFoundException;
import com.web.ap_sports.repository.RoleRepository;
import com.web.ap_sports.repository.ShippingAddressRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation xử lý toàn bộ nghiệp vụ Quản lý Tài khoản Người dùng dành cho Admin.
 * Tuân thủ kiến trúc phân lớp Enterprise, bao gồm:
 * - Quy tắc tài khoản ADMIN luôn đứng ở vị trí #1.
 * - Khóa bảo vệ tài khoản ADMIN tối cao.
 * - Xóa activationToken khi kích hoạt tài khoản pending -> active.
 * - Tạo mới tài khoản Nhân viên (Staff/Warehouse) với mật khẩu mặc định và trạng thái active.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Mật khẩu mặc định hệ thống khi Admin tạo tài khoản nhân viên mới.
     */
    public static final String DEFAULT_STAFF_PASSWORD = "APSport@123>5<108-10-24-0408";

    /**
     * Lấy danh sách tài khoản người dùng có hỗ trợ phân trang, tìm kiếm từ khóa và lọc đa tiêu chí.
     * Quy tắc đặc biệt: Tài khoản ADMIN tối cao luôn được ghim ở vị trí đầu tiên (#1) của danh sách.
     *
     * @param keyword Từ khóa tìm kiếm (họ tên, email, SĐT)
     * @param role Vai trò lọc (ALL, ADMIN, STAFF, WAREHOUSE_MANAGER, CUSTOMER)
     * @param status Trạng thái lọc (ALL, active, pending, banned, deleted)
     * @param sortBy Tiêu chí sắp xếp (createdAt, name, email...)
     * @param sortDir Hướng sắp xếp (ASC, DESC)
     * @param page Trang hiện tại (0-indexed)
     * @param size Số phần tử trên mỗi trang
     * @return Trang kết quả Page<UserAdminResponse>
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UserAdminResponse> getUsers(String keyword, String role, String status, String sortBy, String sortDir, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"),
                sortBy != null && !sortBy.isBlank() ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), kw);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), kw);
                Predicate phoneMatch = cb.like(cb.lower(root.get("phoneNumber")), kw);
                predicates.add(cb.or(nameMatch, emailMatch, phoneMatch));
            }

            if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
                predicates.add(cb.equal(cb.upper(root.get("role").get("name")), role.toUpperCase()));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                try {
                    UserStatus userStatus = UserStatus.valueOf(status.toLowerCase());
                    predicates.add(cb.equal(root.get("status"), userStatus));
                } catch (IllegalArgumentException ignored) {
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
        List<UserAdminResponse> rawList = userPage.getContent().stream()
                .map(this::mapToUserAdminResponse)
                .collect(Collectors.toList());

        // QUY TẮC ĐẶC BIỆT: Tài khoản Admin tối cao (ROLE_ADMIN) luôn được ưu tiên đứng ở vị trí ĐẦU TIÊN (#1)
        List<UserAdminResponse> adminUsers = new ArrayList<>();
        List<UserAdminResponse> nonAdminUsers = new ArrayList<>();

        for (UserAdminResponse u : rawList) {
            if ("ADMIN".equalsIgnoreCase(u.getRole())) {
                adminUsers.add(u);
            } else {
                nonAdminUsers.add(u);
            }
        }

        List<UserAdminResponse> resultList = new ArrayList<>(adminUsers);
        resultList.addAll(nonAdminUsers);

        return new PageImpl<>(resultList, pageable, userPage.getTotalElements());
    }

    /**
     * Xem thông tin chi tiết thông tin cá nhân và danh sách địa chỉ giao hàng của người dùng theo ID.
     *
     * @param id ID của tài khoản người dùng
     * @return UserDetailAdminResponse chứa đầy đủ thông tin cá nhân và mảng địa chỉ nhận hàng
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetailAdminResponse getUserDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

        List<ShippingAddressResponse> addressResponses = shippingAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(id).stream()
                .map(addr -> ShippingAddressResponse.builder()
                        .id(addr.getId())
                        .fullName(addr.getFullName())
                        .phone(addr.getPhone())
                        .address(addr.getAddress())
                        .city(addr.getCity())
                        .provinceId(addr.getProvinceId())
                        .districtId(addr.getDistrictId())
                        .wardCode(addr.getWardCode())
                        .isDefault(addr.isDefault())
                        .createdAt(addr.getCreatedAt())
                        .updatedAt(addr.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());

        return UserDetailAdminResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName() : "CUSTOMER")
                .status(user.getStatus() != null ? user.getStatus().name() : "pending")
                .employeeCode(user.getEmployeeCode())
                .activationToken(user.getActivationToken())
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .addresses(addressResponses)
                .build();
    }

    /**
     * Cập nhật trạng thái hoạt động của tài khoản (active, banned, deleted).
     * Xử lý nghiệp vụ:
     * - Khóa bảo vệ tài khoản ADMIN tối cao (nghiêm cấm đổi).
     * - Ngăn chuyển trạng thái thủ công về 'pending'.
     * - Kích hoạt tài khoản pending -> active: tự động xóa activation_token và xác nhận email.
     * - Khóa tài khoản (banned): Ghi log thông báo số lượng đơn hàng chưa hoàn tất.
     * - Xóa tài khoản (deleted): Ghi log tự động hủy các đơn hàng chưa hoàn tất.
     *
     * @param id ID của tài khoản
     * @param request DTO chứa trạng thái mới
     * @return UserAdminResponse sau khi cập nhật
     */
    @Override
    @Transactional
    public UserAdminResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

        // Kiểm tra quyền Admin tối cao: Không cho phép đổi trạng thái Admin
        if (user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getName())) {
            throw new AppException("Không thể thay đổi trạng thái của tài khoản Quản trị viên tối cao (ADMIN)!", HttpStatus.FORBIDDEN);
        }

        String newStatusStr = request.getStatus().trim().toLowerCase();
        UserStatus newStatus;
        try {
            newStatus = UserStatus.valueOf(newStatusStr);
        } catch (IllegalArgumentException e) {
            throw new AppException("Trạng thái tài khoản không hợp lệ: " + request.getStatus(), HttpStatus.BAD_REQUEST);
        }

        if (UserStatus.pending.equals(newStatus)) {
            throw new AppException("Không thể chuyển trạng thái tài khoản về 'Chờ kích hoạt' (pending) thủ công!", HttpStatus.BAD_REQUEST);
        }

        UserStatus previousStatus = user.getStatus();

        // 1. NGHIỆP VỤ KÍCH HOẠT (pending -> active): Xóa activation_token trong DB và cập nhật email_verified_at
        if (UserStatus.pending.equals(previousStatus) && UserStatus.active.equals(newStatus)) {
            log.info("Kích hoạt tài khoản ID [{}]: Xóa activation_token và cập nhật emailVerifiedAt", id);
            user.setActivationToken(null);
            if (user.getEmailVerifiedAt() == null) {
                user.setEmailVerifiedAt(LocalDateTime.now());
            }
        }

        // 2. NGHIỆP VỤ BANNED (Khóa tài khoản):
        // TODO: Lấy danh sách số lượng đơn hàng đang chờ xử lý của User này để thông báo cho Admin khi có Order module
        if (UserStatus.banned.equals(newStatus)) {
            int pendingOrdersCount = 0; // Thay thế bằng orderRepository.countByUserIdAndStatusPending(id) khi hoàn thiện Order module
            log.info("Khóa tài khoản User ID [{}]. Lưu ý: Người dùng này hiện có {} đơn hàng đang chờ xử lý.", id, pendingOrdersCount);
        }

        // 3. NGHIỆP VỤ DELETED (Đã xóa tài khoản):
        // TODO: Lấy danh sách đơn hàng cần xử lý trước khi đổi trạng thái sang xóa -> tự động hủy đơn hàng chưa hoàn tất khi có Order module
        if (UserStatus.deleted.equals(newStatus)) {
            log.info("Đổi trạng thái tài khoản ID [{}] sang DELETED: Tự động kiểm tra và hủy các đơn hàng chưa hoàn tất.", id);
        }

        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        return mapToUserAdminResponse(savedUser);
    }

    /**
     * Tạo mới tài khoản Nhân viên (STAFF hoặc WAREHOUSE_MANAGER) với mật khẩu mặc định.
     * Tài khoản tạo mới luôn có trạng thái ACTIVE và được gán emailVerifiedAt ngay thời điểm tạo.
     *
     * @param request DTO thông tin nhân viên mới (họ tên, email, SĐT, vai trò)
     * @return UserAdminResponse của tài khoản vừa tạo
     */
    @Override
    @Transactional
    public UserAdminResponse createStaffAccount(CreateStaffRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email '" + email + "' đã tồn tại trên hệ thống!", HttpStatus.CONFLICT);
        }

        String targetRoleName = request.getRole().trim().toUpperCase();
        if (!"STAFF".equals(targetRoleName) && !"WAREHOUSE_MANAGER".equals(targetRoleName)) {
            throw new AppException("Vai trò nhân viên phải là 'STAFF' hoặc 'WAREHOUSE_MANAGER'", HttpStatus.BAD_REQUEST);
        }

        Role role = roleRepository.findByName(targetRoleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(targetRoleName).build()));

        String employeeCode = "EMP-" + (System.currentTimeMillis() % 1000000);

        // Mật khẩu mặc định: APSport@123>5<108-10-24-0408
        // Trạng thái luôn là ACTIVE và email_verified_at được cập nhật ngay tại thời điểm tạo
        User staffUser = User.builder()
                .name(request.getName().trim())
                .email(email)
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .password(passwordEncoder.encode(DEFAULT_STAFF_PASSWORD))
                .role(role)
                .status(UserStatus.active)
                .activationToken(null)
                .emailVerifiedAt(LocalDateTime.now())
                .employeeCode(employeeCode)
                .build();

        User savedUser = userRepository.save(staffUser);
        log.info("Tạo mới thành công tài khoản Nhân viên ID [{}] - Code [{}] với mật khẩu mặc định", savedUser.getId(), employeeCode);

        return mapToUserAdminResponse(savedUser);
    }

    private UserAdminResponse mapToUserAdminResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName() : "CUSTOMER")
                .status(user.getStatus() != null ? user.getStatus().name() : "pending")
                .employeeCode(user.getEmployeeCode())
                .activationToken(user.getActivationToken())
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
