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
}
