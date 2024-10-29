package com.gestor.tienda.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TipoPrendaDto {
    @NotNull
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String descripcion;
}

