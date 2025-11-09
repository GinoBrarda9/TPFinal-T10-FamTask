package com.team10.famtask.event.service;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.event.dto.EventDTO;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.repository.EventRepository;
import com.team10.famtask.google.service.GoogleCalendarService;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository memberRepository;
    private final SecurityService securityService;
    private final GoogleCalendarService googleCalendarService;

    // =======================================================
    // ✅ CREAR EVENTO
    // =======================================================
    @Transactional
    public Event createEvent(EventDTO dto) {

        User currentUser = securityService.getCurrentUser();

        if (dto.getFamilyId() != null && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los administradores pueden crear eventos familiares.");
        }

        Family family = null;
        FamilyMember member = null;

        if (dto.getFamilyId() != null) {
            family = familyRepository.findById(dto.getFamilyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Familia no encontrada."));
        }

        if (dto.getMemberDni() != null) {
            member = memberRepository.findByIdUserDni(dto.getMemberDni())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Miembro no encontrado."));
        }


        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .location(dto.getLocation())
                .color(dto.getColor())
                .allDay(dto.isAllDay())
                .family(family)
                .assignedTo(member)
                .build();

        Event saved = eventRepository.save(event);
        googleCalendarService.syncEvent(saved);

        return saved;
    }

    // =======================================================
    // ✅ OBTENER EVENTOS
    // =======================================================
    public List<Event> getFamilyEvents(Long familyId) {
        // Validar que la familia exista
        familyRepository.findById(familyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Familia no encontrada."));

        // 🔹 Buscar por ID directamente para evitar comparar objetos distintos
        return eventRepository.findByFamily_IdAndFinishedFalse(familyId);
    }


    public List<Event> getMemberEvents(String dni) {
        FamilyMember member = memberRepository.findByIdUserDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Miembro no encontrado."));
        return eventRepository.findByAssignedToAndFinishedFalse(member);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));
    }

    // =======================================================
    // ✅ ACTUALIZAR EVENTO
    // =======================================================
    @Transactional
    public Event patchEvent(Long id, Map<String, Object> updates, User currentUser) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado"));

        if (event.getFamily() != null) { // Familiar
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden editar eventos familiares.");
            }
        } else { // Personal
            if (event.getAssignedTo() == null ||
                    !event.getAssignedTo().getUser().getDni().equals(currentUser.getDni())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes editar este evento personal.");
            }
        }

        LocalDateTime oldStart = event.getStartTime();

        if (updates.containsKey("title"))       event.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) event.setDescription((String) updates.get("description"));
        if (updates.containsKey("startTime"))   event.setStartTime(LocalDateTime.parse((String) updates.get("startTime")));
        if (updates.containsKey("endTime"))     event.setEndTime(LocalDateTime.parse((String) updates.get("endTime")));
        if (updates.containsKey("location"))    event.setLocation((String) updates.get("location"));
        if (updates.containsKey("color"))       event.setColor((String) updates.get("color"));
        if (updates.containsKey("allDay"))      event.setAllDay((Boolean) updates.get("allDay"));

        if (oldStart != null && event.getStartTime() != null && !oldStart.equals(event.getStartTime())) {
            event.setReminderDayBeforeSent(false);
            event.setReminderHourBeforeSent(false);
        }

        Event updated = eventRepository.save(event);
        googleCalendarService.updateEvent(updated);

        return updated;
    }

    // =======================================================
    // ✅ ELIMINAR EVENTO
    // =======================================================
    @Transactional
    public void deleteEvent(Long id, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado."));

        if (event.getFamily() != null) { // Familiar
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden eliminar eventos familiares.");
        } else { // Personal
            if (event.getAssignedTo() == null ||
                    !event.getAssignedTo().getUser().getDni().equals(currentUser.getDni()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar este evento personal.");
        }

        eventRepository.delete(event);
        googleCalendarService.deleteEvent(event);
    }
}
