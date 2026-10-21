package com.web.ap_sports.repository;

import com.web.ap_sports.entity.DeviceToken;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String tokenHash);

    Optional<RefreshToken> findByPreviousToken(String previousTokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user")
    void revokeAllUserTokens(@Param("user") User user);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.deviceToken = :deviceToken")
    void revokeByUserAndDevice(@Param("user") User user, @Param("deviceToken") DeviceToken deviceToken);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.deviceToken = :deviceToken")
    void revokeByDeviceToken(@Param("deviceToken") DeviceToken deviceToken);

    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.deviceToken d WHERE r.user = :user AND r.revoked = false AND r.expiresAt > CURRENT_TIMESTAMP ORDER BY d.updatedAt DESC")
    List<RefreshToken> findActiveSessionsByUser(@Param("user") User user);
}

