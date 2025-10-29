package com.team10.famtask.service.home;

import com.team10.famtask.dto.FamilyMemberDTO;
import com.team10.famtask.dto.HomePageResponseDTO;
import com.team10.famtask.entity.calendar.Event;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.calendar.EventRepository;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.repository.family.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomePageService {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final EventRepository eventRepository;


    public HomePageResponseDTO getHomePageData(String dni) {
        User user = userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Family family = familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User has no family"));

        List<FamilyMemberDTO> members = family.getMembers().stream()
                .map(m -> new FamilyMemberDTO(
                        m.getUser().getDni(),
                        m.getUser().getName(),
                        m.getUser().getEmail(),
                        m.getRole()))
                .toList();

        List<Event> upcoming = eventRepository
                .findByFamilyIdAndStartAfterOrderByStartAsc(family.getId(), LocalDateTime.now());

        return new HomePageResponseDTO(family.getId(),family.getName(), members, upcoming);
    }

}
