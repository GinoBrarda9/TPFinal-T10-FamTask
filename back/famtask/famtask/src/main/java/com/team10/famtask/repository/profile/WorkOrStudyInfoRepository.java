package com.team10.famtask.repository.profile;

import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkOrStudyInfoRepository extends JpaRepository<WorkOrStudyInfo, Long> {
    Optional<WorkOrStudyInfo> findByUserDni(String dni);
}