package com.gestor.tienda.Dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GananciaTotalDto {
    private BigDecimal gananciaTotal;

    public GananciaTotalDto(BigDecimal gananciaTotal) {
        this.gananciaTotal = gananciaTotal;
    }
}
