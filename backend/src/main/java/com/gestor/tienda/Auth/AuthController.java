package com.gestor.tienda.Auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.gestor.tienda.Jwt.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/auth/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        try {
            // Autenticamos al usuario
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            
            // Cargamos los detalles del usuario
            UserDetails empleadoDetails = userDetailsService.loadUserByUsername(request.getUsername());
            // Generamos el token JWT
            String jwtToken = jwtService.getToken(empleadoDetails);
    
            // Devolvemos el token en el encabezado Authorization
            return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtToken) // Agregar encabezado Authorization
                    .body(jwtToken); // También puedes devolver el token en el cuerpo
        } catch (AuthenticationException e) {
            // Manejo de excepciones, como credenciales incorrectas
            return new ResponseEntity<>("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }
    }
    
}
