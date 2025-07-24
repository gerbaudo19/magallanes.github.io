package com.gestor.tienda.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class MovimientoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipoMovimiento; // ENTRADA o SALIDA
    private String talle;
    private int cantidad;
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Producto producto;

    public MovimientoStock(String tipoMovimiento, String talle, int cantidad, Producto producto) {
        this.tipoMovimiento = tipoMovimiento;
        this.talle = talle;
        this.cantidad = cantidad;
        this.fecha = LocalDateTime.now();
        this.producto = producto;
    }
}
