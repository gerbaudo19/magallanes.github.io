package com.gestor.tienda.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestor.tienda.Dto.FormaPagoEstadisticaDto;
import com.gestor.tienda.Entity.Orden;
import com.gestor.tienda.Repository.OrdenRepository;

@Service
@Transactional
public class OrdenService {

    @Autowired
    private OrdenRepository ordenRepository;

    public List<Orden> getAllOrdenes() {
        return ordenRepository.findAll();
    }

    public Optional<Orden> getOrdenById(int id) {
        return ordenRepository.findById(id);
    }

    public Orden saveOrden(Orden orden) {
        return ordenRepository.save(orden);
    }

    public void deleteOrden(int id) {
        ordenRepository.deleteById(id);
    }

    public boolean existsById(int id) {
        return ordenRepository.existsById(id);
    }

    public BigDecimal calcularGananciaTotalPorFecha(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Orden> ordenes = ordenRepository.findByFechaBetween(fechaInicio, fechaFin);
        return ordenes.stream()
                      .map(Orden::getPrecioTotal)
                      .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Nuevos métodos para filtros
    public List<Orden> getOrdenesByClienteId(Integer clienteId) {
        return ordenRepository.findByClienteId(clienteId);
    }

    public List<Orden> getOrdenesByEmpleadoId(Integer empleadoId) {
        return ordenRepository.findByEmpleadoId(empleadoId);
    }

    public List<Orden> getOrdenesByFechaRange(LocalDate inicio, LocalDate fin) {
        return ordenRepository.findByFechaBetween(inicio, fin);
    }

    public List<Orden> getOrdenesByPrecioTotalRange(BigDecimal min, BigDecimal max) {
        return ordenRepository.findByPrecioTotalBetween(min, max);
    }

    public List<FormaPagoEstadisticaDto> obtenerEstadisticaPorFormaPago() {
    List<Object[]> resultados = ordenRepository.countOrdenesPorFormaPago();
    List<FormaPagoEstadisticaDto> estadisticas = new ArrayList<>();

    for (Object[] row : resultados) {
        String formaPago = (String) row[0];
        Long cantidad = (Long) row[1];
        estadisticas.add(new FormaPagoEstadisticaDto(formaPago, cantidad));
    }

    return estadisticas;
}

}
