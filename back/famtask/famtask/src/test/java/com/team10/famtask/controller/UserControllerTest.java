package com.team10.famtask.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.UserService;
import com.team10.famtask.service.security.SecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @InjectMocks
    private UserController userController;

    @Mock
    private UserService userService;

    @Mock
    private SecurityService securityService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllUsers_success() {
        User user = new User();
        user.setDni("12345678");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        ResponseEntity<List<User>> response = userController.getAllUsers();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        assertEquals("12345678", response.getBody().get(0).getDni());
    }

    @Test
    void getUserByDni_found() {
        User user = new User();
        user.setDni("12345678");
        user.setEmail("ana@test.com");

        when(userService.getUserByDni("12345678")).thenReturn(Optional.of(user));
        when(securityService.isOwner("12345678")).thenReturn(true);

        ResponseEntity<User> response = userController.getUserByDni("12345678");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("12345678", response.getBody().getDni());
    }

    @Test
    void getUserByDni_notFound() {
        when(userService.getUserByDni("99999999")).thenReturn(Optional.empty());
        when(securityService.isOwner("99999999")).thenReturn(false);

        ResponseEntity<User> response = userController.getUserByDni("99999999");

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void createUser_success() {
        User user = new User();
        user.setDni("12345678");

        when(userService.createUser(user)).thenReturn(user);

        ResponseEntity<User> response = userController.createUser(user);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("12345678", response.getBody().getDni());
    }

    @Test
    void updateUser_success() {
        User updatedUser = new User();
        updatedUser.setName("Nuevo Nombre");

        User existingUser = new User();
        existingUser.setDni("12345678");
        existingUser.setName("Old Name");

        when(userService.updateUser("12345678", updatedUser)).thenReturn(Optional.of(updatedUser));
        when(securityService.isOwner("12345678")).thenReturn(true);

        ResponseEntity<User> response = userController.updateUser("12345678", updatedUser);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Nuevo Nombre", response.getBody().getName());
    }

    @Test
    void deleteUser_success() {
        when(userService.deleteUser("12345678")).thenReturn(true);

        ResponseEntity<Map<String, String>> response = userController.deleteUser("12345678");

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("Usuario eliminado exitosamente.", response.getBody().get("message"));
    }

    @Test
    void deleteUser_notFound() {
        when(userService.deleteUser("99999999")).thenReturn(false);

        ResponseEntity<Map<String, String>> response = userController.deleteUser("99999999");

        assertEquals(404, response.getStatusCodeValue());
    }

}
