import { fetchData, handleFormSubmit } from './main.js';

let employees = [];

export function initEmployees(container) {
    container.innerHTML = `
        <h2>Empleados</h2>
        <button class="btn btn-primary mb-3" onclick="openModal('addEmployee')">Agregar Nuevo Empleado</button>
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
                        <th>Dirección</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de empleados se agregarán aquí dinámicamente -->
                </tbody>
            </table>
        </div>
        ${createEmployeeModals()}
    `;

    fetchEmployees();
    setupEmployeeEventListeners();
}

function fetchEmployees() {
    fetchData('http://localhost:8080/empleado/list', data => {
        employees = data;
        updateEmployeeTable();
    });
}

function updateEmployeeTable() {
    const tableBody = document.querySelector('#employeeTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        employees.forEach(employee => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.nombre}</td>
                <td>${employee.apellido}</td>
                <td>${employee.dni}</td>
                <td>${employee.telefono}</td>
                <td>${employee.email}</td>
                <td>${employee.domicilio}</td>
                <td>${employee.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewEmployee(${employee.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editEmployee(${employee.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${employee.id})">Eliminar</button>
                </td>
            `;
        });
    }
}

// Crea los modales para agregar y editar empleados
function createEmployeeModals() {
    return `
        ${createAddEmployeeModals()}
        ${createEditEmployeeModal()}
    `;
}

function createAddEmployeeModals() {
    return `
        <div class="modal fade" id="addEmployeeModal" tabindex="-1" aria-labelledby="addEmployeeModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addEmployeeModalLabel">Agregar Nuevo Empleado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addEmployeeForm">
                            <div class="mb-3">
                                <label for="employeeName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="employeeName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeLastName" class="form-label">Apellido</label>
                                <input type="text" class="form-control" id="employeeLastName" name="apellido" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeDni" class="form-label">DNI</label>
                                <input type="text" class="form-control" id="employeeDni" name="dni" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeePhone" class="form-label">Teléfono</label>
                                <input type="text" class="form-control" id="employeePhone" name="telefono" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="employeeEmail" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeAddress" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="employeeAddress" name="domicilio" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeUsername" class="form-label">Nombre de Usuario</label>
                                <input type="text" class="form-control" id="employeeUsername" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeePassword" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="employeePassword" name="password" required>
                            </div>
                            <div class="mb-3">
                                <label for="employeeRole" class="form-label">Rol</label>
                                <select class="form-select" id="employeeRole" name="role" required>
                                    <option value="">Seleccionar rol</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="EMPLEADO">Empleado</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Agregar Empleado</button>
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
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editEmployeeModalLabel">Editar Empleado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editEmployeeForm">
                            <input type="hidden" id="editEmployeeId" name="id">
                            <div class="mb-3">
                                <label for="editEmployeeName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="editEmployeeName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeLastName" class="form-label">Apellido</label>
                                <input type="text" class="form-control" id="editEmployeeLastName" name="apellido" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeDni" class="form-label">DNI</label>
                                <input type="text" class="form-control" id="editEmployeeDni" name="dni" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeePhone" class="form-label">Teléfono</label>
                                <input type="text" class="form-control" id="editEmployeePhone" name="telefono" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="editEmployeeEmail" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeAddress" class="form-label">Dirección</label>
                                <input type="text" class="form-control" id="editEmployeeAddress" name="domicilio" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeUsername" class="form-label">Nombre de Usuario</label>
                                <input type="text" class="form-control" id="editEmployeeUsername" name="username" required>
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeePassword" class="form-label">Contraseña</label>
                                <input type="password" class="form-control" id="editEmployeePassword" name="password" value="contraseñaActual">
                            </div>
                            <div class="mb-3">
                                <label for="editEmployeeRole" class="form-label">Rol</label>
                                <select class="form-select" id="editEmployeeRole" name="role" required>
                                    <option value="">Seleccionar rol</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="EMPLEADO">Empleado</option>
                                </select>
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
setupEmployeeEventListeners();

function setupEmployeeEventListeners() {
    handleFormSubmit(
        'addEmployeeForm', 
        'http://localhost:8080/empleado/create', 
        'POST', 
        'Empleado agregado con éxito', 
        fetchEmployees
    );

    handleFormSubmit(
        'editEmployeeForm',
        (form) => {
            const id = form.elements['id'].value;
            return `http://localhost:8080/empleado/update/${id}`
        },
        'PUT', 
        'Empleado actualizado con éxito', 
        fetchEmployees
    );
}

window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewEmployee = function(id) {
    const employee = employees.find(e => e.id === id);
    if (employee) {
        alert(JSON.stringify(employee, null, 2));
    } else {
        alert('Empleado no encontrado');
    }
}

window.editEmployee = function(id) {
    const employee = employees.find(e => e.id === id);
    if (employee) {
        document.getElementById('editEmployeeId').value = employee.id;
        document.getElementById('editEmployeeName').value = employee.nombre;
        document.getElementById('editEmployeeLastName').value = employee.apellido;
        document.getElementById('editEmployeeDni').value = employee.dni;
        document.getElementById('editEmployeePhone').value = employee.telefono;
        document.getElementById('editEmployeeEmail').value = employee.email;
        document.getElementById('editEmployeeAddress').value = employee.domicilio;
        document.getElementById('editEmployeeUsername').value = employee.username;
        document.getElementById('editEmployeeRole').value = employee.role;

        // No prellenar la contraseña, ya que la contraseña debe ser opcional de editar
        document.getElementById('editEmployeePassword').value = ''; // Dejar vacío para que el usuario ingrese una nueva si lo desea

        openModal('editEmployee');
    } else {
        alert('Empleado no encontrado');
    }
}


window.deleteEmployee = function(id) {
    if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
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
                fetchEmployees();
            } else {
                throw new Error('Error al eliminar el empleado. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error al eliminar el empleado:', error);
            alert('Hubo un problema al eliminar el empleado.');
        });
    }
}


