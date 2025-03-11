package com.gestor.tienda.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Integer> {
    List<Orden> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);
}
