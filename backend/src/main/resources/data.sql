-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS empresa;
USE empresa;

-- Crear la tabla forma_pago
CREATE TABLE IF NOT EXISTS forma_pago (
    id_forma_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE
);

-- Crear la tabla tipo_prenda
CREATE TABLE IF NOT EXISTS tipo_prenda (
    id_tipo_prenda INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    descripcion TEXT
);

-- Crear la tabla rol (en vez de ENUM en la tabla empleado)
CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE
);

-- Crear la tabla producto
CREATE TABLE IF NOT EXISTS producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL(10, 2),
    talle VARCHAR(10),
    color VARCHAR(50),
    marca VARCHAR(50),
    tipo_prenda_id INT,
    FOREIGN KEY (tipo_prenda_id) REFERENCES tipo_prenda(id_tipo_prenda)
);

-- Crear la tabla empleado
CREATE TABLE IF NOT EXISTS empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    domicilio VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100),  -- Recuerda almacenar la contraseña de forma cifrada
    rol_id INT,  -- Relación con la tabla rol
    FOREIGN KEY (rol_id) REFERENCES rol(id_rol)
);

-- Crear la tabla cliente
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    domicilio VARCHAR(100)
);

-- Crear la tabla orden
CREATE TABLE IF NOT EXISTS orden (
    id_orden INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE,
    hora TIME,
    cliente_id INT,
    forma_pago_id INT,
    empleado_id INT,
    precio_total DECIMAL(10, 2),
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
    FOREIGN KEY (forma_pago_id) REFERENCES forma_pago(id_forma_pago),
    FOREIGN KEY (empleado_id) REFERENCES empleado(id_empleado)
);

-- Crear la tabla detalle_orden
CREATE TABLE IF NOT EXISTS detalle_orden (
    id_detalle_orden INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT,
    producto_id INT,
    cantidad INT,
    precio_detalle DECIMAL(10, 2),
    FOREIGN KEY (orden_id) REFERENCES orden(id_orden),
    FOREIGN KEY (producto_id) REFERENCES producto(id_producto)
);

-- Insertar formas de pago
INSERT IGNORE INTO forma_pago (nombre) VALUES ('Efectivo');
INSERT IGNORE INTO forma_pago (nombre) VALUES ('Tarjeta de Crédito');
INSERT IGNORE INTO forma_pago (nombre) VALUES ('Tarjeta de Débito');

-- Insertar tipos de prenda
INSERT IGNORE INTO tipo_prenda (nombre, descripcion) VALUES ('Camisa', 'Camisa de algodón manga larga');
INSERT IGNORE INTO tipo_prenda (nombre, descripcion) VALUES ('Pantalón', 'Pantalón de jean');

-- Insertar productos
INSERT IGNORE INTO producto (nombre, precio, talle, color, marca, tipo_prenda_id) 
VALUES ('Camisa Azul', 5000.00, 'M', 'Azul', 'Zara', 1);

INSERT IGNORE INTO producto (nombre, precio, talle, color, marca, tipo_prenda_id) 
VALUES ('Pantalón Negro', 8000.00, 'L', 'Negro', 'Levis', 2);

-- Insertar roles
INSERT IGNORE INTO rol (nombre) VALUES ('ADMIN');
INSERT IGNORE INTO rol (nombre) VALUES ('USER');

-- Insertar empleados (con rol_id)
INSERT IGNORE INTO empleado (nombre, apellido, dni, telefono, email, domicilio, username, password, rol_id) 
VALUES ('Juan', 'Pérez', '12345678', '3511234567', 'juan@example.com', 'Calle Falsa 123', 'juanp', '1234', 1);  -- 1 es el ID del rol ADMIN

INSERT IGNORE INTO empleado (nombre, apellido, dni, telefono, email, domicilio, username, password, rol_id) 
VALUES ('Ana', 'Gómez', '87654321', '3517654321', 'ana@example.com', 'Av. Siempre Viva 456', 'anag', '1234', 2);  -- 2 es el ID del rol USER

-- Insertar clientes
INSERT IGNORE INTO cliente (nombre, apellido, dni, telefono, email, domicilio) 
VALUES ('Carlos', 'Lopez', '11223344', '3511111111', 'carlos@example.com', 'Calle Principal 456');

INSERT IGNORE INTO cliente (nombre, apellido, dni, telefono, email, domicilio) 
VALUES ('Maria', 'Rodriguez', '22334455', '3512222222', 'maria@example.com', 'Av. Libertad 789');

-- Insertar órdenes
INSERT IGNORE INTO orden (fecha, hora, cliente_id, forma_pago_id, empleado_id, precio_total) 
VALUES ('2025-03-11', '14:30:00', 1, 1, 1, 13000.00);

INSERT IGNORE INTO orden (fecha, hora, cliente_id, forma_pago_id, empleado_id, precio_total) 
VALUES ('2025-03-12', '16:00:00', 2, 2, 2, 8000.00);

-- Insertar detalles de órdenes
INSERT IGNORE INTO detalle_orden (orden_id, producto_id, cantidad, precio_detalle) 
VALUES (1, 1, 2, 10000.00);

INSERT IGNORE INTO detalle_orden (orden_id, producto_id, cantidad, precio_detalle) 
VALUES (1, 2, 1, 8000.00);

INSERT IGNORE INTO detalle_orden (orden_id, producto_id, cantidad, precio_detalle) 
VALUES (2, 2, 1, 8000.00);

