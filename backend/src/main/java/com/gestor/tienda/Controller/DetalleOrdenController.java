package com.gestor.tienda.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.gestor.tienda.Entity.DetalleOrden;
import com.gestor.tienda.Service.DetalleOrdenService;

@RestController
@RequestMapping("/api/detalles_orden")
@CrossOrigin("*")
public class DetalleOrdenController {

    @Autowired
    private DetalleOrdenService detalleOrdenService;

    @GetMapping
    public List<DetalleOrden> getAllDetallesOrden() {
        return detalleOrdenService.getAllDetallesOrden();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleOrden> getDetalleOrdenById(@PathVariable Integer id) {
        Optional<DetalleOrden> detalleOrden = detalleOrdenService.getDetalleOrdenById(id);
        return detalleOrden.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public DetalleOrden createDetalleOrden(@RequestBody DetalleOrden detalleOrden) {
        return detalleOrdenService.saveDetalleOrden(detalleOrden);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleOrden> updateDetalleOrden(@PathVariable Integer id, @RequestBody DetalleOrden detalleOrden) {
        Optional<DetalleOrden> existingDetalleOrden = detalleOrdenService.getDetalleOrdenById(id);
        if (existingDetalleOrden.isPresent()) {
            detalleOrden.setId(id);
            return ResponseEntity.ok(detalleOrdenService.saveDetalleOrden(detalleOrden));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleOrden(@PathVariable Integer id) {
        if (detalleOrdenService.getDetalleOrdenById(id).isPresent()) {
            detalleOrdenService.deleteDetalleOrden(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
