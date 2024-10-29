package com.gestor.tienda.Auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.gestor.tienda.Entity.Empleado;
import com.gestor.tienda.Entity.Rol;
import com.gestor.tienda.Service.EmpleadoService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private EmpleadoService empleadoService;

    @Override
    public void run(String... args) throws Exception {
        if (!empleadoService.existsByDni("admin")) {
            Empleado admin = new Empleado("Admin", "Admin", "admin", "123456789", "admin@example.com", "Domicilio", "admin", "admin123", Rol.ADMIN);
            empleadoService.saveEmpleado(admin); // Usa el método saveEmpleado del servicio
            System.out.println("Empleado admin creado con éxito.");
        }

        if (!empleadoService.existsByDni("user1")) {
            Empleado user = new Empleado("User", "User", "user1", "987654321", "user1@example.com", "Domicilio", "user1", "user123", Rol.EMPLEADO);
            empleadoService.saveEmpleado(user); // Usa el método saveEmpleado del servicio
            System.out.println("Empleado user1 creado con éxito.");
        }
    }
}
