package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, FamilyMemberId> {

    Optional<FamilyMember> findByIdUserDni(String dni);

    boolean existsById_UserDniAndId_FamilyId(String userDni, Long familyId);

    List<FamilyMember> findById_FamilyId(Long familyId);

}
