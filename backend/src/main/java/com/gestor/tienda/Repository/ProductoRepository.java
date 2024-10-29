package com.gestor.tienda.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestor.tienda.Entity.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
}

