package com.team10.famtask.service.home;

import com.team10.famtask.dto.FamilyMemberDTO;
import com.team10.famtask.dto.HomePageResponseDTO;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.event.repository.EventRepository;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.UserRepository;
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
    private final FamilyMemberRepository familyMemberRepository;
    private final EventRepository eventRepository;

    public HomePageResponseDTO getHomePageData(String email) {
        // 🔹 Buscar usuario
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 🔹 Buscar la membresía del usuario en alguna familia
        FamilyMember membership = familyMemberRepository.findById_UserDni(user.getDni())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not part of any family"));

        Family family = membership.getFamily();

        // 🔹 Miembros
        List<FamilyMemberDTO> members = family.getMembers() != null
                ? family.getMembers().stream()
                .map(member -> new FamilyMemberDTO(
                        member.getUser().getDni(),
                        member.getUser().getName(),
                        member.getUser().getEmail(),
                        member.getRole()
                ))
                .toList()
                : Collections.emptyList();

        // 🔹 Eventos
        List<Event> upcomingEvents = eventRepository
                .findByFamily(family);

        return new HomePageResponseDTO(family.getName(), members, upcomingEvents);
    }
}
