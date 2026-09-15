package com.web.ap_sports.repository;

import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {
}
