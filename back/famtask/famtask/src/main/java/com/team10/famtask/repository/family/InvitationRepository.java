package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    boolean existsByFamilyIdAndInvitedUserDniAndStatusIn(
            Long familyId, String invitedUserDni, List<String> statuses);

    List<Invitation> findByInvitedUserAndStatus(User invitedUser, String status);

    Optional<Invitation> findById(Long id);

    boolean existsByFamilyAndInvitedUser(Family family, User invitedUser);
}
