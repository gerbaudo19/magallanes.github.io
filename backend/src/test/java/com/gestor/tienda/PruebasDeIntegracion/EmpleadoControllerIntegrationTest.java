package com.gestor.tienda.PruebasDeIntegracion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestor.tienda.Auth.AuthResponse;
import com.gestor.tienda.Auth.LoginRequest;
import com.gestor.tienda.Dto.EmpleadoDto;

@SpringBootTest
@AutoConfigureMockMvc
public class EmpleadoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    public void setup() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "admin123");
        String loginResponse = mockMvc.perform(MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Aquí intentamos parsear la respuesta como JSON, y si falla, asumimos que es el token directamente
        try {
            jwtToken = objectMapper.readValue(loginResponse, AuthResponse.class).getToken();
        } catch (Exception e) {
            jwtToken = loginResponse.trim(); // Asumimos que es el token directamente
        }
    }

    @Test
    public void testCreateEmpleadoSuccess() throws Exception {
        EmpleadoDto empleadoDto = new EmpleadoDto();
        empleadoDto.setNombre("santiago");
        empleadoDto.setApellido("gerbaudo");
        empleadoDto.setDni("42882420");
        empleadoDto.setTelefono("3537662019");
        empleadoDto.setEmail("santigerbaudo02@example.com");
        empleadoDto.setDomicilio("calle 12 numero 563");
        empleadoDto.setUsername("santiago");
        empleadoDto.setPassword("123");
        empleadoDto.setRole("EMPLEADO");

        mockMvc.perform(MockMvcRequestBuilders.post("/empleado/create")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(empleadoDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andExpect(MockMvcResultMatchers.content().string("Empleado guardado exitosamente."));
    }

    @Test
    public void testGetEmpleadoByIdNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/empleado/detail/999")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testUpdateEmpleadoSuccess() throws Exception {
        EmpleadoDto empleadoDto = new EmpleadoDto();
        empleadoDto.setNombre("John");
        empleadoDto.setApellido("Doe Updated");
        empleadoDto.setDni("12345678");
        empleadoDto.setTelefono("555-1234");
        empleadoDto.setEmail("john.doe@example.com");
        empleadoDto.setDomicilio("123 Main St");
        empleadoDto.setUsername("john.doe");
        empleadoDto.setPassword("password");
        empleadoDto.setRole("EMPLEADO");

        mockMvc.perform(MockMvcRequestBuilders.put("/empleado/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(empleadoDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Empleado actualizado exitosamente."));
    }

    @Test
    public void testDeleteEmpleadoSuccess() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/empleado/delete/3")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Empleado eliminado exitosamente."));
    }
}
