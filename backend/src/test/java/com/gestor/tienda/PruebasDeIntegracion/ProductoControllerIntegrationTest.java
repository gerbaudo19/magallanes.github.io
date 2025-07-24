package com.gestor.tienda.PruebasDeIntegracion;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestor.tienda.Dto.ProductoDto;
import com.gestor.tienda.Entity.TipoPrenda;
import com.gestor.tienda.Repository.TipoPrendaRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TipoPrendaRepository tipoPrendaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Long tipoPrendaId;

    @BeforeEach
    void setUp() {
        // Crea una prenda por defecto para usar en los tests
        TipoPrenda tipoPrenda = new TipoPrenda();
        tipoPrenda.setNombre("Remera");
        tipoPrendaId = tipoPrendaRepository.save(tipoPrenda).getId();
    }

    @Test
    void testCrearProductoSuccess() throws Exception {
        ProductoDto productoDto = new ProductoDto();
        productoDto.setNombre("Camisa Azul");
        productoDto.setPrecio(new BigDecimal("1499.99"));
        productoDto.setColor("Azul");
        productoDto.setMarca("Nike");
        productoDto.setTipoPrendaId(tipoPrendaId);

        Map<String, Integer> stock = new HashMap<>();
        stock.put("M", 10);
        stock.put("L", 5);
        productoDto.setStockPorTalle(stock);

        mockMvc.perform(post("/api/productos/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoDto)))
                .andExpect(status().isOk());
    }

    @Test
    void testGetProductoNotFound() throws Exception {
        mockMvc.perform(get("/api/productos/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetAllProductos() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk());
    }
}