package com.gestor.tienda.Entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
public class DetalleOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "orden_id", nullable = false)
    @JsonBackReference // Esta es la referencia inversa
    private Orden orden;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    private int cantidad;
    private BigDecimal precioDetalle; // Cambiado a BigDecimal

    // Constructor
    public DetalleOrden(Orden orden, Producto producto, int cantidad) {
        this.orden = orden;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioDetalle = producto.getPrecio().multiply(BigDecimal.valueOf(cantidad));
    }

    // Método para obtener el ID del producto
    public int getProductoId() {
        return this.producto.getId(); // Asegúrate de que `getId()` esté definido en la clase `Producto`
    }
}


