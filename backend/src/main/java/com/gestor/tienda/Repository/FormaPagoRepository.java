package com.gestor.tienda.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestor.tienda.Entity.FormaPago;

@Repository
public interface FormaPagoRepository extends JpaRepository<FormaPago, Integer> {
    boolean existsByNombre(String nombre);
}

