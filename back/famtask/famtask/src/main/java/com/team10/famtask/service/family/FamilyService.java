package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public FamilyService(FamilyRepository familyRepository,
                         FamilyMemberRepository familyMemberRepository) {
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    @Transactional
    public Family createFamily(String name, User creator) {
        // Verificar que el usuario sea ADMIN global
        if (creator == null || !"ADMIN".equalsIgnoreCase(creator.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los administradores pueden crear familias");
        }

        // Crear la familia
        Family family = new Family();
        family.setName(name);
        family = familyRepository.save(family);

        // Asociar al creador como ADMIN de la familia
        FamilyMember member = FamilyMember.builder()
                .id(new FamilyMemberId(creator.getDni(), family.getId()))
                .user(creator)
                .family(family)
                .role("ADMIN")
                .joinedAt(LocalDateTime.now())
                .build();

        familyMemberRepository.save(member);

        return family;
    }

    public Family getFamilyById(Long id) {
        return familyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Family not found"));
    }

}
