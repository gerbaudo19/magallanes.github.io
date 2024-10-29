package com.gestor.tienda.Entity;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Cliente extends Persona {
    public Cliente(String nombre, String apellido, String dni, String telefono, String email, String domicilio) {
        super(nombre, apellido, dni, telefono, email, domicilio);
    }
}