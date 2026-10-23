package com.web.ap_sports.repository;

import com.web.ap_sports.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    Optional<User> findByActivationToken(String activationToken);
    boolean existsByEmail(String email);
    
    @Query ("SELECT u FROM User u WHERE u.role.name IN :roles AND u.status = com.web.ap_sports.enums.UserStatus.active")
    java.util.List<User> findActiveUsersByRoles(@org.springframework.data.repository.query.Param("roles") java.util.List<String> roles);

    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN RolePermission rp ON rp.role.id = u.role.id " +
           "JOIN rp.permission p " +
           "WHERE p.name = :permissionName AND u.status = com.web.ap_sports.enums.UserStatus.active")
    java.util.List<User> findActiveUsersByPermission(@org.springframework.data.repository.query.Param("permissionName") String permissionName);

    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN RolePermission rp ON rp.role.id = u.role.id " +
           "JOIN rp.permission p " +
           "WHERE p.name IN :permissionNames AND u.status = com.web.ap_sports.enums.UserStatus.active")
    java.util.List<User> findActiveUsersByPermissions(@org.springframework.data.repository.query.Param("permissionNames") java.util.List<String> permissionNames);

    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN RolePermission rp ON rp.role.id = u.role.id " +
           "LEFT JOIN rp.permission p " +
           "WHERE (u.role.name = 'ADMIN' OR p.name = 'SUPPORT_LIVE_CHAT') " +
           "AND u.status = com.web.ap_sports.enums.UserStatus.active")
    java.util.List<User> findActiveSupportLiveChatUsers();
}
