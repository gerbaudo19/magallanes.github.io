package com.gestor.tienda.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrdenResponseDto {
    private int id;
    private LocalDate fecha;
    private LocalTime hora;
    private BigDecimal precioTotal;
    private ClienteDto cliente;
    private EmpleadoDto empleado;
    private FormaPagoDto formaPago;
    private List<DetalleOrdenResponseDto> detalles;
}
