package com.gestor.tienda.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestor.tienda.Entity.DetalleOrden;
import com.gestor.tienda.Repository.DetalleOrdenRepository;

@Service
@Transactional
public class DetalleOrdenService {

    @Autowired
    private DetalleOrdenRepository detalleOrdenRepository;

    public List<DetalleOrden> getAllDetallesOrden() {
        return detalleOrdenRepository.findAll();
    }

    public Optional<DetalleOrden> getDetalleOrdenById(Integer id) {
        return detalleOrdenRepository.findById(id);
    }

    public DetalleOrden saveDetalleOrden(DetalleOrden detalleOrden) {
        return detalleOrdenRepository.save(detalleOrden);
    }

    public void deleteDetalleOrden(Integer id) {
        detalleOrdenRepository.deleteById(id);
    }

    
}
