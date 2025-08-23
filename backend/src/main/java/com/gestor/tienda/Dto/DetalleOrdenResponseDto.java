package com.gestor.tienda.Dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DetalleOrdenResponseDto {
    private long productoId;
    private int cantidad;
    private BigDecimal precioDetalle;
}
