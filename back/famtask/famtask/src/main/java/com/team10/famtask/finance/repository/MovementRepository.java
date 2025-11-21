package com.team10.famtask.finance.repository;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.finance.entity.Movement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {

    List<Movement> findByFamily(Family family);
}