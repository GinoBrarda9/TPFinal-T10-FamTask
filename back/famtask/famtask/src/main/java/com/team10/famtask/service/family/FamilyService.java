package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.repository.family.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public FamilyService(FamilyRepository familyRepository, FamilyMemberRepository familyMemberRepository, UserRepository userRepository) {
        this.familyRepository = familyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.userRepository= userRepository;
    }

    @Transactional
    public Family createFamily(String name, User adminUser) {
        if (!"ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            throw new ResponseStatusException(FORBIDDEN, "Solo los administradores pueden crear familias.");
        }

        // 🔹 Reatachar el usuario para que JPA sepa que ya existe
        adminUser = userRepository.findById(adminUser.getDni())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Crear la familia
        Family family = new Family();
        family.setName(name);

        // Crear el miembro admin y agregarlo a la familia
        FamilyMember adminMember = FamilyMember.builder()
                .user(adminUser)
                .role("ADMIN")
                .joinedAt(LocalDateTime.now())
                .build();

        family.addMember(adminMember); // agrega admin a la lista de miembros

        // Guardar la familia
        return familyRepository.save(family);
    }



    @Transactional(readOnly = true)
    public Family findByMember(User user) {
        // trae familia + members + user de cada member en una sola query
        return familyMemberRepository.findByMemberFetchAll(user.getDni()).orElse(null);
    }


}
