package com.gestor.tienda.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FormaPagoDto {
    @NotBlank
    private String nombre;

    public FormaPagoDto(String nombre) {
        this.nombre = nombre;
    }
}
