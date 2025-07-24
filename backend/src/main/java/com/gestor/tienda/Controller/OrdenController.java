package com.gestor.tienda.Controller;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Dto.DetalleOrdenDto;
import com.gestor.tienda.Dto.GananciaTotalDto;
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
    private ProductoService productoService;

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
    public ResponseEntity<?> createOrden(@RequestBody OrdenDto ordenDto) {
    try {
        Orden orden = new Orden();
        asignarDatosOrden(orden, ordenDto);
        Orden savedOrden = ordenService.saveOrden(orden);
        return new ResponseEntity<>(savedOrden, HttpStatus.CREATED);
    } catch (Exception e) {
        return new ResponseEntity<>("Error al crear la orden: " + e.getMessage(), HttpStatus.BAD_REQUEST);
    }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrden(@PathVariable Integer id, @RequestBody OrdenDto ordenDto) {
    if (!ordenService.existsById(id)) {
        return new ResponseEntity<>("Orden no encontrada", HttpStatus.NOT_FOUND);
    }

    try {
        Orden orden = ordenService.getOrdenById(id).get();
        orden.getDetallesOrden().clear(); // Elimina detalles actuales
        asignarDatosOrden(orden, ordenDto);
        Orden updatedOrden = ordenService.saveOrden(orden);
        return new ResponseEntity<>(updatedOrden, HttpStatus.OK);
    } catch (Exception e) {
        return new ResponseEntity<>("Error al actualizar la orden: " + e.getMessage(), HttpStatus.BAD_REQUEST);
    }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrden(@PathVariable Integer id) {
        if (ordenService.existsById(id)) {
            ordenService.deleteOrden(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/ganancia-total")
    public ResponseEntity<GananciaTotalDto> calcularGananciaTotal(
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        BigDecimal gananciaTotal = ordenService.calcularGananciaTotalPorFecha(fechaInicio, fechaFin);
        return ResponseEntity.ok(new GananciaTotalDto(gananciaTotal));
    }

    private void asignarDatosOrden(Orden orden, OrdenDto ordenDto) {
    orden.setFecha(ordenDto.getFecha());
    orden.setHora(ordenDto.getHora());

    Cliente cliente = new Cliente();
    cliente.setId(ordenDto.getClienteId());
    orden.setCliente(cliente);

    FormaPago formaPago = new FormaPago();
    formaPago.setId(ordenDto.getFormaPagoId());
    orden.setFormaPago(formaPago);

    Empleado empleado = new Empleado();
    empleado.setId(ordenDto.getEmpleadoId());
    orden.setEmpleado(empleado);

    orden.setPrecioTotal(BigDecimal.ZERO); // Reinicio del total antes de sumar

    for (DetalleOrdenDto detalleDto : ordenDto.getDetallesOrden()) {
        Producto producto = productoService.getProductoById(detalleDto.getProductoId())
                                           .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalleDto.getProductoId()));

        DetalleOrden detalleOrden = new DetalleOrden();
        detalleOrden.setProducto(producto);
        detalleOrden.setCantidad(detalleDto.getCantidad());

        BigDecimal precioDetalle = producto.getPrecio()
            .multiply(BigDecimal.valueOf(detalleOrden.getCantidad()));

        detalleOrden.setPrecioDetalle(precioDetalle);
        detalleOrden.setOrden(orden);

        orden.getDetallesOrden().add(detalleOrden);
    }

    orden.calcularPrecioTotal(); // Esto ahora suma correctamente
    }

}
