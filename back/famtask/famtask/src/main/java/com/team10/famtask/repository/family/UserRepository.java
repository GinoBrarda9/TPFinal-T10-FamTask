package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByDni(String dni);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByGoogleEmail(String googleEmail);

    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.familyMemberships fm " +
            "LEFT JOIN FETCH fm.family " +
            "WHERE u.dni = :dni")
    Optional<User> findFullUser(@Param("dni") String dni);

}


