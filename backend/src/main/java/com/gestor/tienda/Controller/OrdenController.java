package com.gestor.tienda.Controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestor.tienda.Dto.*;
import com.gestor.tienda.Entity.*;
import com.gestor.tienda.Service.OrdenService;
import com.gestor.tienda.Service.ProductoService;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    @Autowired
    private OrdenService ordenService;

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<OrdenResponseDto> getAllOrdenes() {
        return ordenService.getAllOrdenes().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponseDto> getOrdenById(@PathVariable Integer id) {
        Optional<Orden> orden = ordenService.getOrdenById(id);
        return orden.map(o -> ResponseEntity.ok(mapToResponseDto(o)))
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OrdenResponseDto> createOrden(@RequestBody OrdenDto ordenDto) {
        try {
            Orden orden = new Orden();
            asignarDatosOrden(orden, ordenDto);
            Orden savedOrden = ordenService.saveOrden(orden);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponseDto(savedOrden));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdenResponseDto> updateOrden(@PathVariable Integer id, @RequestBody OrdenDto ordenDto) {
        if (!ordenService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            Orden orden = ordenService.getOrdenById(id).get();
            orden.getDetallesOrden().clear();
            asignarDatosOrden(orden, ordenDto);
            Orden updatedOrden = ordenService.saveOrden(orden);
            return ResponseEntity.ok(mapToResponseDto(updatedOrden));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
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
        if (empleado.getRol() == null) {
            empleado.setRol(Rol.EMPLEADO);
        }
        orden.setEmpleado(empleado);

        orden.setPrecioTotal(BigDecimal.ZERO);

        for (DetalleOrdenDto detalleDto : ordenDto.getDetallesOrden()) {
            Producto producto = productoService.getProductoById(detalleDto.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalleDto.getProductoId()));

            DetalleOrden detalleOrden = new DetalleOrden();
            detalleOrden.setProducto(producto);
            detalleOrden.setCantidad(detalleDto.getCantidad());
            detalleOrden.setPrecioDetalle(producto.getPrecio()
                    .multiply(BigDecimal.valueOf(detalleOrden.getCantidad())));
            detalleOrden.setOrden(orden);
            orden.getDetallesOrden().add(detalleOrden);
        }

        orden.calcularPrecioTotal();
    }

    private OrdenResponseDto mapToResponseDto(Orden orden) {
        OrdenResponseDto dto = new OrdenResponseDto();
        dto.setId(orden.getId());
        dto.setFecha(orden.getFecha());
        dto.setHora(orden.getHora());
        dto.setPrecioTotal(orden.getPrecioTotal());

        // Cliente completo
        ClienteDto clienteDto = new ClienteDto();
        clienteDto.setId(orden.getCliente().getId());
        clienteDto.setNombre(orden.getCliente().getNombre());
        clienteDto.setApellido(orden.getCliente().getApellido());
        dto.setCliente(clienteDto);

        // Empleado completo
        EmpleadoDto empleadoDto = new EmpleadoDto();
        empleadoDto.setId(orden.getEmpleado().getId());
        empleadoDto.setNombre(orden.getEmpleado().getNombre());
        empleadoDto.setApellido(orden.getEmpleado().getApellido());
        dto.setEmpleado(empleadoDto);

        // FormaPago completo
        FormaPagoDto formaPagoDto = new FormaPagoDto();
        formaPagoDto.setId(orden.getFormaPago().getId());
        formaPagoDto.setNombre(orden.getFormaPago().getNombre());
        dto.setFormaPago(formaPagoDto);

        // Detalles
        List<DetalleOrdenResponseDto> detalles = orden.getDetallesOrden().stream().map(det -> {
            DetalleOrdenResponseDto d = new DetalleOrdenResponseDto();
            d.setProductoId(det.getProducto().getId());
            d.setCantidad(det.getCantidad());
            d.setPrecioDetalle(det.getPrecioDetalle());
            return d;
        }).toList();

        dto.setDetalles(detalles);
        return dto;
    }
}
