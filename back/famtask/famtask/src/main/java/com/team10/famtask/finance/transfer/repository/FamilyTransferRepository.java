package com.team10.famtask.finance.transfer.repository;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.finance.transfer.entity.FamilyTransfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamilyTransferRepository extends JpaRepository<FamilyTransfer, Long> {
    List<FamilyTransfer> findByFamilyOrderByCreatedAtDesc(Family family);
}
