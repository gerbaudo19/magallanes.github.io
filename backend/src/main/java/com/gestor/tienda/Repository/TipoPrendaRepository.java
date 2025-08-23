package com.gestor.tienda.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.TipoPrenda;

public interface TipoPrendaRepository extends JpaRepository<TipoPrenda, Long> {
    List<TipoPrenda> findByNombreContainingIgnoreCase(String nombre);
}

