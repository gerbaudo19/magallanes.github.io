package com.gestor.tienda.Dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FormaPagoEstadisticaDto {
    private String formaPago;
    private Long cantidad;

    public FormaPagoEstadisticaDto(String formaPago, Long cantidad) {
        this.formaPago = formaPago;
        this.cantidad = cantidad;
    }
}
    // getters y setters