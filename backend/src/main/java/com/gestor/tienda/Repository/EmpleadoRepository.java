package com.gestor.tienda.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gestor.tienda.Entity.Empleado;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    Optional<Empleado> findByDni(String dni);
    Optional<Empleado> findById(int id);
    List<Empleado> findByNombre(String nombre);
    Boolean existsByDni(String dni);
    Optional<Empleado> findByUsername(String username);
}

