package com.gestor.tienda.Dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductoDto {
    @NotNull
    private int  id;

    @NotBlank
    private String nombre;

    @NotNull
    private BigDecimal precio;

    @NotBlank
    private String talle;

    @NotBlank
    private String color;

    @NotBlank
    private String marca;

    @NotNull
    private Long tipoPrendaId;
}

