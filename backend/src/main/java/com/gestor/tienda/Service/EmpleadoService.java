package com.gestor.tienda.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Entity.Empleado;
import com.gestor.tienda.Repository.EmpleadoRepository;


@Service
public class EmpleadoService {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public List<Empleado> findAll() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> findById(int id) {
        return empleadoRepository.findById(id);
    }

    public List<Empleado> findByNombre(String nombre) {
        return empleadoRepository.findByNombre(nombre);
    }

    public boolean existsByDni(String dni) {
        return empleadoRepository.existsByDni(dni);
    }

    public Empleado saveEmpleado(Empleado empleado) {
        // Codifica la contraseña antes de guardar
        String encodedPassword = bCryptPasswordEncoder.encode(empleado.getPassword());
        empleado.setPassword(encodedPassword);
        return empleadoRepository.save(empleado);
    }

    public void deleteById(int id) {
        empleadoRepository.deleteById(id);
    }
}
