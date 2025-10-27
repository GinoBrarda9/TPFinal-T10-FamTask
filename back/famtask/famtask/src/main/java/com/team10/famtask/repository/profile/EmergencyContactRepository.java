package com.team10.famtask.repository.profile;

import com.team10.famtask.entity.profile.ContactInfo;
import com.team10.famtask.entity.profile.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    Optional<EmergencyContact> findByUserDni(String dni);
}