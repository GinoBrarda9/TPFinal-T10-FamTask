package com.team10.famtask.event.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.event.dto.EventDTO;
import com.team10.famtask.event.mapper.EventMapper;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.service.EventService;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ✅ Controlador de eventos (familiares o personales)
 * Solo los administradores pueden crear/editar/eliminar eventos familiares.
 * Solo el usuario dueño puede hacerlo con eventos personales.
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final SecurityService securityService;

    // ============================
    // ✅ Crear evento
    // ============================
    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO dto) {
        Event created = eventService.createEvent(dto);
        return ResponseEntity.ok(EventMapper.toDTO(created));
    }

    // ============================
    // ✅ Obtener eventos familiares
    // ============================
    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<EventDTO>> getFamilyEvents(@PathVariable Long familyId) {
        List<EventDTO> events = eventService.getFamilyEvents(familyId)
                .stream().map(EventMapper::toDTO).toList();
        return ResponseEntity.ok(events);
    }

    // ============================
    // ✅ Obtener eventos personales
    // ============================
    @GetMapping("/member/{dni}")
    public ResponseEntity<List<EventDTO>> getMemberEvents(@PathVariable String dni) {
        List<EventDTO> events = eventService.getMemberEvents(dni)
                .stream().map(EventMapper::toDTO).toList();
        return ResponseEntity.ok(events);
    }
    // ============================
// ✅ Obtener evento por ID
// ============================
    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(EventMapper.toDTO(event));
    }

    // ============================
// ✅ PATCH (actualizar parcialmente)
// ============================
    @PatchMapping("/{id}")
    public ResponseEntity<EventDTO> patchEvent(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User currentUser = securityService.getCurrentUser();
        Event updated = eventService.patchEvent(id, updates, currentUser);
        return ResponseEntity.ok(EventMapper.toDTO(updated));
    }


    // ============================
    // ✅ Eliminar evento
    // ============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        User currentUser = securityService.getCurrentUser();
        eventService.deleteEvent(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
