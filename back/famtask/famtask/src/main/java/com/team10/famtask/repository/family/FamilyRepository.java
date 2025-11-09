package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    @Query("""
  select distinct f
  from Family f
    join fetch f.members fm
    join fetch fm.user u
  where f.id = (
      select fm2.family.id
      from FamilyMember fm2
      where fm2.user.dni = :dni
  )
""")
    Optional<Family> findByMemberFetchAll(String dni);

}
