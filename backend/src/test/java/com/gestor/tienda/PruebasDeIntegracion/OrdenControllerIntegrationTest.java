package com.gestor.tienda.PruebasDeIntegracion;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestor.tienda.Auth.LoginRequest;
import com.gestor.tienda.Dto.DetalleOrdenDto;
import com.gestor.tienda.Dto.OrdenDto;

@SpringBootTest
@AutoConfigureMockMvc
public class OrdenControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String jwtToken;

    @BeforeEach
    public void setup() throws Exception {
        LoginRequest loginRequest = new LoginRequest("user1", "user123");
        String loginResponse = mockMvc.perform(MockMvcRequestBuilders.post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        jwtToken = loginResponse.replace("Bearer ", "").trim(); // Ajuste para extraer el token de la respuesta
    }

    @Test
    public void testCreateOrdenSuccess() throws Exception {
        OrdenDto ordenDto = new OrdenDto();
        ordenDto.setFecha(LocalDate.now());
        ordenDto.setHora(LocalTime.now());
        ordenDto.setClienteId(2);
        ordenDto.setFormaPagoId(1);
        ordenDto.setEmpleadoId(2);

        DetalleOrdenDto detalleDto = new DetalleOrdenDto();
        detalleDto.setProductoId(1);
        detalleDto.setCantidad(3);
        ordenDto.setDetallesOrden(Collections.singletonList(detalleDto));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/ordenes")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(ordenDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andDo(result -> {
                    if (result.getResponse().getStatus() != HttpStatus.CREATED.value()) {
                        System.out.println("Error: " + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    public void testGetOrdenByIdNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/ordenes/999")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testUpdateOrdenSuccess() throws Exception {
        OrdenDto ordenDto = new OrdenDto();
        ordenDto.setFecha(LocalDate.now());
        ordenDto.setHora(LocalTime.now());
        ordenDto.setClienteId(2);
        ordenDto.setFormaPagoId(3);
        ordenDto.setEmpleadoId(2);

        DetalleOrdenDto detalleDto = new DetalleOrdenDto();
        detalleDto.setProductoId(1);
        detalleDto.setCantidad(3);
        ordenDto.setDetallesOrden(Collections.singletonList(detalleDto));

        mockMvc.perform(MockMvcRequestBuilders.put("/api/ordenes/20")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(ordenDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.detallesOrden.cantidad").value(5));
    }

    @Test
    public void testDeleteOrdenSuccess() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/ordenes/3")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());
    }
}
