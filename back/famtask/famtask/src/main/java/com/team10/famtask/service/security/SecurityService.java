package com.team10.famtask.service.security;

import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.repository.BoardRepository;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
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

    @Autowired
    private DataSource dataSource;

    // ========================== OWNER CHECK ==========================
    public boolean isOwner(String dni) {
        User current = getCurrentUser();
        return current != null && current.getDni().equals(dni);
    }

    // ========================== CURRENT USER ==========================
    public User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        String dni = (String) auth.getPrincipal();
        return userRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario no encontrado"));
    }

    // ========================== FAMILY MEMBERSHIP ==========================
    public boolean isMemberOfFamily(Long familyId, Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String dni = (String) authentication.getPrincipal();
        return familyMemberRepository.existsById_UserDniAndId_FamilyId(dni, familyId);
    }

    // ========================== BOARD ACCESS ==========================
    public boolean isMemberOfBoard(Long boardId, Authentication authentication) {

        String dni = (String) authentication.getPrincipal();
        System.out.println("✅ Checking board access. Board: " + boardId + " | dni: " + dni);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        Long familyId = board.getFamily().getId();
        boolean exists = familyMemberRepository.existsById_UserDniAndId_FamilyId(dni, familyId);

        System.out.println("➡ belongs? " + exists);
        return exists;
    }

    // ========================== COLUMN ACCESS ==========================
    public boolean isColumnAccessible(Long columnId) {
        System.out.println("---- COLUMN ACCESS CHECK ----");
        System.out.println("columnId = " + columnId);

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            System.out.println("❌ No authentication in context");
            return false;
        }

        System.out.println("auth.getPrincipal() = " + auth.getPrincipal());

        Optional<Long> familyIdOpt = columnRepository.findFamilyIdByColumnId(columnId);
        System.out.println("familyId from column = " + familyIdOpt.orElse(null));

        if (familyIdOpt.isEmpty()) {
            System.out.println("❌ Column not linked to any board/family");
            return false;
        }

        String dni = (String) auth.getPrincipal();

        boolean belongs = familyMemberRepository
                .existsById_UserDniAndId_FamilyId(dni, familyIdOpt.get());

        System.out.println("➡ belongs? " + belongs);
        return belongs;
    }

    // ========================== CARD ACCESS ==========================
    public boolean isCardAccessible(Long cardId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() ||
                auth.getPrincipal() == null ||
                "anonymousUser".equals(auth.getPrincipal())) {
            System.out.println("❌ No authentication in context");
            return false;
        }

        String dni;
        Object principal = auth.getPrincipal();

        if (principal instanceof String p) {
            dni = p;
        } else {
            dni = auth.getName();
        }

        System.out.println("🔍 Validando acceso a Card " + cardId + " | Usuario: " + dni);

        Long familyId = cardRepository.findFamilyIdByCardId(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        boolean belongs = familyMemberRepository.existsById_UserDniAndId_FamilyId(dni, familyId);

        System.out.println("➡ Familia dueña de card: " + familyId);
        System.out.println("➡ Usuario pertenece? " + belongs);

        return belongs;
    }

    // ========================== ROLE ACCESS ==========================
    public String getCurrentRole() {
        String jwt = extractJwtFromRequest();
        if (jwt == null) return null;
        return jwtService.extractRole(jwt);
    }

    // ========================== JWT EXTRACTION ==========================
    private String extractJwtFromRequest() {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    // ========================== GET USER ==========================
    public User getUserByDni(String dni) {
        return userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostConstruct
    public void init() throws Exception {
        System.out.println(">>>> CONNECTED TO DB URL: " + dataSource.getConnection().getMetaData().getURL());
    }
}
