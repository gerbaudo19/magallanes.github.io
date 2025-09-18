package com.gestor.tienda.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Dto.ProductoEstadisticasDto;
import com.gestor.tienda.Dto.StockInsuficienteDto;
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

    // Buscar productos por nombre (contenga el texto, sin importar mayúsculas/minúsculas)
    public List<Producto> findByNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // Buscar productos por marca (exacta o ignorando mayúsculas)
    public List<Producto> findByMarca(String marca) {
        return productoRepository.findByMarcaIgnoreCase(marca);
    }

    // Buscar productos por color (exacta o ignorando mayúsculas)
    public List<Producto> findByColor(String color) {
        return productoRepository.findByColorIgnoreCase(color);
    }
    
    // Reporte de stock insuficiente
    public List<StockInsuficienteDto> obtenerStockInsuficiente() {
    List<Producto> productos = productoRepository.findAll();
    List<StockInsuficienteDto> insuficientes = new ArrayList<>();

    for (Producto producto : productos) {
        for (Map.Entry<String, Integer> entry : producto.getStockPorTalle().entrySet()) {
            if (entry.getValue() <= 5) {
                insuficientes.add(
                    new StockInsuficienteDto(
                        producto.getId(),
                        producto.getNombre(),
                        producto.getMarca(),
                        producto.getColor(),
                        producto.getTipoPrenda() != null ? producto.getTipoPrenda().getNombre() : null,
                        entry.getKey(),  // talle
                        entry.getValue() // cantidad
                    )
                );
            }
        }
    }
    return insuficientes;
    }

}
