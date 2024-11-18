import { fetchData, handleFormSubmit } from './main.js'; 

let clients = [];

// Inicializa la sección de clientes
export function initClients(container) {
    container.innerHTML = `
        <h2>Clientes</h2>
        <button class="btn btn-primary mb-3" onclick="openModal('addClient')">Agregar Nuevo Cliente</button>
        <div class="table-responsive">
            <table class="table table-striped" id="clientTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>DNI</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de clientes se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        ${createClientModals()}
    `;

    fetchClients();
    setupClientEventListeners();
}

// Obtiene la lista de clientes
function fetchClients() {
    fetchData('http://localhost:8080/cliente/list', data => {
        clients = data;
        updateClientTable();
    });
}

// Actualiza la tabla de clientes
function updateClientTable() {
    const tableBody = document.querySelector('#clientTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        clients.forEach(client => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${client.id}</td>
                <td>${client.nombre}</td>
                <td>${client.apellido}</td>
                <td>${client.dni}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewClient(${client.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editClient(${client.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.id})">Eliminar</button>
                </td>
            `;
        });
    }
}

// Crea los modales para agregar y editar clientes
function createClientModals() {
    return `
        ${createAddClientModal()}
        ${createEditClientModal()}
    `;
}

function createAddClientModal() {
    return `
        <div class="modal fade" id="addClientModal" tabindex="-1" aria-labelledby="addClientModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addClientModalLabel">Agregar Nuevo Cliente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addClientForm">
                            <div class="mb-3">
                                <label for="clientName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="clientName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="clientLastName" class="form-label">Apellido</label>
                                <input type="text" class="form-control" id="clientLastName" name="apellido" required>
                            </div>
                            <div class="mb-3">
                                <label for="clientDni" class="form-label">DNI</label>
                                <input type="text" class="form-control" id="clientDni" name="dni" required>
                            </div>
                            <div class="mb-3">
                                <label for="clientPhone" class="form-label">Teléfono</label>
                                <input type="text" class="form-control" id="clientPhone" name="telefono">
                            </div>
                            <div class="mb-3">
                                <label for="clientEmail" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="clientEmail" name="email">
                            </div>
                            <div class="mb-3">
                                <label for="clientAddress" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="clientAddress" name="domicilio" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Agregar Cliente</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditClientModal() {
    return `
        <div class="modal fade" id="editClientModal" tabindex="-1" aria-labelledby="editClientModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editClientModalLabel">Editar Cliente</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editClientForm">
                            <input type="hidden" id="editClientId" name="id">
                            <div class="mb-3">
                                <label for="editClientName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="editClientName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="editClientLastName" class="form-label">Apellido</label>
                                <input type="text" class="form-control" id="editClientLastName" name="apellido" required>
                            </div>
                            <div class="mb-3">
                                <label for="editClientDni" class="form-label">DNI</label>
                                <input type="text" class="form-control" id="editClientDni" name="dni" required>
                            </div>
                            <div class="mb-3">
                                <label for="editClientPhone" class="form-label">Teléfono</label>
                                <input type="text" class="form-control" id="editClientPhone" name="telefono">
                            </div>
                            <div class="mb-3">
                                <label for="editClientEmail" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="editClientEmail" name="email">
                            </div>
                            <div class="mb-3">
                                <label for="editClientAddress" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="editClientAddress" name="domicilio" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configura los event listeners para los formularios
setupClientEventListeners();

function setupClientEventListeners() {
    // Para agregar un cliente
    handleFormSubmit(
        'addClientForm',
        'http://localhost:8080/cliente/create',
        'POST',
        'Cliente agregado exitosamente',
        fetchClients
    );

    // Para editar un cliente
    handleFormSubmit(
        'editClientForm',
        (form) => {
            const id = form.elements['id'].value; // Obtén el ID del formulario correctamente
            return `http://localhost:8080/cliente/update/${id}`;
        },
        'PUT',
        'Cliente actualizado con éxito',
        fetchClients
    );
}



// Función para abrir modales
window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

// Ver detalles del cliente
window.viewClient = function(id) {
    fetchData(`http://localhost:8080/cliente/listById/${id}`, data => {
        alert(data ? JSON.stringify(data, null, 2) : 'Cliente no encontrado');
    });
}

// Editar cliente
window.editClient = function(id) {
    const client = clients.find(c => c.id === id);
    if (client) {
        // Rellenar los campos del modal con la información del cliente seleccionado
        document.getElementById('editClientId').value = client.id;
        document.getElementById('editClientName').value = client.nombre;
        document.getElementById('editClientLastName').value = client.apellido;
        document.getElementById('editClientDni').value = client.dni;
        document.getElementById('editClientPhone').value = client.telefono;
        document.getElementById('editClientEmail').value = client.email;
        document.getElementById('editClientAddress').value = client.domicilio;
        openModal('editClient'); // Abrir modal de edición
    } else {
        alert('Cliente no encontrado');
    }
}

// Eliminar cliente
window.deleteClient = function(id) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
        fetch(`http://localhost:8080/cliente/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Cliente eliminado con éxito');
                fetchClients();
            } else {
                alert(response.status === 400 ? 'Error: el cliente no existe o no se puede eliminar.' : 'Error al eliminar cliente');
                throw new Error('Error al eliminar cliente. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error al eliminar el cliente:', error);
            alert('Hubo un problema al eliminar el cliente.');
        });
    }
}


