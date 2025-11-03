package com.team10.famtask.repository.profile;

import com.team10.famtask.entity.profile.ContactInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContactInfoRepository extends JpaRepository<ContactInfo, Long> {
    Optional<ContactInfo> findByUser_Dni(String dni);
}
