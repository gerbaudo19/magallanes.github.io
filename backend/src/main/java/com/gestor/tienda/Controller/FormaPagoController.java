package com.gestor.tienda.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Service.FormaPagoService;


@RestController
@RequestMapping("/api/formaPago")
@CrossOrigin("*")
public class FormaPagoController {

    @Autowired
    private FormaPagoService estadoService;

    @PostMapping("/cargar-formaPago-iniciales")
    public void cargarEstadosIniciales() {
        estadoService.cargarEstadosIniciales();
    }
}
