package com.gestor.tienda.PruebasDeIntegracion;

import java.math.BigDecimal;

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
import com.gestor.tienda.Dto.ProductoDto;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductoControllerIntegrationTest {

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

        // Crear productos necesarios para las pruebas
        createProducto(2, "Camisa", new BigDecimal("49.99"), "M", "Azul", "MarcaX", 1L);
        createProducto(3, "Pantalón", new BigDecimal("69.99"), "L", "Negro", "MarcaY", 1L);
    }

    private void createProducto(int id, String nombre, BigDecimal precio, String talle, String color, String marca, Long tipoPrendaId) throws Exception {
        ProductoDto productoDto = new ProductoDto();
        productoDto.setId(id);
        productoDto.setNombre(nombre);
        productoDto.setPrecio(precio);
        productoDto.setTalle(talle);
        productoDto.setColor(color);
        productoDto.setMarca(marca);
        productoDto.setTipoPrendaId(tipoPrendaId);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/productos/create")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(productoDto)))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testCreateProductoSuccess() throws Exception {
        ProductoDto productoDto = new ProductoDto();
        productoDto.setNombre("Camisa");
        productoDto.setPrecio(new BigDecimal("49.99"));
        productoDto.setTalle("M");
        productoDto.setColor("Azul");
        productoDto.setMarca("MarcaX");
        productoDto.setTipoPrendaId(1L); 

        mockMvc.perform(MockMvcRequestBuilders.post("/api/productos/create")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(productoDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testGetProductoByIdNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/productos/999")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testUpdateProductoSuccess() throws Exception {
        ProductoDto productoDto = new ProductoDto();
        productoDto.setNombre("Camisa Actualizada");
        productoDto.setPrecio(new BigDecimal("59.99"));
        productoDto.setTalle("L");
        productoDto.setColor("Rojo");
        productoDto.setMarca("MarcaY");
        productoDto.setTipoPrendaId(1L); 

        mockMvc.perform(MockMvcRequestBuilders.put("/api/productos/8")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken)
                .content(objectMapper.writeValueAsString(productoDto)))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testDeleteProductoSuccess() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/productos/")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string("Producto eliminado exitosamente."));
    }
}
