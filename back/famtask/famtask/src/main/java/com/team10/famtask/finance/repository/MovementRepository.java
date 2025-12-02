package com.team10.famtask.finance.repository;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.finance.entity.Movement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MovementRepository extends JpaRepository<Movement, Long> {

    List<Movement> findByFamily(Family family);

    // Movimientos por familia y rango de fechas
    List<Movement> findByFamilyAndCreatedAtBetween(
            Family family,
            LocalDateTime start,
            LocalDateTime end
    );

    // Total por categoría (lo calculamos en el service)
    // Pero si querés optimizar, también podés usar query nativa:
    @Query("""
            SELECT m.category, SUM(m.amount)
            FROM Movement m
            WHERE m.family = :family
            AND m.createdAt BETWEEN :start AND :end
            GROUP BY m.category
            """)
    List<Object[]> sumAmountByCategory(
            @Param("family") Family family,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    // Total ingresos / egresos
    @Query("""
            SELECT m.type, SUM(m.amount)
            FROM Movement m
            WHERE m.family = :family
            AND m.createdAt BETWEEN :start AND :end
            GROUP BY m.type
            """)
    List<Object[]> sumByType(
            @Param("family") Family family,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}