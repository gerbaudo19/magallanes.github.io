package com.gestor.tienda.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.MovimientoStock;

public interface MovimientoStockRepository extends JpaRepository<MovimientoStock, Long> {
}