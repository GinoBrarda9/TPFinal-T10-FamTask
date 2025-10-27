package com.team10.famtask.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.UserService;
import com.team10.famtask.service.security.SecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final SecurityService securityService;

    public UserController(UserService userService, SecurityService securityService) {
        this.userService = userService;
        this.securityService = securityService;
    }

    // 🔹 Solo ADMIN puede ver todos los usuarios
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 🔹 ADMIN o el mismo usuario pueden ver sus datos
    @GetMapping("/{dni}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwner(#dni)")
    public ResponseEntity<User> getUserByDni(@PathVariable String dni) {
        return userService.getUserByDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Solo ADMIN puede crear un usuario (en general se hace vía register)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    // 🔹 ADMIN o el mismo usuario pueden actualizar datos
    @PutMapping("/{dni}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isOwner(#dni)")
    public ResponseEntity<User> updateUser(@PathVariable String dni, @RequestBody User updatedUser) {
        return userService.updateUser(dni, updatedUser)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Solo ADMIN puede borrar usuarios
    @DeleteMapping("/{dni}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String dni) {
        boolean deleted = userService.deleteUser(dni);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Usuario eliminado exitosamente."));
    }

}
