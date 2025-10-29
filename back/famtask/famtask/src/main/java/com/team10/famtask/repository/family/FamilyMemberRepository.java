package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, FamilyMemberId> {

    boolean existsById_UserDniAndId_FamilyId(String userDni, Long familyId);
    @Query("""
  select f
  from Family f
    join fetch f.members fm
    join fetch fm.user u
  where u.dni = :dni
""")
    Optional<Family> findByMemberFetchAll(String dni);



}
