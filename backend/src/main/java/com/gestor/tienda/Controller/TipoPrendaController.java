package com.gestor.tienda.Controller;

import java.util.List;

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

import com.gestor.tienda.Entity.TipoPrenda;
import com.gestor.tienda.Service.TipoPrendaService;

@RestController
@RequestMapping("/api/tipoPrendas")
@CrossOrigin("*")
public class TipoPrendaController {

    @Autowired
    private TipoPrendaService tipoPrendaService;

    @GetMapping
    public List<TipoPrenda> getAllTipoPrendas() {
        return tipoPrendaService.getAllTipoPrendas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoPrenda> getTipoPrendaById(@PathVariable Long id) {
        return tipoPrendaService.getTipoPrendaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TipoPrenda createTipoPrenda(@RequestBody TipoPrenda tipoPrenda) {
        return tipoPrendaService.saveTipoPrenda(tipoPrenda);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoPrenda> updateTipoPrenda(@PathVariable Long id, @RequestBody TipoPrenda tipoPrenda) {
        if (!tipoPrendaService.getTipoPrendaById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        tipoPrenda.setId(id);
        return ResponseEntity.ok(tipoPrendaService.saveTipoPrenda(tipoPrenda));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTipoPrenda(@PathVariable Long id) {
        if (!tipoPrendaService.getTipoPrendaById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        tipoPrendaService.deleteTipoPrenda(id);
        return ResponseEntity.ok().build();
    }
}

