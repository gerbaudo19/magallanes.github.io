package com.gestor.tienda.Dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class ProductoEstadisticasDto {

    private Long id;
    private String nombre;
    private Long cantidadVendida;

    public ProductoEstadisticasDto(Long id, String nombre, Long cantidadVendida) {
        this.id = id;
        this.nombre = nombre;
        this.cantidadVendida = cantidadVendida;
    }

    // Getters y Setters
}
