package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public FamilyService(FamilyRepository familyRepository, FamilyMemberRepository familyMemberRepository) {
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    @Transactional
    public Family createFamily(String name, User adminUser) {
        if (!"ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            throw new ResponseStatusException(FORBIDDEN, "Solo los administradores pueden crear familias.");
        }

        // Crear la familia
        Family family = new Family();
        family.setName(name);

        // Crear el miembro admin y agregarlo a la familia
        FamilyMember adminMember = FamilyMember.builder()
                .id(new FamilyMemberId())
                .user(adminUser)
                .role("ADMIN")
                .joinedAt(LocalDateTime.now())
                .build();

        family.addMember(adminMember); // agrega admin a la lista de miembros

        // Guardar la familia (cascade ALL guardará también al miembro admin)
        return familyRepository.save(family);
    }


    @Transactional(readOnly = true)
    public Family getFamilyById(Long familyId) {
        return familyRepository.findById(familyId)
                .orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Familia no encontrada"));
    }

}
