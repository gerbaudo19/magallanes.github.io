package com.gestor.tienda.Controller;

import java.math.BigDecimal;
import java.util.List;
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

import com.gestor.tienda.Dto.DetalleOrdenDto;
import com.gestor.tienda.Dto.OrdenDto;
import com.gestor.tienda.Entity.Cliente;
import com.gestor.tienda.Entity.DetalleOrden;
import com.gestor.tienda.Entity.Empleado;
import com.gestor.tienda.Entity.FormaPago;
import com.gestor.tienda.Entity.Orden;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Service.OrdenService;
import com.gestor.tienda.Service.ProductoService;


@RestController
@RequestMapping("/api/ordenes")
@CrossOrigin("*")
public class OrdenController {

    @Autowired
    private OrdenService ordenService;

    @Autowired
    private ProductoService productoService; // Inyectar ProductoService

    @GetMapping
    public List<Orden> getAllOrdenes() {
        return ordenService.getAllOrdenes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orden> getOrdenById(@PathVariable Integer id) {
        Optional<Orden> orden = ordenService.getOrdenById(id);
        return orden.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Orden> createOrden(@RequestBody OrdenDto ordenDto) {
    Orden orden = new Orden();
    
    // Asignar fecha y hora directamente desde OrdenDto
    orden.setFecha(ordenDto.getFecha()); // LocalDate
    orden.setHora(ordenDto.getHora()); // LocalTime
    
    // Asignar cliente, forma de pago y empleado
    Cliente cliente = new Cliente();
    cliente.setId(ordenDto.getClienteId());
    orden.setCliente(cliente);
    
    FormaPago formaPago = new FormaPago();
    formaPago.setId(ordenDto.getFormaPagoId());
    orden.setFormaPago(formaPago);
    
    Empleado empleado = new Empleado();
    empleado.setId(ordenDto.getEmpleadoId());
    orden.setEmpleado(empleado);
    
    // Agregar detalles de la orden
    for (DetalleOrdenDto detalleDto : ordenDto.getDetallesOrden()) {
        DetalleOrden detalleOrden = new DetalleOrden();
        // Obtener el producto por ID usando ProductoService
        Producto producto = productoService.getProductoById(detalleDto.getProductoId()).orElse(null);
        if (producto != null) {
            detalleOrden.setProducto(producto); // Asignar el producto
            detalleOrden.setCantidad(detalleDto.getCantidad());
            
            // Calcular el precio
            BigDecimal precioDetalle = producto.getPrecio().multiply(BigDecimal.valueOf(detalleOrden.getCantidad()));
            detalleOrden.setPrecioDetalle(precioDetalle);
            detalleOrden.setOrden(orden); // Asignar la orden al detalle
            orden.getDetallesOrden().add(detalleOrden); // Agregar el detalle a la orden
        } else {
            // Manejar el caso en que el producto no existe
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Calcular el precio total antes de guardar
    orden.calcularPrecioTotal();
    
    // Guardar la orden
    Orden savedOrden = ordenService.saveOrden(orden);
    return new ResponseEntity<>(savedOrden, HttpStatus.CREATED);
}


    @PutMapping("/{id}")
    public ResponseEntity<Orden> updateOrden(@PathVariable Integer id, @RequestBody OrdenDto ordenDto) {
        if (ordenService.existsById(id)) {
            Optional<Orden> optionalOrden = ordenService.getOrdenById(id);
            if (optionalOrden.isPresent()) {
                Orden orden = optionalOrden.get();
                
                // Asignar fecha y hora directamente desde OrdenDto
                orden.setFecha(ordenDto.getFecha()); // LocalDate
                orden.setHora(ordenDto.getHora()); // LocalTime
                
                // Asignar cliente, forma de pago y empleado
                Cliente cliente = new Cliente();
                cliente.setId(ordenDto.getClienteId());
                orden.setCliente(cliente);
                
                FormaPago formaPago = new FormaPago();
                formaPago.setId(ordenDto.getFormaPagoId());
                orden.setFormaPago(formaPago);
                
                Empleado empleado = new Empleado();
                empleado.setId(ordenDto.getEmpleadoId());
                orden.setEmpleado(empleado);
                
                // Limpiar los detalles de la orden actual
                orden.getDetallesOrden().clear();
                
                // Agregar detalles de la orden
                for (DetalleOrdenDto detalleDto : ordenDto.getDetallesOrden()) {
                    DetalleOrden detalleOrden = new DetalleOrden();
                    // Obtener el producto por ID usando ProductoService
                    Producto producto = productoService.getProductoById(detalleDto.getProductoId()).orElse(null);
                    if (producto != null) {
                        detalleOrden.setProducto(producto); // Asignar el producto
                        detalleOrden.setCantidad(detalleDto.getCantidad());
                        
                        // Calcular el precio
                        BigDecimal precioDetalle = producto.getPrecio().multiply(BigDecimal.valueOf(detalleOrden.getCantidad()));
                        detalleOrden.setPrecioDetalle(precioDetalle);
                        detalleOrden.setOrden(orden); // Asignar la orden al detalle
                        orden.getDetallesOrden().add(detalleOrden); // Agregar el detalle a la orden
                    } else {
                        // Manejar el caso en que el producto no existe
                        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                    }
                }
                
                // Calcular el precio total antes de guardar
                orden.calcularPrecioTotal();
                
                // Guardar la orden actualizada
                Orden updatedOrden = ordenService.saveOrden(orden);
                return new ResponseEntity<>(updatedOrden, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrden(@PathVariable Integer id) {
        if (ordenService.existsById(id)) {
            ordenService.deleteOrden(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}

