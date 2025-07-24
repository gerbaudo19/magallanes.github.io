package com.gestor.tienda.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Entity.MovimientoStock;
import com.gestor.tienda.Entity.Producto;
import com.gestor.tienda.Repository.MovimientoStockRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class MovimientoStockService {

    @Autowired
    private MovimientoStockRepository movimientoStockRepository;

    public void registrarMovimiento(String tipo, String talle, int cantidad, Producto producto) {
        MovimientoStock movimiento = new MovimientoStock(tipo, talle, cantidad, producto);
        movimientoStockRepository.save(movimiento);
    }
} 