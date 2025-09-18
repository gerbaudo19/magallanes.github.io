package com.gestor.tienda.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class StockInsuficienteDto {
    private Long productoId;
    private String nombreProducto;
    private String marca;
    private String color;
    private String tipoPrenda;
    private String talle;
    private int cantidad;
}
