package com.gestor.tienda.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable; // Asegúrate de importar la clase Rol
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Dto.EmpleadoDto;
import com.gestor.tienda.Entity.Empleado;
import com.gestor.tienda.Entity.Rol;
import com.gestor.tienda.Service.EmpleadoService;


@RestController
@RequestMapping("/empleado")
@CrossOrigin("*")
public class EmpleadoController {

    @Autowired
    private EmpleadoService empleadoService;

    @GetMapping("/list")
    public ResponseEntity<List<Empleado>> findAll() {
        List<Empleado> list = empleadoService.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody EmpleadoDto empleadoDto) {
        if (empleadoDto.getNombre().isBlank() ||
            empleadoDto.getApellido().isBlank() ||
            empleadoDto.getDomicilio().isBlank() ||
            empleadoDto.getDni().isBlank() ||
            empleadoService.existsByDni(empleadoDto.getDni())) {
            return new ResponseEntity<>("Datos inválidos o DNI ya existente.", HttpStatus.BAD_REQUEST);
        }
    
        Rol rol;
        try {
            rol = Rol.valueOf(empleadoDto.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Rol inválido.", HttpStatus.BAD_REQUEST);
        }
    
        Empleado empleadoNuevo = new Empleado(
            empleadoDto.getNombre(),
            empleadoDto.getApellido(),
            empleadoDto.getDni(),
            empleadoDto.getTelefono(),
            empleadoDto.getEmail(),
            empleadoDto.getDomicilio(),
            empleadoDto.getUsername(),
            empleadoDto.getPassword(),
            rol
        );
    
        empleadoService.saveEmpleado(empleadoNuevo);
        return new ResponseEntity<>("Empleado guardado exitosamente.", HttpStatus.CREATED);
    }
    

    @GetMapping("/detail/{id}")
    public ResponseEntity<Optional<Empleado>> getById(@PathVariable("id") int id) {
        Optional<Empleado> empleado = empleadoService.findById(id);
        if (empleado.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(empleado, HttpStatus.OK);
    }

    @GetMapping("/detailname/{nombre}")
    public ResponseEntity<List<Empleado>> getByNombre(@PathVariable("nombre") String nombre) {
        List<Empleado> list = empleadoService.findByNombre(nombre);
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteById(@PathVariable("id") int id) {
        empleadoService.deleteById(id);
        return new ResponseEntity<>("Empleado eliminado exitosamente.", HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable("id") int id, @RequestBody EmpleadoDto empleadoDto) {
        Optional<Empleado> empleadoOptional = empleadoService.findById(id);
        if (empleadoOptional.isEmpty()) {
            return new ResponseEntity<>("Empleado no encontrado.", HttpStatus.NOT_FOUND);
        }

        Empleado empleadoExistente = empleadoOptional.get();
        empleadoExistente.setNombre(empleadoDto.getNombre());
        empleadoExistente.setApellido(empleadoDto.getApellido());
        empleadoExistente.setDni(empleadoDto.getDni());
        empleadoExistente.setTelefono(empleadoDto.getTelefono());
        empleadoExistente.setEmail(empleadoDto.getEmail());
        empleadoExistente.setDomicilio(empleadoDto.getDomicilio());
        empleadoExistente.setUsername(empleadoDto.getUsername());
        empleadoExistente.setPassword(empleadoDto.getPassword());  // La codificación se realiza en el servicio
        empleadoExistente.setRol(Rol.valueOf(empleadoDto.getRole().toUpperCase()));

        empleadoService.saveEmpleado(empleadoExistente);
        return new ResponseEntity<>("Empleado actualizado exitosamente.", HttpStatus.OK);
    }
}
