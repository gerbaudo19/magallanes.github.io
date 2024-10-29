package com.gestor.tienda.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrdenDto {
    @NotNull
    private int id;

    @NotNull
    private LocalDate fecha;

    @NotNull
    private LocalTime hora;

    @NotNull
    private int clienteId;

    @NotNull
    private int formaPagoId;

    @NotNull
    private int empleadoId;

    @NotNull
    private BigDecimal precioTotal;

    @NotNull
    private List<DetalleOrdenDto> detallesOrden;
}
