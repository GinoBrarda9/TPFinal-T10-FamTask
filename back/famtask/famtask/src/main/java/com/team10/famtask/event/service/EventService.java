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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
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
                .createdBy(currentUser)
                .reminderDayBeforeSent(false)
                .reminderHourBeforeSent(false)
                .build();

        Event saved = eventRepository.save(event);

        // 🔗 Sincronizar con Google
        if (Boolean.TRUE.equals(saved.getCreatedBy().isGoogleLinked()) &&
                saved.getCreatedBy().getGoogleRefreshToken() != null) {

            try {
                googleCalendarService.syncEvent(saved);

            } catch (IllegalStateException ex) {

                if ("GOOGLE_REAUTH_REQUIRED".equals(ex.getMessage())) {
                    log.warn("⚠️ Google vinculación perdida para '{}'. Se requiere nueva autorización.", currentUser.getEmail());

                    throw new ResponseStatusException(
                            HttpStatus.PRECONDITION_REQUIRED,
                            "GOOGLE_REAUTH_REQUIRED"
                    );
                }

                throw ex;
            }

        } else {
            log.warn("⚠️ El creador no tiene Google vinculado. No se sincroniza.");
        }

        return saved;
    }

    // =======================================================
    // ✅ OBTENER EVENTOS
    // =======================================================
    public List<Event> getFamilyEvents(Long familyId) {
        familyRepository.findById(familyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Familia no encontrada."));
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

        if (event.getFamily() != null) {
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden editar eventos familiares.");
            }
        } else {
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

        // 🔗 Sincronizar update
        if (updated.getCreatedBy() != null &&
                Boolean.TRUE.equals(updated.getCreatedBy().isGoogleLinked()) &&
                updated.getCreatedBy().getGoogleRefreshToken() != null) {

            try {
                googleCalendarService.updateEvent(updated);

            } catch (IllegalStateException ex) {

                if ("GOOGLE_REAUTH_REQUIRED".equals(ex.getMessage())) {
                    throw new ResponseStatusException(
                            HttpStatus.PRECONDITION_REQUIRED,
                            "GOOGLE_REAUTH_REQUIRED"
                    );
                }
                throw ex;
            }

        } else {
            log.warn("⚠️ No se puede actualizar en Google (no hay vinculación válida).");
        }

        return updated;
    }

    // =======================================================
    // ✅ ELIMINAR EVENTO
    // =======================================================
    @Transactional
    public void deleteEvent(Long id, User currentUser) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento no encontrado."));

        if (event.getFamily() != null) {
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden eliminar eventos familiares.");
        } else {
            if (event.getAssignedTo() == null ||
                    !event.getAssignedTo().getUser().getDni().equals(currentUser.getDni()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar este evento personal.");
        }

        // 🔗 Intentar borrar en Google
        if (event.getCreatedBy() != null &&
                Boolean.TRUE.equals(event.getCreatedBy().isGoogleLinked()) &&
                event.getCreatedBy().getGoogleRefreshToken() != null) {

            try {
                googleCalendarService.deleteEvent(event);

            } catch (IllegalStateException ex) {
                if ("GOOGLE_REAUTH_REQUIRED".equals(ex.getMessage())) {
                    throw new ResponseStatusException(
                            HttpStatus.PRECONDITION_REQUIRED,
                            "GOOGLE_REAUTH_REQUIRED"
                    );
                }
                throw ex;
            }

        } else {
            log.warn("⚠️ No se elimina en Google (vinculación no válida).");
        }

        eventRepository.delete(event);
    }
}
