package com.gestor.tienda.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.gestor.tienda.Entity.DetalleOrden;
import com.gestor.tienda.Entity.Orden;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Repository.DetalleOrdenRepository;

public class DetalleOrdenServiceTest {

    @Mock
    private DetalleOrdenRepository detalleOrdenRepository;

    @InjectMocks
    private DetalleOrdenService detalleOrdenService;

    private DetalleOrden detalleOrden;
    private Orden orden;
    private Producto producto;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        producto = new Producto();
        producto.setId(1);
        producto.setPrecio(BigDecimal.valueOf(100));

        orden = new Orden();
        orden.setId(1);

        // Nuevo constructor con talle
        detalleOrden = new DetalleOrden(orden, producto, 2, "XL");
    }

    @Test
    public void testGetAllDetallesOrden() {
        List<DetalleOrden> detalles = Arrays.asList(detalleOrden);
        when(detalleOrdenRepository.findAll()).thenReturn(detalles);

        List<DetalleOrden> result = detalleOrdenService.getAllDetallesOrden();
        assertEquals(1, result.size());
        assertEquals(detalleOrden, result.get(0));
    }

    @Test
    public void testGetDetalleOrdenById() {
        when(detalleOrdenRepository.findById(detalleOrden.getId())).thenReturn(Optional.of(detalleOrden));

        Optional<DetalleOrden> result = detalleOrdenService.getDetalleOrdenById(detalleOrden.getId());
        assertEquals(true, result.isPresent());
        assertEquals(detalleOrden, result.get());
    }

    @Test
    public void testSaveDetalleOrden() {
        when(detalleOrdenRepository.save(any(DetalleOrden.class))).thenReturn(detalleOrden);

        DetalleOrden result = detalleOrdenService.saveDetalleOrden(detalleOrden);
        assertEquals(detalleOrden, result);
    }

    @Test
    public void testDeleteDetalleOrden() {
        doNothing().when(detalleOrdenRepository).deleteById(detalleOrden.getId());

        detalleOrdenService.deleteDetalleOrden(detalleOrden.getId());
        verify(detalleOrdenRepository, times(1)).deleteById(detalleOrden.getId());
    }
}
