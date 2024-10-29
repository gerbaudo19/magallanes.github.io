package com.gestor.tienda.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.Orden;

public interface OrdenRepository extends JpaRepository<Orden, Integer> {
}
