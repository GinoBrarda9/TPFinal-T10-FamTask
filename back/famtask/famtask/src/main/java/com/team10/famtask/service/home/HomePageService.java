package com.team10.famtask.service.home;

import com.team10.famtask.dto.FamilyMemberDTO;
import com.team10.famtask.dto.HomePageResponseDTO;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.repository.EventRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.repository.family.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomePageService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final EventRepository eventRepository;

    public HomePageResponseDTO getHomePageData(String dni) {

        // ✅ 1) verificar usuario existe
        userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // ✅ 2) obtener familia + miembros vía FETCH JOIN
        Family family = familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User has no family"));

        // ✅ 3) mapear miembros
        List<FamilyMemberDTO> members = family.getMembers().stream()
                .map(m -> new FamilyMemberDTO(
                        m.getUser().getDni(),
                        m.getUser().getName(),
                        m.getUser().getEmail(),
                        m.getRole()
                ))
                .toList();

        // ✅ 4) obtener eventos futuros (filtrados sin crear método especial)
        LocalDateTime now = LocalDateTime.now();
        List<Event> upcomingEvents = eventRepository.findByFamily(family).stream()
                .filter(e -> e.getStartTime() != null && e.getStartTime().isAfter(now))
                .sorted((e1, e2) -> e1.getStartTime().compareTo(e2.getStartTime()))
                .toList();

        // ✅ 5) devolver EXACTA respuesta esperada por el front
        return new HomePageResponseDTO(
                family.getId(),
                family.getName(),
                members,
                upcomingEvents
        );
    }
}
