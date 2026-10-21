package com.web.ap_sports.repository;

import com.web.ap_sports.entity.DeviceToken;
import com.web.ap_sports.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    Optional<DeviceToken> findByDeviceToken(String deviceToken);

    Optional<DeviceToken> findByDeviceTokenAndUser(String deviceToken, User user);

    List<DeviceToken> findByUserOrderByUpdatedAtDesc(User user);
}
