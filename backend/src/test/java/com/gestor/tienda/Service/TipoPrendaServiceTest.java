package com.gestor.tienda.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import com.gestor.tienda.Entity.TipoPrenda;
import com.gestor.tienda.Repository.TipoPrendaRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

public class TipoPrendaServiceTest {

    @Mock
    private TipoPrendaRepository tipoPrendaRepository;

    @InjectMocks
    private TipoPrendaService tipoPrendaService;

    private TipoPrenda tipoPrenda1;
    private TipoPrenda tipoPrenda2;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        tipoPrenda1 = new TipoPrenda();
        tipoPrenda1.setId(1L);
        tipoPrenda1.setNombre("Camisa");
        tipoPrenda1.setDescripcion("Camisa de algodón");

        tipoPrenda2 = new TipoPrenda();
        tipoPrenda2.setId(2L);
        tipoPrenda2.setNombre("Pantalón");
        tipoPrenda2.setDescripcion("Pantalón de mezclilla");
    }

    @Test
    public void testGetAllTipoPrendas() {
        when(tipoPrendaRepository.findAll()).thenReturn(Arrays.asList(tipoPrenda1, tipoPrenda2));

        List<TipoPrenda> tipoPrendas = tipoPrendaService.getAllTipoPrendas();

        assertNotNull(tipoPrendas);
        assertEquals(2, tipoPrendas.size());
        assertEquals(tipoPrenda1.getNombre(), tipoPrendas.get(0).getNombre());
        assertEquals(tipoPrenda2.getNombre(), tipoPrendas.get(1).getNombre());
    }

    @Test
    public void testGetTipoPrendaById() {
        when(tipoPrendaRepository.findById(1L)).thenReturn(Optional.of(tipoPrenda1));

        Optional<TipoPrenda> tipoPrenda = tipoPrendaService.getTipoPrendaById(1L);

        assertTrue(tipoPrenda.isPresent());
        assertEquals(tipoPrenda1.getNombre(), tipoPrenda.get().getNombre());
    }

    @Test
    public void testExistsById() {
        when(tipoPrendaRepository.existsById(1L)).thenReturn(true);

        boolean exists = tipoPrendaService.existsById(1L);

        assertTrue(exists);
    }

    @Test
    public void testSaveTipoPrenda() {
        when(tipoPrendaRepository.save(any(TipoPrenda.class))).thenReturn(tipoPrenda1);

        TipoPrenda savedTipoPrenda = tipoPrendaService.saveTipoPrenda(tipoPrenda1);

        assertNotNull(savedTipoPrenda);
        assertEquals(tipoPrenda1.getNombre(), savedTipoPrenda.getNombre());
    }

    @Test
    public void testDeleteTipoPrenda() {
        tipoPrendaService.deleteTipoPrenda(1L);

        verify(tipoPrendaRepository).deleteById(1L);
    }
}
