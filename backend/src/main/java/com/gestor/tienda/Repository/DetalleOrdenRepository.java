package com.gestor.tienda.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.DetalleOrden;

public interface DetalleOrdenRepository extends JpaRepository<DetalleOrden, Integer> {
    List<DetalleOrden> findByOrdenId(Integer ordenId);
}
