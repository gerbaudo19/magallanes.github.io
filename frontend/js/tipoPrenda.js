import { fetchData, handleFormSubmit, getAuthHeader } from './main.js';


let tipoPrendas = [];

export function initTipoPrenda(container) {
    container.innerHTML = `
        <h2>Tipos de Prenda</h2>
        <button class="btn btn-primary mb-3" onclick="openModal('addTipoPrenda')">Agregar Nuevo Tipo de Prenda</button>
        <div class="table-responsive">
            <table class="table table-striped" id="tipoPrendaTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de Tipo de Prenda se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        ${createTipoPrendaModals()}
    `;

    fetchTipoPrendas();
    setupTipoPrendaEventListeners();
}

function fetchTipoPrendas() {
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        tipoPrendas = data;
        updateTipoPrendaTable();
    });
}

function updateTipoPrendaTable() {
    const tableBody = document.querySelector('#tipoPrendaTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        tipoPrendas.forEach(tipoPrenda => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${tipoPrenda.id}</td>
                <td>${tipoPrenda.nombre}</td>
                <td>${tipoPrenda.descripcion}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewTipoPrenda(${tipoPrenda.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editTipoPrenda(${tipoPrenda.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTipoPrenda(${tipoPrenda.id})">Eliminar</button>
                </td>
            `;
        });
    }
}

// Crea los modales para agregar y editar tipos Productos
function createTipoPrendaModals() {
    return `
        ${createAddTipoPrendaModals()}
        ${createEditTipoPrendaModals()}
    `;
}

function createAddTipoPrendaModals() {
    return `
        <div class="modal fade" id="addTipoPrendaModal" tabindex="-1" aria-labelledby="addTipoPrendaModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addTipoPrendaModalLabel">Agregar Nuevo Tipo de Prenda</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addTipoPrendaForm">
                            <div class="mb-3">
                                <label for="tipoPrendaName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="tipoPrendaName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="tipoPrendaDescription" class="form-label">Descripción</label>
                                <textarea class="form-control" id="tipoPrendaDescription" name="descripcion" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Agregar Tipo de Prenda</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditTipoPrendaModals() {
    return `
        <div class="modal fade" id="editTipoPrendaModal" tabindex="-1" aria-labelledby="editTipoPrendaModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editTipoPrendaModalLabel">Editar Tipo de Prenda</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTipoPrendaForm">
                            <input type="hidden" id="editTipoPrendaId" name="id">
                            <div class="mb-3">
                                <label for="editTipoPrendaName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="editTipoPrendaName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTipoPrendaDescription" class="form-label">Descripción</label>
                                <textarea class="form-control" id="editTipoPrendaDescription" name="descripcion" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupTipoPrendaEventListeners() {
    handleFormSubmit(
        'addTipoPrendaForm', 
        'http://localhost:8080/api/tipoPrendas', 
        'POST', 
        'Tipo de Prenda agregado exitosamente', 
        fetchTipoPrendas
    );

    handleFormSubmit(
        'editTipoPrendaForm',
        (form) => {
            const id = form.elements['id'].value; // Obtén el ID del formulario correctamente
            return `http://localhost:8080/api/tipoPrendas/${id}`;
        },
        'PUT', 
        'Tipo de Prenda actualizado exitosamente', 
        fetchTipoPrendas
    );
}

window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewTipoPrenda = function(id) {
    const tipoPrenda = tipoPrendas.find(tp => tp.id === id);
    if (tipoPrenda) {
        alert(JSON.stringify(tipoPrenda, null, 2));
    } else {
        alert('Tipo de Prenda no encontrado');
    }
}

window.editTipoPrenda = function(id) {
    const tipoPrenda = tipoPrendas.find(tp => tp.id === id);
    if (tipoPrenda) {
        document.getElementById('editTipoPrendaId').value = tipoPrenda.id;
        document.getElementById('editTipoPrendaName').value = tipoPrenda.nombre;
        document.getElementById('editTipoPrendaDescription').value = tipoPrenda.descripcion;
        openModal('editTipoPrenda');
    } else {
        alert('Tipo de Prenda no encontrado');
    }
}

window.deleteTipoPrenda = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de prenda?')) {
        fetch(`http://localhost:8080/api/tipoPrendas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Tipo de Prenda eliminado exitosamente');
                fetchTipoPrendas();
            } else {
                alert('Error al eliminar el tipo de prenda');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}