package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, FamilyMemberId> {

    boolean existsById_UserDniAndId_FamilyId(String userDni, Long familyId);

    Optional<FamilyMember> findById_UserDni(String userDni);
}
