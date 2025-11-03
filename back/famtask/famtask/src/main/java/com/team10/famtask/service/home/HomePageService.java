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
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class HomePageService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final EventRepository eventRepository;

    public HomePageResponseDTO getHomePageData(String dni) {

        userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Family family = familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User has no family"));

        List<FamilyMemberDTO> members = family.getMembers().stream()
                .map(m -> new FamilyMemberDTO(
                        m.getUser().getDni(),
                        m.getUser().getName(),
                        m.getUser().getEmail(),
                        m.getRole()
                ))
                .toList();

        LocalDateTime now = LocalDateTime.now();
// eventos familiares
        List<Event> familyEvents = eventRepository.findByFamilyAndFinishedFalse(family);

// eventos personales asignados al usuario
        List<Event> personalEvents = eventRepository.findByAssignedTo_User_DniAndFinishedFalse(dni);

// merge + filtrar futuros + ordenar
        List<Event> upcomingEvents = Stream.concat(familyEvents.stream(), personalEvents.stream())
                .filter(e -> e.getStartTime() != null && e.getStartTime().isAfter(now))
                .sorted(Comparator.comparing(Event::getStartTime))
                .toList();


        return new HomePageResponseDTO(
                family.getId(),
                family.getName(),
                members,
                upcomingEvents
        );
    }
}
