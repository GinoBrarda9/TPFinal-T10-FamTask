package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, FamilyMemberId> {

    Optional<FamilyMember> findByIdUserDni(String dni);

    boolean existsByIdUserDniAndIdFamilyId(String userDni, Long familyId);

}
