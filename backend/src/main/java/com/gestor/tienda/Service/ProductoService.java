package com.gestor.tienda.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Dto.ProductoEstadisticasDto;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Repository.ProductoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    // Cambiar el tipo de id de int a Long
    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto saveProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public void deleteProducto(long id) {
        productoRepository.deleteById(id);
    }

    // Cambiar el tipo de id de int a Long
    public boolean existsById(long id) {
        return productoRepository.existsById(id);
    }

    public List<ProductoEstadisticasDto> obtenerProductosMasVendidos() {
        return productoRepository.findProductosMasVendidos();
    }
}
