package com.gestor.tienda.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gestor.tienda.Entity.Cliente;
import com.gestor.tienda.Repository.ClienteRepository;

@ExtendWith(MockitoExtension.class)
public class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    
    // Método que se ejecuta antes de cada prueba para inicializar el cliente.
    @BeforeEach
    public void setUp() {
        cliente = new Cliente("Juan", "Perez", "12345678", "123456789", "juan.perez@example.com", "Calle Falsa 123");
    }
    
    // Prueba unitaria para el método findAll de ClienteService.
    @Test
    public void testFindAll() {
        List<Cliente> clientes = Arrays.asList(cliente);
        when(clienteRepository.findAll()).thenReturn(clientes);

        List<Cliente> result = clienteService.findAll();

        assertEquals(1, result.size());
        verify(clienteRepository, times(1)).findAll();
    }

    // Prueba unitaria para el método save de ClienteService.
    @Test
    public void testSave() {
        clienteService.save(cliente);
        verify(clienteRepository, times(1)).save(cliente);
    }

    // rueba unitaria para el método deleteById de ClienteService.
    @Test
    public void testDeleteById() {
        int id = 1;
        clienteService.deleteById(id);
        verify(clienteRepository, times(1)).deleteById(id);
    }

    // Prueba unitaria para el método findById de ClienteService.
    @Test
    public void testFindById() {
        int id = 1;
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));

        Optional<Cliente> result = clienteService.findById(id);

        assertTrue(result.isPresent());
        assertEquals(cliente, result.get());
        verify(clienteRepository, times(1)).findById(id);
    }

    // Prueba unitaria para el método findByDni de ClienteService.
    @Test
    public void testFindByDni() {
        String dni = "12345678";
        when(clienteRepository.findByDni(dni)).thenReturn(Optional.of(cliente));

        Optional<Cliente> result = clienteService.findByDni(dni);

        assertTrue(result.isPresent());
        assertEquals(cliente, result.get());
        verify(clienteRepository, times(1)).findByDni(dni);
    }

    // Prueba unitaria para el método findByNombre de ClienteService.
    @Test
    public void testFindByNombre() {
        String nombre = "Juan";
        List<Cliente> clientes = Arrays.asList(cliente);
        when(clienteRepository.findByNombre(nombre)).thenReturn(clientes);

        List<Cliente> result = clienteService.findByNombre(nombre);

        assertEquals(1, result.size());
        assertEquals(cliente, result.get(0));
        verify(clienteRepository, times(1)).findByNombre(nombre);
    }

    // Prueba unitaria para el método existsById de ClienteService.
    @Test
    public void testExistsById() {
        int id = 1;
        when(clienteRepository.existsById(id)).thenReturn(true);

        boolean result = clienteService.existsById(id);

        assertTrue(result);
        verify(clienteRepository, times(1)).existsById(id);
    }

    // Prueba unitaria para el método existsByDni de ClienteService.
    @Test
    public void testExistsByDni() {
        String dni = "12345678";
        when(clienteRepository.existsByDni(dni)).thenReturn(true);

        boolean result = clienteService.existsByDni(dni);

        assertTrue(result);
        verify(clienteRepository, times(1)).existsByDni(dni);
    }
}

