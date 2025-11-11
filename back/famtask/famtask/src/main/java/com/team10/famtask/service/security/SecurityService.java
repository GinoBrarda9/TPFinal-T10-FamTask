package com.team10.famtask.service.security;

import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.repository.BoardRepository;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final JwtService jwtService;
    private final HttpServletRequest request;
    private final BoardRepository boardRepository;
    private final ColumnRepository columnRepository;
    private final CardRepository cardRepository;

    /**
     * Verifica si el usuario autenticado es dueño del recurso (por DNI).
     */
    public boolean isOwner(String dni) {
        User current = getCurrentUser();
        return current != null && current.getDni().equals(dni);
    }

    /**
     * Obtiene el usuario autenticado a partir del token JWT.
     */
    public User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        String dni = (String) auth.getPrincipal(); // el JwtFilter setea el principal con el DNI
        return userRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario no encontrado"));
    }

    /**
     * Chequea si el usuario pertenece a alguna familia.
     */
    public boolean isMemberOfFamily(Long familyId, Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // DNI viene del principal según tu JwtFilter
        String dni = (String) authentication.getPrincipal();

        // ✅ Verifica si existe una relación FamilyMember con ese DNI y FamilyId
        return familyMemberRepository.existsByIdUserDniAndIdFamilyId(dni, familyId);
    }

    public boolean isMemberOfBoard(Long boardId, Authentication authentication) {

        String dni = (String) authentication.getPrincipal();

        System.out.println("✅ Checking board access. Board: "+boardId+" | dni: "+authentication.getPrincipal());

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        Long familyId = board.getFamily().getId();
        boolean exists = familyMemberRepository.existsByIdUserDniAndIdFamilyId(dni, board.getFamily().getId());
        System.out.println("➡ belongs? "+exists);
        return exists;

    }

    public boolean isColumnAccessible(Long columnId, Authentication authentication) {
        String dni = authentication.getName();

        return columnRepository.findFamilyIdByColumnId(columnId)
                .map(familyId -> familyMemberRepository.existsByIdUserDniAndIdFamilyId(dni, familyId))
                .orElse(false);
    }

    /**
     * Obtiene el rol actual del token.
     */
    public String getCurrentRole() {
        String jwt = extractJwtFromRequest();
        if (jwt == null) return null;
        return jwtService.extractRole(jwt);
    }
    public boolean isCardAccessible(Long cardId, Authentication auth) {
        String dni = auth.getName();
        System.out.println("🔍 Validando acceso a Card " + cardId + " | Usuario: " + dni);

        Long familyId = cardRepository.findFamilyIdByCardId(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        boolean belongs = familyMemberRepository.existsByIdUserDniAndIdFamilyId(dni, familyId);

        System.out.println("➡ Familia dueña de card: " + familyId);
        System.out.println("➡ Usuario pertenece? " + belongs);

        return belongs;
    }


    /**
     * Extrae el JWT desde el header Authorization.
     */
    private String extractJwtFromRequest() {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    /**
     * Busca un usuario por DNI, lanza error 404 si no existe.
     */
    public User getUserByDni(String dni) {
        return userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
