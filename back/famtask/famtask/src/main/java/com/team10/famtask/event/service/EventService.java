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
                .createdBy(currentUser)              // ✅ siempre seteamos el creador
                .reminderDayBeforeSent(false)        // opcional: inicializar flags explícitamente
                .reminderHourBeforeSent(false)
                .build();

        Event saved = eventRepository.save(event);

        // ✅ Sincronizar con Google sólo si el creador tiene refresh token válido
        if (saved.getCreatedBy().isGoogleLinked()
                && saved.getCreatedBy().getGoogleRefreshToken() != null) {
            googleCalendarService.syncEvent(saved);
        } else {
            log.warn("⚠️ El creador no tiene Google vinculado o no hay refresh token: se omite sincronización.");
        }

        return saved;
    }

    // =======================================================
    // ✅ OBTENER EVENTOS
    // =======================================================
    // =======================================================
// ✅ OBTENER EVENTOS (SIN FILTRAR LOS FINALIZADOS)
// =======================================================
    public List<Event> getFamilyEvents(Long familyId) {
        familyRepository.findById(familyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Familia no encontrada."));

        // ➤ Ahora devuelve TODOS, incluidos los finalizados
        return eventRepository.findByFamily_Id(familyId);
    }

    public List<Event> getMemberEvents(String dni) {
        FamilyMember member = memberRepository.findByIdUserDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Miembro no encontrado."));

        // ➤ Ahora devuelve TODOS, incluidos los finalizados
        return eventRepository.findByAssignedTo(member);
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

        // ✅ Sincronizar updates (usa createdBy por dentro del GoogleCalendarService)
        if (updated.getCreatedBy() != null
                && updated.getCreatedBy().isGoogleLinked()
                && updated.getCreatedBy().getGoogleRefreshToken() != null) {
            googleCalendarService.updateEvent(updated);
        } else {
            log.warn("⚠️ Evento sin creador con Google válido; se omite update en Calendar.");
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

        if (event.getFamily() != null) { // Familiar
            if (!"ADMIN".equalsIgnoreCase(currentUser.getRole()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden eliminar eventos familiares.");
        } else { // Personal
            if (event.getAssignedTo() == null ||
                    !event.getAssignedTo().getUser().getDni().equals(currentUser.getDni()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes eliminar este evento personal.");
        }

        // ✅ Primero intentar borrar en Google si corresponde
        if (event.getCreatedBy() != null
                && event.getCreatedBy().isGoogleLinked()
                && event.getCreatedBy().getGoogleRefreshToken() != null) {
            googleCalendarService.deleteEvent(event);
        } else {
            log.warn("⚠️ Evento sin creador con Google válido; se omite delete en Calendar.");
        }

        // Luego borrar en BD
        eventRepository.delete(event);
    }
}
