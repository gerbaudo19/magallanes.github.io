package com.gestor.tienda.Controller;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Dto.ClienteDto;
import com.gestor.tienda.Entity.Cliente;
import com.gestor.tienda.Service.ClienteService;

@RestController
@RequestMapping("/cliente")
@CrossOrigin("*")
public class ClienteController {
    @Autowired
    ClienteService clienteService;

    @GetMapping("/list")
    public ResponseEntity<List<Cliente>> findAll() {
        List<Cliente> list = clienteService.findAll();
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody ClienteDto clienteDto){
        String dniClienteNuevo = clienteDto.getDni();
        if(clienteDto.getNombre().isBlank() ||
        clienteDto.getApellido().isBlank() ||
        clienteDto.getDomicilio().isBlank() ||
        clienteDto.getDni().isBlank() ||
        clienteService.existsByDni(dniClienteNuevo)){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            
        }else{

            Cliente clienteNuevo = new Cliente(
            clienteDto.getNombre(),
            clienteDto.getApellido(),
            clienteDto.getDni(),
            clienteDto.getTelefono(),
            clienteDto.getEmail(),
            clienteDto.getDomicilio()
            );

            clienteService.save(clienteNuevo);
            return new ResponseEntity<>(HttpStatus.OK);   
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody ClienteDto clienteDto){
        if(!clienteService.existsById(id)){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Cliente cliente = clienteService.findById(id).get();

        cliente.setNombre(clienteDto.getNombre());
        cliente.setApellido(clienteDto.getApellido());
        cliente.setDni(clienteDto.getDni());
        cliente.setTelefono(clienteDto.getTelefono());
        cliente.setEmail(clienteDto.getEmail());
        cliente.setDomicilio(clienteDto.getDomicilio());

        clienteService.save(cliente);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id){

        if(!clienteService.existsById(id)){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        clienteService.deleteById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/listByDni/{dni}")
    public ResponseEntity<Optional<Cliente>> findByDni(@PathVariable String dni){

        try {
            Optional<Cliente> cliente = clienteService.findByDni(dni);
            return new ResponseEntity<>(cliente, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }          
    }

    @GetMapping("/listById/{id}")
    public ResponseEntity<Optional<Cliente>> findById(@PathVariable int id){

        try {
            Optional<Cliente> cliente = clienteService.findById(id);
            return new ResponseEntity<>(cliente, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }        
    }

    @GetMapping("/listByNombre/{nombre}")
    public ResponseEntity<List<Cliente>> findByNombre(@PathVariable String nombre){

        try {
            List<Cliente> clientes = clienteService.findByNombre(nombre);
            return new ResponseEntity<>(clientes, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }        
    }
}