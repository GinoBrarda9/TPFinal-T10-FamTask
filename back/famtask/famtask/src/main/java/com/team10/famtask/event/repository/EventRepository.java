package com.team10.famtask.event.repository;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // ============================================================
    // 🔥 NUEVOS: obtener TODOS los eventos familiares (incluye finalizados)
    // ============================================================
    List<Event> findByFamily(Family family);

    List<Event> findByFamily_Id(Long familyId);

    // 🔥 Nuevos: obtener TODOS los eventos personales (incluye finalizados)
    List<Event> findByAssignedTo(FamilyMember member);

    List<Event> findByAssignedTo_User_Dni(String dni);


    // ============================================================
    // ⚠️ ANTIGUOS (SE SIGUEN USANDO EN SCHEDULERS / RECORDATORIOS)
    // NO HAY QUE BORRARLOS
    // ============================================================

    // Eventos familiares activos
    List<Event> findByFamilyAndFinishedFalse(Family family);

    List<Event> findByFamily_IdAndFinishedFalse(Long familyId);

    // Eventos personales activos
    List<Event> findByAssignedToAndFinishedFalse(FamilyMember member);

    List<Event> findByAssignedTo_User_DniAndFinishedFalse(String dni);

    // Recordatorios día antes
    List<Event> findAllByStartTimeBetweenAndReminderDayBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    // Recordatorios hora antes
    List<Event> findAllByStartTimeBetweenAndReminderHourBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    // Recordatorios dentro de un rango
    List<Event> findAllByStartTimeGreaterThanEqualAndStartTimeLessThanAndReminderHourBeforeSentFalse(
            LocalDateTime startInclusive, LocalDateTime endExclusive
    );

    // Eventos para finalizar automáticamente
    List<Event> findByEndTimeBeforeAndFinishedFalse(LocalDateTime now);


    // ============================================================
    // Vista para dashboard/calendario — filtra ACTIVE solo porque es para vista
    // ============================================================
    @Query("""
        select distinct e
        from Event e
        left join fetch e.assignedTo m
        left join fetch m.user u
        left join fetch e.family f
        left join fetch f.members fm
        left join fetch fm.user fmu
        where
            (m.user.dni = :dni OR fm.user.dni = :dni)
            and e.startTime >= :start
            and e.startTime < :end
            and e.finished = false
    """)
    List<Event> findAllUpcomingByUserOrFamilyBetween(
            @Param("dni") String dni,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
