package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
    List<RolePermission> findByRole(Role role);
}
