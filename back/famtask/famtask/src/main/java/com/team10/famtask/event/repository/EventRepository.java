package com.team10.famtask.event.repository;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByFamily(Family family);
    List<Event> findByAssignedTo(FamilyMember member);
    List<Event> findAllByStartTimeBetweenAndReminderDayBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    List<Event> findAllByStartTimeBetweenAndReminderHourBeforeSentFalse(LocalDateTime start, LocalDateTime end);

    // (opcional, límites exactos)
    List<Event> findAllByStartTimeGreaterThanEqualAndStartTimeLessThanAndReminderHourBeforeSentFalse(
            LocalDateTime startInclusive, LocalDateTime endExclusive);


}