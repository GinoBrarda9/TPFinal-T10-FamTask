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

    // ✅ Eventos familiares (visibles por todos los miembros de la familia)
    // Mantiene el mismo nombre
    List<Event> findByFamilyAndFinishedFalse(Family family);

    // ✅ Alternativa interna segura por ID (opcional, por si la usás en el service)
    List<Event> findByFamily_IdAndFinishedFalse(Long familyId);

    // ✅ Eventos personales (solo del usuario actual)
    List<Event> findByAssignedToAndFinishedFalse(FamilyMember member);

    // ✅ Recordatorios de día antes
    List<Event> findAllByStartTimeBetweenAndReminderDayBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    // ✅ Recordatorios de hora antes
    List<Event> findAllByStartTimeBetweenAndReminderHourBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    // ✅ Recordatorios dentro de una franja de tiempo (scheduler)
    List<Event> findAllByStartTimeGreaterThanEqualAndStartTimeLessThanAndReminderHourBeforeSentFalse(
            LocalDateTime startInclusive, LocalDateTime endExclusive
    );

    // ✅ Eventos que ya finalizaron (para marcar como terminados)
    List<Event> findByEndTimeBeforeAndFinishedFalse(LocalDateTime now);

    // ✅ Eventos próximos (familiares o personales) — para calendario o dashboard
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

    // ✅ Eventos personales por DNI (para evitar usar FamilyMember directamente)
    List<Event> findByAssignedTo_User_DniAndFinishedFalse(String dni);
}
