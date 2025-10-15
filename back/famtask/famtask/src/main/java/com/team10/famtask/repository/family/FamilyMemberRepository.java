package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, FamilyMemberId> {
        boolean existsById_UserDniAndId_FamilyId(String userDni, Long familyId);
}
