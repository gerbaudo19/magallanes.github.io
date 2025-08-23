package com.gestor.tienda.Entity;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.*;
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
    private long id;
    private String nombre;
    private BigDecimal precio;
    private String color;
    private String marca;

    @ManyToOne
    @JoinColumn(name = "tipo_prenda_id")
    private TipoPrenda tipoPrenda;

    @ElementCollection
    @CollectionTable(name = "stock_por_talle", joinColumns = @JoinColumn(name = "producto_id"))
    @MapKeyColumn(name = "talle")
    @Column(name = "cantidad")
    private Map<String, Integer> stockPorTalle = new HashMap<>();

    public Producto(String nombre, BigDecimal precio, String color, String marca, TipoPrenda tipoPrenda) {
        this.nombre = nombre;
        this.precio = precio;
        this.color = color;
        this.marca = marca;
        this.tipoPrenda = tipoPrenda;
    }

    public int getStockPorTalle(String talle) {
        return stockPorTalle.getOrDefault(talle, 0);
    }

    public void agregarStock(String talle, int cantidad) {
        stockPorTalle.put(talle, getStockPorTalle(talle) + cantidad);
    }

    public void reducirStock(String talle, int cantidad) {
        stockPorTalle.put(talle, getStockPorTalle(talle) - cantidad);
    }
}
