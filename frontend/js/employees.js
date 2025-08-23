import { fetchData, handleFormSubmit } from './main.js';

let employees = [];
let allEmployees = []; // Guardamos todos los empleados para poder restaurar la lista completa

// Inicializa la sección de empleados
export function initEmployees(container) {
    container.innerHTML = `
        <h2>Empleados</h2>
        
        <!-- Sistema de filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <h6 class="card-title mb-3">Filtrar Empleados</h6>
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="filterEmployeeType" class="form-label">Filtrar por:</label>
                        <select class="form-select" id="filterEmployeeType">
                            <option value="id">ID</option>
                            <option value="nombre">Nombre</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="filterEmployeeValue" class="form-label">Valor de búsqueda:</label>
                        <input type="text" class="form-control" id="filterEmployeeValue" placeholder="Ingrese el valor a buscar...">
                    </div>
                    <div class="col-md-5">
                        <button class="btn btn-primary me-2" onclick="filterEmployees()">
                            <i class="bi bi-search"></i> Buscar
                        </button>
                        <button class="btn btn-secondary" onclick="clearEmployeeFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-info" id="employeeCount">Total: 0 empleados</span>
            </div>
            <button class="btn btn-primary" onclick="openModal('addEmployee')">
                <i class="bi bi-plus-circle"></i> Agregar Nuevo Empleado
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped" id="employeeTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>DNI</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de empleados se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        
        <!-- Mensaje cuando no hay resultados -->
        <div id="noEmployeeResultsMessage" class="alert alert-info text-center d-none">
            <i class="bi bi-info-circle"></i> No se encontraron empleados con los criterios especificados.
        </div>
        
        ${createEmployeeModals()}
    `;

    fetchEmployees();
    setupEmployeeEventListeners();
    setupEmployeeFilterEventListeners();
}

// Configura los event listeners para los filtros
function setupEmployeeFilterEventListeners() {
    // Búsqueda al presionar Enter
    const filterValue = document.getElementById('filterEmployeeValue');
    if (filterValue) {
        filterValue.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterEmployees();
            }
        });
    }
}

// Función para filtrar empleados
window.filterEmployees = function() {
    const filterType = document.getElementById('filterEmployeeType').value;
    const filterValue = document.getElementById('filterEmployeeValue').value.trim();
    
    if (!filterValue) {
        alert('Por favor ingrese un valor para buscar');
        return;
    }

    // Mostrar indicador de carga
    showEmployeeLoading(true);
    
    let endpoint;
    switch(filterType) {
        case 'id':
            endpoint = `http://localhost:8080/empleado/detail/${filterValue}`;
            break;
        case 'nombre':
            endpoint = `http://localhost:8080/empleado/detailname/${filterValue}`;
            break;
        default:
            endpoint = 'http://localhost:8080/empleado/list';
    }

    fetchData(endpoint, data => {
        showEmployeeLoading(false);
        
        if (filterType === 'id') {
            // Para búsquedas por ID que devuelven Optional<Empleado>
            if (data && Object.keys(data).length > 0) {
                employees = [data];
            } else {
                employees = [];
            }
        } else {
            // Para búsqueda por nombre que devuelve List<Empleado>
            employees = data || [];
        }
        
        updateEmployeeTable();
        updateEmployeeCount();
        showNoEmployeeResults(employees.length === 0);
    }, error => {
        showEmployeeLoading(false);
        console.error('Error al filtrar empleados:', error);
        employees = [];
        updateEmployeeTable();
        updateEmployeeCount();
        showNoEmployeeResults(true);
    });
}

// Función para limpiar filtros
window.clearEmployeeFilters = function() {
    document.getElementById('filterEmployeeValue').value = '';
    document.getElementById('filterEmployeeType').value = 'id';
    employees = [...allEmployees];
    updateEmployeeTable();
    updateEmployeeCount();
    showNoEmployeeResults(false);
}

// Muestra/oculta el indicador de carga
function showEmployeeLoading(show) {
    const tableBody = document.querySelector('#employeeTable tbody');
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Buscando empleados...
                </td>
            </tr>
        `;
    }
}

// Muestra/oculta el mensaje de sin resultados
function showNoEmployeeResults(show) {
    const noResultsMessage = document.getElementById('noEmployeeResultsMessage');
    if (noResultsMessage) {
        if (show) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

// Actualiza el contador de empleados
function updateEmployeeCount() {
    const employeeCount = document.getElementById('employeeCount');
    if (employeeCount) {
        employeeCount.textContent = `Total: ${employees.length} empleado${employees.length !== 1 ? 's' : ''}`;
    }
}

// Obtiene la lista de empleados
function fetchEmployees() {
    fetchData('http://localhost:8080/empleado/list', data => {
        employees = data || [];
        allEmployees = [...employees]; // Guardamos copia de todos los empleados
        updateEmployeeTable();
        updateEmployeeCount();
        showNoEmployeeResults(false);
    });
}

// Actualiza la tabla de empleados
function updateEmployeeTable() {
    const tableBody = document.querySelector('#employeeTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        employees.forEach(employee => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><strong>${employee.id}</strong></td>
                <td>${employee.nombre}</td>
                <td>${employee.apellido}</td>
                <td><span class="badge bg-secondary">${employee.dni}</span></td>
                <td>${employee.telefono || '-'}</td>
                <td>${employee.email || '-'}</td>
                <td><code>${employee.username}</code></td>
                <td><span class="badge ${employee.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">${employee.rol}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewEmployee(${employee.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editEmployee(${employee.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
    }
}

// Crea los modales para agregar y editar empleados
function createEmployeeModals() {
    return `
        ${createAddEmployeeModal()}
        ${createEditEmployeeModal()}
        ${createViewEmployeeModal()}
    `;
}

function createAddEmployeeModal() {
    return `
        <div class="modal fade" id="addEmployeeModal" tabindex="-1" aria-labelledby="addEmployeeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addEmployeeModalLabel">
                            <i class="bi bi-person-plus"></i> Agregar Nuevo Empleado
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addEmployeeForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeName" class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="employeeName" name="nombre" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeLastName" class="form-label">Apellido *</label>
                                    <input type="text" class="form-control" id="employeeLastName" name="apellido" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeDni" class="form-label">DNI *</label>
                                    <input type="number" class="form-control" id="employeeDni" name="dni" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeePhone" class="form-label">Teléfono</label>
                                    <input type="number" class="form-control" id="employeePhone" name="telefono">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="employeeEmail" name="email">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeeRole" class="form-label">Rol *</label>
                                    <select class="form-select" id="employeeRole" name="role" required>
                                        <option value="">Seleccionar rol</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="EMPLEADO">Empleado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="employeeAddress" class="form-label">Dirección *</label>
                                <input type="text" class="form-control" id="employeeAddress" name="domicilio" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="employeeUsername" class="form-label">Nombre de Usuario *</label>
                                    <input type="text" class="form-control" id="employeeUsername" name="username" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="employeePassword" class="form-label">Contraseña *</label>
                                    <input type="password" class="form-control" id="employeePassword" name="password" required>
                                </div>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Agregar Empleado
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditEmployeeModal() {
    return `
        <div class="modal fade" id="editEmployeeModal" tabindex="-1" aria-labelledby="editEmployeeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editEmployeeModalLabel">
                            <i class="bi bi-pencil"></i> Editar Empleado
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editEmployeeForm">
                            <input type="hidden" id="editEmployeeId" name="id">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeName" class="form-label">Nombre *</label>
                                    <input type="text" class="form-control" id="editEmployeeName" name="nombre" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeLastName" class="form-label">Apellido *</label>
                                    <input type="text" class="form-control" id="editEmployeeLastName" name="apellido" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeDni" class="form-label">DNI *</label>
                                    <input type="number" class="form-control" id="editEmployeeDni" name="dni" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeePhone" class="form-label">Teléfono</label>
                                    <input type="number" class="form-control" id="editEmployeePhone" name="telefono">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="editEmployeeEmail" name="email">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeRole" class="form-label">Rol *</label>
                                    <select class="form-select" id="editEmployeeRole" name="role" required>
                                        <option value="">Seleccionar rol</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="EMPLEADO">Empleado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeAddress" class="form-label">Dirección *</label>
                                <input type="text" class="form-control" id="editEmployeeAddress" name="domicilio" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeeUsername" class="form-label">Nombre de Usuario *</label>
                                    <input type="text" class="form-control" id="editEmployeeUsername" name="username" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editEmployeePassword" class="form-label">Nueva Contraseña</label>
                                    <input type="password" class="form-control" id="editEmployeePassword" name="password" placeholder="Dejar vacío para mantener actual">
                                </div>
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

function createViewEmployeeModal() {
    return `
        <div class="modal fade" id="viewEmployeeModal" tabindex="-1" aria-labelledby="viewEmployeeModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewEmployeeModalLabel">
                            <i class="bi bi-eye"></i> Detalles del Empleado
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body" id="viewEmployeeContent">
                        <!-- El contenido se cargará dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Configura los event listeners para los formularios
function setupEmployeeEventListeners() {
    // Para agregar un empleado
    handleFormSubmit(
        'addEmployeeForm',
        'http://localhost:8080/empleado/create',
        'POST',
        'Empleado agregado exitosamente',
        () => {
            fetchEmployees(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
            modal.hide();
        }
    );

    // Para editar un empleado
    handleFormSubmit(
        'editEmployeeForm',
        (form) => {
            const id = form.elements['id'].value;
            return `http://localhost:8080/empleado/update/${id}`;
        },
        'PUT',
        'Empleado actualizado con éxito',
        () => {
            fetchEmployees(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
            modal.hide();
        }
    );
}

// Función para abrir modales
window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

// Ver detalles del empleado
window.viewEmployee = function(id) {
    const employee = employees.find(e => e.id === id) || allEmployees.find(e => e.id === id);
    if (employee) {
        const content = document.getElementById('viewEmployeeContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${employee.id}</p>
                                    <p><strong>Nombre completo:</strong> ${employee.nombre} ${employee.apellido}</p>
                                    <p><strong>DNI:</strong> ${employee.dni}</p>
                                    <p><strong>Teléfono:</strong> ${employee.telefono || 'No especificado'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Email:</strong> ${employee.email || 'No especificado'}</p>
                                    <p><strong>Dirección:</strong> ${employee.domicilio}</p>
                                    <p><strong>Username:</strong> <code>${employee.username}</code></p>
                                    <p><strong>Rol:</strong> <span class="badge ${employee.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">${employee.rol}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewEmployeeModal'));
        modal.show();
    } else {
        alert('Empleado no encontrado');
    }
}

// Editar empleado
window.editEmployee = function(id) {
    const employee = employees.find(e => e.id === id) || allEmployees.find(e => e.id === id);
    if (employee) {
        document.getElementById('editEmployeeId').value = employee.id;
        document.getElementById('editEmployeeName').value = employee.nombre;
        document.getElementById('editEmployeeLastName').value = employee.apellido;
        document.getElementById('editEmployeeDni').value = employee.dni;
        document.getElementById('editEmployeePhone').value = employee.telefono || '';
        document.getElementById('editEmployeeEmail').value = employee.email || '';
        document.getElementById('editEmployeeAddress').value = employee.domicilio;
        document.getElementById('editEmployeeUsername').value = employee.username;
        document.getElementById('editEmployeeRole').value = employee.rol;
        
        // No prellenar la contraseña por seguridad
        document.getElementById('editEmployeePassword').value = '';
        
        openModal('editEmployee');
    } else {
        alert('Empleado no encontrado');
    }
}

// Eliminar empleado
window.deleteEmployee = function(id) {
    const employee = employees.find(e => e.id === id) || allEmployees.find(e => e.id === id);
    const employeeName = employee ? `${employee.nombre} ${employee.apellido}` : 'este empleado';
    
    if (confirm(`¿Está seguro de que desea eliminar a ${employeeName}?`)) {
        fetch(`http://localhost:8080/empleado/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Empleado eliminado con éxito');
                fetchEmployees(); // Recarga la lista completa
            } else {
                alert(response.status === 400 ? 'Error: el empleado no existe o no se puede eliminar.' : 'Error al eliminar empleado');
                throw new Error('Error al eliminar empleado. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error al eliminar el empleado:', error);
            alert('Hubo un problema al eliminar el empleado.');
        });
    }
}

