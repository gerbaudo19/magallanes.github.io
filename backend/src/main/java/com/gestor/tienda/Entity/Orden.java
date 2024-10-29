package com.gestor.tienda.Entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private LocalDate fecha;
    private LocalTime hora;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "forma_pago_id", nullable = false)
    private FormaPago formaPago;

    @ManyToOne
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    private BigDecimal precioTotal;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL)
    private List<DetalleOrden> detallesOrden = new ArrayList<>();

    public void calcularPrecioTotal() {
        this.precioTotal = detallesOrden.stream()
            .map(DetalleOrden::getPrecioDetalle)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addDetalleOrden(DetalleOrden detalleOrden) {
        detalleOrden.setOrden(this); 
        this.detallesOrden.add(detalleOrden);
    }
}
