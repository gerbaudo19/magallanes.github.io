package com.gestor.tienda.Dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DetalleOrdenDto {
    @NotNull
    private int id;

    @NotNull
    private int ordenId;

    @NotNull
    private int productoId;

    @NotNull
    private int cantidad;

    @NotNull
    private BigDecimal precioDetalle; 
}



