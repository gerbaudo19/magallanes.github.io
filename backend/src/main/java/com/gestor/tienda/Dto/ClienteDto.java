package com.gestor.tienda.Dto;

import com.gestor.tienda.Entity.Persona;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClienteDto extends Persona {
    public ClienteDto(@NotBlank String nombre, 
                      @NotBlank String apellido, 
                      @NotBlank String dni, 
                      @NotBlank String telefono, 
                      @NotBlank String email, 
                      @NotBlank String domicilio) {
        super(nombre, apellido, dni, telefono, email, domicilio);
    }
}
