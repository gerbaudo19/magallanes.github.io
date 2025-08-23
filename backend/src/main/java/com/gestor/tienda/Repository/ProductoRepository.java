package com.gestor.tienda.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gestor.tienda.Dto.ProductoEstadisticasDto;
import com.gestor.tienda.Entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("SELECT new com.gestor.tienda.Dto.ProductoEstadisticasDto(p.id, p.nombre, SUM(d.cantidad)) " +
           "FROM DetalleOrden d " +
           "JOIN d.producto p " +
           "GROUP BY p.id, p.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<ProductoEstadisticasDto> findProductosMasVendidos();

    // Filtros simples por nombre, marca y color
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByMarcaIgnoreCase(String marca);
    List<Producto> findByColorIgnoreCase(String color);
}
