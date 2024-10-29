package com.gestor.tienda.Entity;


import java.math.BigDecimal;

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
@Setter
@Getter
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nombre;
    private BigDecimal precio; // Cambiado a BigDecimal
    private String talle;
    private String color;
    private String marca;

    @ManyToOne
    @JoinColumn(name = "tipo_prenda_id")
    private TipoPrenda tipoPrenda;

    // Constructor
    public Producto(String nombre, BigDecimal precio, String talle, String color, String marca, TipoPrenda tipoPrenda) {
        this.nombre = nombre;
        this.precio = precio;
        this.talle = talle;
        this.color = color;
        this.marca = marca;
        this.tipoPrenda = tipoPrenda;
    }
}
