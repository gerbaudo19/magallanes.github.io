package com.gestor.tienda.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import com.gestor.tienda.Entity.DetalleOrden;
import com.gestor.tienda.Entity.Orden;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Repository.DetalleOrdenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

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
        detalleOrden = new DetalleOrden(orden, producto, 2);
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
