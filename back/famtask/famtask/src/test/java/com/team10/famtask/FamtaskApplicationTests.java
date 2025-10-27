package com.team10.famtask;

import com.team10.famtask.config.TestSecurityConfig;
import com.team10.famtask.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class FamtaskApplicationTests {

    @MockBean
    private JwtService jwtService;

    @Test
    void contextLoads() {
        // El test pasa si el contexto de la aplicación carga correctamente
    }
}
