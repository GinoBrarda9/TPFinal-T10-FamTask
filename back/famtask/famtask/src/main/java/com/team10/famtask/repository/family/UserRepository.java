package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByDni(String dni);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByGoogleEmail(String googleEmail);
}


