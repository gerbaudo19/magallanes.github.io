package com.gestor.tienda.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.gestor.tienda.Entity.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Integer> {

    List<Orden> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    // Filtrar por cliente
    List<Orden> findByClienteId(Integer clienteId);

    // Filtrar por empleado
    List<Orden> findByEmpleadoId(Integer empleadoId);

    // Filtrar por rango de precio total
    List<Orden> findByPrecioTotalBetween(BigDecimal min, BigDecimal max);

    @Query("SELECT o.formaPago.nombre, COUNT(o) FROM Orden o GROUP BY o.formaPago.nombre")
    List<Object[]> countOrdenesPorFormaPago();
}
