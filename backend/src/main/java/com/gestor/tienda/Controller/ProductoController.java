package com.gestor.tienda.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Dto.ProductoDto;
import com.gestor.tienda.Dto.ProductoEstadisticasDto;
import com.gestor.tienda.Dto.StockInsuficienteDto;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Entity.TipoPrenda;
import com.gestor.tienda.Service.MovimientoStockService;
import com.gestor.tienda.Service.ProductoService;
import com.gestor.tienda.Service.TipoPrendaService;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin("*")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private TipoPrendaService tipoPrendaService;

    @Autowired
    private MovimientoStockService movimientoStockService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody ProductoDto productoDto) {
        if (productoDto.getNombre().isBlank() ||
            productoDto.getPrecio() == null ||
            productoDto.getColor().isBlank() ||
            productoDto.getMarca().isBlank() ||
            productoDto.getTipoPrendaId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Optional<TipoPrenda> tipoPrendaOpt = tipoPrendaService.getTipoPrendaById(productoDto.getTipoPrendaId());
        if (!tipoPrendaOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        TipoPrenda tipoPrenda = tipoPrendaOpt.get();

        Producto productoNuevo = new Producto(
            productoDto.getNombre(),
            productoDto.getPrecio(),
            productoDto.getColor(),
            productoDto.getMarca(),
            tipoPrenda
        );

        // Agregar stock por talle si se proporciona
        if (productoDto.getStockPorTalle() != null) {
            for (Map.Entry<String, Integer> entry : productoDto.getStockPorTalle().entrySet()) {
                productoNuevo.agregarStock(entry.getKey(), entry.getValue());
            }
        }

        productoService.saveProducto(productoNuevo);

        // Registrar movimientos de stock si se proporciona
        if (productoDto.getStockPorTalle() != null) {
            for (Map.Entry<String, Integer> entry : productoDto.getStockPorTalle().entrySet()) {
                movimientoStockService.registrarMovimiento("ENTRADA", entry.getKey(), entry.getValue(), productoNuevo);
            }
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable long id) {
        Optional<Producto> producto = productoService.getProductoById(id);
        return producto.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        List<Producto> productos = productoService.getAllProductos();
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProducto(@PathVariable long id) {
        if (productoService.getProductoById(id).isPresent()) {
            productoService.deleteProducto(id);
            return new ResponseEntity<>("Producto eliminado exitosamente.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Error al eliminar el producto.", HttpStatus.OK);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProducto(@PathVariable long id, @RequestBody ProductoDto productoDto) {
    Optional<Producto> productoOptional = productoService.getProductoById(id);
    if (productoOptional.isEmpty()) {
        return new ResponseEntity<>("Producto no encontrado.", HttpStatus.NOT_FOUND);
    }

    if (productoDto.getNombre().isBlank() ||
        productoDto.getPrecio() == null ||
        productoDto.getColor().isBlank() ||
        productoDto.getMarca().isBlank() ||
        productoDto.getTipoPrendaId() == null) {
        return new ResponseEntity<>("Datos inválidos.", HttpStatus.BAD_REQUEST);
    }

    Optional<TipoPrenda> tipoPrendaOpt = tipoPrendaService.getTipoPrendaById(productoDto.getTipoPrendaId());
    if (!tipoPrendaOpt.isPresent()) {
        return new ResponseEntity<>("Tipo de prenda no encontrado.", HttpStatus.BAD_REQUEST);
    }

    Producto productoExistente = productoOptional.get();
    productoExistente.setNombre(productoDto.getNombre());
    productoExistente.setPrecio(productoDto.getPrecio());
    productoExistente.setColor(productoDto.getColor());
    productoExistente.setMarca(productoDto.getMarca());
    productoExistente.setTipoPrenda(tipoPrendaOpt.get());

    // Actualizar stock por talle
    // Primero, eliminar stock y movimientos existentes (según lógica de tu app)
    productoExistente.getStockPorTalle().clear(); // limpia stock actual

    // Agregar el nuevo stock por talle desde el DTO
    if (productoDto.getStockPorTalle() != null) {
        for (Map.Entry<String, Integer> entry : productoDto.getStockPorTalle().entrySet()) {
            productoExistente.agregarStock(entry.getKey(), entry.getValue());
        }
    }

    productoService.saveProducto(productoExistente);

    // Registrar movimientos de stock correspondientes
    if (productoDto.getStockPorTalle() != null) {
        for (Map.Entry<String, Integer> entry : productoDto.getStockPorTalle().entrySet()) {
            movimientoStockService.registrarMovimiento("ENTRADA", entry.getKey(), entry.getValue(), productoExistente);
        }
    }

    return new ResponseEntity<>("Producto actualizado exitosamente.", HttpStatus.OK);
    }


    @GetMapping("/mas-vendidos")
    public List<ProductoEstadisticasDto> obtenerProductosMasVendidos() {
        return productoService.obtenerProductosMasVendidos();
    }

    // Buscar producto por nombre (puede devolver varios)
    @GetMapping("/listByNombre/{nombre}")
    public ResponseEntity<List<Producto>> findByNombre(@PathVariable String nombre) {
        try {
            List<Producto> productos = productoService.findByNombre(nombre);
            return new ResponseEntity<>(productos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Buscar producto por marca
    @GetMapping("/listByMarca/{marca}")
    public ResponseEntity<List<Producto>> findByMarca(@PathVariable String marca) {
        try {
            List<Producto> productos = productoService.findByMarca(marca);
            return new ResponseEntity<>(productos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Buscar producto por color
    @GetMapping("/listByColor/{color}")
    public ResponseEntity<List<Producto>> findByColor(@PathVariable String color) {
        try {
            List<Producto> productos = productoService.findByColor(color);
            return new ResponseEntity<>(productos, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Buscar producto por ID (ya lo tenés, solo para referencia)
    @GetMapping("/listById/{id}")
    public ResponseEntity<Optional<Producto>> findById(@PathVariable long id) {
        try {
            Optional<Producto> producto = productoService.getProductoById(id);
            return new ResponseEntity<>(producto, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Reporte Stock Induficiente
    @GetMapping("/stock/insuficiente")
    public ResponseEntity<List<StockInsuficienteDto>> getStockInsuficiente() {
        List<StockInsuficienteDto> reporte = productoService.obtenerStockInsuficiente();
        return new ResponseEntity<>(reporte, HttpStatus.OK);
    }

}