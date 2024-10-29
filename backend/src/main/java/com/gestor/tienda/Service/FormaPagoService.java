package com.gestor.tienda.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestor.tienda.Entity.FormaPago;
import com.gestor.tienda.Repository.FormaPagoRepository;

import jakarta.annotation.PostConstruct;

@Service
@Transactional
public class FormaPagoService {
    @Autowired
    FormaPagoRepository estadoRepository;

    public Optional<FormaPago> findById(int id) {
        return estadoRepository.findById(id);
    }

    @PostConstruct
    public void cargarEstadosIniciales() {
        // Verificar si ya existen estados en la base de datos
        if (estadoRepository.count() == 0) {
            estadoRepository.save(new FormaPago("Efectivo"));
            estadoRepository.save(new FormaPago("Tarjeta de Credito"));
            estadoRepository.save(new FormaPago("Tarjeta de Debito"));
        }
    }
}
