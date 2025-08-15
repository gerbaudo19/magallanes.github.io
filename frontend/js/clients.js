import { fetchData, handleFormSubmit } from './main.js'; 

let clients = [];
let allClients = []; // Guardamos todos los clientes para poder restaurar la lista completa

// Inicializa la sección de clientes
export function initClients(container) {
    container.innerHTML = `
        <h2>Clientes</h2>
        
        <!-- Sistema de filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <h6 class="card-title mb-3">Filtrar Clientes</h6>
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="filterType" class="form-label">Filtrar por:</label>
                        <select class="form-select" id="filterType">
                            <option value="id">ID</option>
                            <option value="dni">DNI</option>
                            <option value="nombre">Nombre</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="filterValue" class="form-label">Valor de búsqueda:</label>
                        <input type="text" class="form-control" id="filterValue" placeholder="Ingrese el valor a buscar...">
                    </div>
                    <div class="col-md-5">
                        <button class="btn btn-primary me-2" onclick="filterClients()">
                            <i class="bi bi-search"></i> Buscar
                        </button>
                        <button class="btn btn-secondary" onclick="clearFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-info" id="clientCount">Total: 0 clientes</span>
            </div>
            <button class="btn btn-primary" onclick="openModal('addClient')">
                <i class="bi bi-plus-circle"></i> Agregar Nuevo Cliente
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped" id="clientTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>DNI</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de clientes se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        
        <!-- Mensaje cuando no hay resultados -->
        <div id="noResultsMessage" class="alert alert-info text-center d-none">
            <i class="bi bi-info-circle"></i> No se encontraron clientes con los criterios especificados.
        </div>
        
        ${createClientModals()}
    `;

    fetchClients();
    setupClientEventListeners();
    setupFilterEventListeners();
}

// Configura los event listeners para los filtros
function setupFilterEventListeners() {
    // Búsqueda al presionar Enter
    const filterValue = document.getElementById('filterValue');
    if (filterValue) {
        filterValue.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterClients();
            }
        });
    }
}

// Función para filtrar clientes
window.filterClients = function() {
    const filterType = document.getElementById('filterType').value;
    const filterValue = document.getElementById('filterValue').value.trim();
    
    if (!filterValue) {
        alert('Por favor ingrese un valor para buscar');
        return;
    }

    // Mostrar indicador de carga
    showLoading(true);
    
    let endpoint;
    switch(filterType) {
        case 'id':
            endpoint = `http://localhost:8080/cliente/listById/${filterValue}`;
            break;
        case 'dni':
            endpoint = `http://localhost:8080/cliente/listByDni/${filterValue}`;
            break;
        case 'nombre':
            endpoint = `http://localhost:8080/cliente/listByNombre/${filterValue}`;
            break;
        default:
            endpoint = 'http://localhost:8080/cliente/list';
    }

    fetchData(endpoint, data => {
        showLoading(false);
        
        if (filterType === 'id' || filterType === 'dni') {
            // Para búsquedas por ID o DNI que devuelven Optional<Cliente>
            if (data && Object.keys(data).length > 0) {
                clients = [data];
            } else {
                clients = [];
            }
        } else {
            // Para búsqueda por nombre que devuelve List<Cliente>
            clients = data || [];
        }
        
        updateClientTable();
        updateClientCount();
        showNoResults(clients.length === 0);
    }, error => {
        showLoading(false);
        console.error('Error al filtrar clientes:', error);
        clients = [];
        updateClientTable();
        updateClientCount();
        showNoResults(true);
    });
}

// Función para limpiar filtros
window.clearFilters = function() {
    document.getElementById('filterValue').value = '';
    document.getElementById('filterType').value = 'id';
    clients = [...allClients];
    updateClientTable();
    updateClientCount();
    showNoResults(false);
}

// Muestra/oculta el indicador de carga
function showLoading(show) {
    const tableBody = document.querySelector('#clientTable tbody');
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Buscando clientes...
                </td>
            </tr>
        `;
    }
}

// Muestra/oculta el mensaje de sin resultados
function showNoResults(show) {
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
        if (show) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

// Actualiza el contador de clientes
function updateClientCount() {
    const clientCount = document.getElementById('clientCount');
    if (clientCount) {
        clientCount.textContent = `Total: ${clients.length} cliente${clients.length !== 1 ? 's' : ''}`;
    }
}

// Obtiene la lista de clientes
function fetchClients() {
    fetchData('http://localhost:8080/cliente/list', data => {
        clients = data || [];
        allClients = [...clients]; // Guardamos copia de todos los clientes
        updateClientTable();
        updateClientCount();
        showNoResults(false);
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
                <td><strong>${client.id}</strong></td>
                <td>${client.nombre}</td>
                <td>${client.apellido}</td>
                <td><span class="badge bg-secondary">${client.dni}</span></td>
                <td>${client.telefono || '-'}</td>
                <td>${client.email || '-'}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewClient(${client.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editClient(${client.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${client.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
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
        ${createViewClientModal()}
    `;
}

function createAddClientModal() {
    return `
        <div class="modal fade" id="addClientModal" tabindex="-1" aria-labelledby="addClientModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addClientModalLabel">
                            <i class="bi bi-person-plus"></i> Agregar Nuevo Cliente
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addClientForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="clientName" class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="clientName" name="nombre" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="clientLastName" class="form-label">Apellido *</label>
                                    <input type="text" class="form-control" id="clientLastName" name="apellido" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="clientDni" class="form-label">DNI *</label>
                                    <input type="number" class="form-control" id="clientDni" name="dni" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="clientPhone" class="form-label">Teléfono</label>
                                    <input type="number" class="form-control" id="clientPhone" name="telefono">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="clientEmail" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="clientEmail" name="email">
                            </div>
                            <div class="mb-3">
                                <label for="clientAddress" class="form-label">Dirección *</label>
                                <input type="text" class="form-control" id="clientAddress" name="domicilio" required>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Agregar Cliente
                                </button>
                            </div>
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
                        <h5 class="modal-title" id="editClientModalLabel">
                            <i class="bi bi-pencil"></i> Editar Cliente
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editClientForm">
                            <input type="hidden" id="editClientId" name="id">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editClientName" class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="editClientName" name="nombre" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editClientLastName" class="form-label">Apellido *</label>
                                    <input type="text" class="form-control" id="editClientLastName" name="apellido" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editClientDni" class="form-label">DNI *</label>
                                    <input type="number" class="form-control" id="editClientDni" name="dni" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editClientPhone" class="form-label">Teléfono</label>
                                    <input type="number" class="form-control" id="editClientPhone" name="telefono">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="editClientEmail" class="form-label">Correo Electrónico</label>
                                <input type="email" class="form-control" id="editClientEmail" name="email">
                            </div>
                            <div class="mb-3">
                                <label for="editClientAddress" class="form-label">Dirección *</label>
                                <input type="text" class="form-control" id="editClientAddress" name="domicilio" required>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createViewClientModal() {
    return `
        <div class="modal fade" id="viewClientModal" tabindex="-1" aria-labelledby="viewClientModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewClientModalLabel">
                            <i class="bi bi-eye"></i> Detalles del Cliente
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body" id="viewClientContent">
                        <!-- El contenido se cargará dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configura los event listeners para los formularios
function setupClientEventListeners() {
    // Para agregar un cliente
    handleFormSubmit(
        'addClientForm',
        'http://localhost:8080/cliente/create',
        'POST',
        'Cliente agregado exitosamente',
        () => {
            fetchClients(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
            modal.hide();
        }
    );

    // Para editar un cliente
    handleFormSubmit(
        'editClientForm',
        (form) => {
            const id = form.elements['id'].value;
            return `http://localhost:8080/cliente/update/${id}`;
        },
        'PUT',
        'Cliente actualizado con éxito',
        () => {
            fetchClients(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
            modal.hide();
        }
    );
}

// Función para abrir modales
window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

// Ver detalles del cliente
window.viewClient = function(id) {
    const client = clients.find(c => c.id === id) || allClients.find(c => c.id === id);
    if (client) {
        const content = document.getElementById('viewClientContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${client.id}</p>
                                    <p><strong>Nombre completo:</strong> ${client.nombre} ${client.apellido}</p>
                                    <p><strong>DNI:</strong> ${client.dni}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Teléfono:</strong> ${client.telefono || 'No especificado'}</p>
                                    <p><strong>Email:</strong> ${client.email || 'No especificado'}</p>
                                    <p><strong>Dirección:</strong> ${client.domicilio}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewClientModal'));
        modal.show();
    } else {
        alert('Cliente no encontrado');
    }
}

// Editar cliente
window.editClient = function(id) {
    const client = clients.find(c => c.id === id) || allClients.find(c => c.id === id);
    if (client) {
        document.getElementById('editClientId').value = client.id;
        document.getElementById('editClientName').value = client.nombre;
        document.getElementById('editClientLastName').value = client.apellido;
        document.getElementById('editClientDni').value = client.dni;
        document.getElementById('editClientPhone').value = client.telefono || '';
        document.getElementById('editClientEmail').value = client.email || '';
        document.getElementById('editClientAddress').value = client.domicilio;
        openModal('editClient');
    } else {
        alert('Cliente no encontrado');
    }
}

// Eliminar cliente
window.deleteClient = function(id) {
    const client = clients.find(c => c.id === id) || allClients.find(c => c.id === id);
    const clientName = client ? `${client.nombre} ${client.apellido}` : 'este cliente';
    
    if (confirm(`¿Está seguro de que desea eliminar a ${clientName}?`)) {
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
                fetchClients(); // Recarga la lista completa
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