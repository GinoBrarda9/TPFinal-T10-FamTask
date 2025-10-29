package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    boolean existsByFamilyIdAndInvitedUserDniAndStatusIn(
            Long familyId, String invitedUserDni, List<String> statuses);

    // Si la tenés y la usás en otro lado, dejala:
    // List<Invitation> findByInvitedUserAndStatus(User invitedUser, String status);

    @Query("""
      select i
      from Invitation i
        join fetch i.family f
        join fetch i.invitedUser iu
      where iu = :user and i.status = :status
    """)
    List<Invitation> findPendingWithJoins(
            @Param("user") User invitedUser,
            @Param("status") String status
    );
}
