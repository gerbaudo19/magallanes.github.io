package com.gestor.tienda.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gestor.tienda.Entity.TipoPrenda;
import com.gestor.tienda.Repository.TipoPrendaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class TipoPrendaService {

    @Autowired
    private TipoPrendaRepository tipoPrendaRepository;

    public List<TipoPrenda> getAllTipoPrendas() {
        return tipoPrendaRepository.findAll();
    }

    public Optional<TipoPrenda> getTipoPrendaById(Long id) {
        return tipoPrendaRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return tipoPrendaRepository.existsById(id);
    }

    public TipoPrenda saveTipoPrenda(TipoPrenda tipoPrenda) {
        return tipoPrendaRepository.save(tipoPrenda);
    }

    public void deleteTipoPrenda(Long id) {
        tipoPrendaRepository.deleteById(id);
    }
}
