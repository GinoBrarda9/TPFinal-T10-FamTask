package com.team10.famtask.repository.profile;

import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.entity.profile.MedicalInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicalInfoRepository extends JpaRepository<MedicalInfo, Long> {
    Optional<MedicalInfo> findByUserDni(String dni);

}