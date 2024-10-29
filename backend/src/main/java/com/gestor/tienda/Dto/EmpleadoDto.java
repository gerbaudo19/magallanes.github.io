package com.gestor.tienda.Dto;

import com.gestor.tienda.Entity.Persona;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmpleadoDto extends Persona {
    
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotBlank
    private String role;

    public EmpleadoDto(@NotBlank String nombre, 
                       @NotBlank String apellido, 
                       @NotBlank String dni, 
                       @NotBlank String telefono, 
                       @NotBlank String email, 
                       @NotBlank String domicilio, 
                       @NotBlank String username, 
                       @NotBlank String password, 
                       @NotBlank String role) {
        super(nombre, apellido, dni, telefono, email, domicilio);
        this.username = username;
        this.password = password;
        this.role = role;
    }
}

