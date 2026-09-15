package com.web.ap_sports.repository;

import com.web.ap_sports.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByEmail(String email);

    Optional<PasswordResetToken> findByTokenAndEmail(String token, String email);

    void deleteByEmail(String email);
}
