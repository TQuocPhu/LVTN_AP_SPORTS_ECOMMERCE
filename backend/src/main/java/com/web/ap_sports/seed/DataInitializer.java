package com.web.ap_sports.seed;

import com.web.ap_sports.entity.Permission;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.RolePermissionId;
import com.web.ap_sports.enums.UserRole;
import com.web.ap_sports.repository.PermissionRepository;
import com.web.ap_sports.repository.RolePermissionRepository;
import com.web.ap_sports.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Component khởi tạo dữ liệu mẫu (Data Seeder).
 * Tự động nạp dữ liệu ban đầu cho các bảng `roles`, `permissions` và `role_permissions` nếu chưa có dữ liệu.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedRolesAndPermissions();
    }

    private void seedRolesAndPermissions() {
        // 1. Khởi tạo danh sách 4 Vai Trò (Roles)
        Role adminRole = getOrCreateRole(UserRole.ADMIN.name());
        Role staffRole = getOrCreateRole(UserRole.STAFF.name());
        Role warehouseRole = getOrCreateRole(UserRole.WAREHOUSE_MANAGER.name());
        Role customerRole = getOrCreateRole(UserRole.CUSTOMER.name());

        // 2. Khởi tạo danh sách Quyền Hạn (Permissions) theo từng cụm chức năng
        Permission pUserMgmt = getOrCreatePermission("MANAGE_USERS");
        Permission pProductMgmt = getOrCreatePermission("MANAGE_PRODUCTS");
        Permission pOrderMgmt = getOrCreatePermission("MANAGE_ORDERS");
        Permission pInventoryMgmt = getOrCreatePermission("MANAGE_INVENTORY");
        Permission pReportMgmt = getOrCreatePermission("VIEW_REPORTS");
        Permission pCustomerStorefront = getOrCreatePermission("CUSTOMER_STOREFRONT");

        // 3. Phân quyền cho Vai Trò ADMIN (Toàn quyền quản trị)
        assignPermissionToRole(adminRole, pUserMgmt);
        assignPermissionToRole(adminRole, pProductMgmt);
        assignPermissionToRole(adminRole, pOrderMgmt);
        assignPermissionToRole(adminRole, pInventoryMgmt);
        assignPermissionToRole(adminRole, pReportMgmt);
        assignPermissionToRole(adminRole, pCustomerStorefront);

        // 4. Phân quyền cho Vai Trò STAFF (Quản lý đơn hàng, sản phẩm, báo cáo cá nhân)
        assignPermissionToRole(staffRole, pOrderMgmt);
        assignPermissionToRole(staffRole, pProductMgmt);
        assignPermissionToRole(staffRole, pReportMgmt);

        // 5. Phân quyền cho Vai Trò WAREHOUSE_MANAGER (Quản lý kho hàng & nhập xuất)
        assignPermissionToRole(warehouseRole, pInventoryMgmt);
        assignPermissionToRole(warehouseRole, pProductMgmt);

        // 6. Phân quyền cho Vai Trò CUSTOMER (Quyền mua hàng Storefront)
        assignPermissionToRole(customerRole, pCustomerStorefront);

        log.info("Khởi tạo thành công dữ liệu mẫu cho bảng roles, permissions và role_permissions.");
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = Role.builder().name(roleName).build();
                    log.info("Tạo vai trò mới: {}", roleName);
                    return roleRepository.save(role);
                });
    }

    private Permission getOrCreatePermission(String permissionName) {
        return permissionRepository.findByName(permissionName)
                .orElseGet(() -> {
                    Permission permission = Permission.builder().name(permissionName).build();
                    log.info("Tạo quyền hạn mới: {}", permissionName);
                    return permissionRepository.save(permission);
                });
    }

    private void assignPermissionToRole(Role role, Permission permission) {
        RolePermissionId id = new RolePermissionId(role.getId(), permission.getId());
        if (!rolePermissionRepository.existsById(id)) {
            RolePermission rolePermission = RolePermission.builder()
                    .id(id)
                    .role(role)
                    .permission(permission)
                    .build();
            rolePermissionRepository.save(rolePermission);
        }
    }
}
