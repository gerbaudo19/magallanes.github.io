package com.gestor.tienda.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestor.tienda.Entity.Orden;
import com.gestor.tienda.Repository.OrdenRepository;

@Service
@Transactional
public class OrdenService {

    @Autowired
    private OrdenRepository ordenRepository;

    public List<Orden> getAllOrdenes() {
        return ordenRepository.findAll();
    }

    public Optional<Orden> getOrdenById(int id) {
        return ordenRepository.findById(id);
    }
 
    public Orden saveOrden(Orden orden) {
        return ordenRepository.save(orden);
    }

    public void deleteOrden(int id) {
        ordenRepository.deleteById(id);
    }

    public boolean existsById(int id) {
        return ordenRepository.existsById(id);
    }
}
