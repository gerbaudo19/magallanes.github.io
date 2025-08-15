import { fetchData, handleFormSubmit, getAuthHeader } from './main.js';

let tipoPrendas = [];
let allTipoPrendas = []; // Guardamos todos los tipos de prenda para poder restaurar la lista completa

export function initTipoPrenda(container) {
    container.innerHTML = `
        <h2>Tipos de Prenda</h2>
        
        <!-- Sistema de filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <h6 class="card-title mb-3">Filtrar Tipos de Prenda</h6>
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="filterTipoPrendaType" class="form-label">Filtrar por:</label>
                        <select class="form-select" id="filterTipoPrendaType">
                            <option value="id">ID</option>
                            <option value="nombre">Nombre</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="filterTipoPrendaValue" class="form-label">Valor de búsqueda:</label>
                        <input type="text" class="form-control" id="filterTipoPrendaValue" placeholder="Ingrese el valor a buscar...">
                    </div>
                    <div class="col-md-5">
                        <button class="btn btn-primary me-2" onclick="filterTipoPrendas()">
                            <i class="bi bi-search"></i> Buscar
                        </button>
                        <button class="btn btn-secondary" onclick="clearTipoPrendaFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-info" id="tipoPrendaCount">Total: 0 tipos de prenda</span>
            </div>
            <button class="btn btn-primary" onclick="openModal('addTipoPrenda')">
                <i class="bi bi-plus-circle"></i> Agregar Nuevo Tipo de Prenda
            </button>
        </div>
        
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
        
        <!-- Mensaje cuando no hay resultados -->
        <div id="noTipoPrendaResultsMessage" class="alert alert-info text-center d-none">
            <i class="bi bi-info-circle"></i> No se encontraron tipos de prenda con los criterios especificados.
        </div>
        
        ${createTipoPrendaModals()}
    `;

    fetchTipoPrendas();
    setupTipoPrendaEventListeners();
    setupTipoPrendaFilterEventListeners();
}

// Configura los event listeners para los filtros
function setupTipoPrendaFilterEventListeners() {
    // Búsqueda al presionar Enter
    const filterValue = document.getElementById('filterTipoPrendaValue');
    if (filterValue) {
        filterValue.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterTipoPrendas();
            }
        });
    }
}

// Función para filtrar tipos de prenda
window.filterTipoPrendas = function() {
    const filterType = document.getElementById('filterTipoPrendaType').value;
    const filterValue = document.getElementById('filterTipoPrendaValue').value.trim();
    
    if (!filterValue) {
        alert('Por favor ingrese un valor para buscar');
        return;
    }

    // Mostrar indicador de carga
    showTipoPrendaLoading(true);
    
    let endpoint;
    switch(filterType) {
        case 'id':
            endpoint = `http://localhost:8080/api/tipoPrendas/${filterValue}`;
            break;
        case 'nombre':
            endpoint = `http://localhost:8080/api/tipoPrendas/buscar?nombre=${encodeURIComponent(filterValue)}`;
            break;
        default:
            endpoint = 'http://localhost:8080/api/tipoPrendas';
    }

    fetchData(endpoint, data => {
        showTipoPrendaLoading(false);
        
        if (filterType === 'id') {
            // Para búsquedas por ID que devuelven un solo TipoPrenda
            if (data && Object.keys(data).length > 0) {
                tipoPrendas = [data];
            } else {
                tipoPrendas = [];
            }
        } else {
            // Para búsqueda por nombre que devuelve List<TipoPrenda>
            tipoPrendas = data || [];
        }
        
        updateTipoPrendaTable();
        updateTipoPrendaCount();
        showNoTipoPrendaResults(tipoPrendas.length === 0);
    }, error => {
        showTipoPrendaLoading(false);
        console.error('Error al filtrar tipos de prenda:', error);
        tipoPrendas = [];
        updateTipoPrendaTable();
        updateTipoPrendaCount();
        showNoTipoPrendaResults(true);
    });
}

// Función para limpiar filtros
window.clearTipoPrendaFilters = function() {
    document.getElementById('filterTipoPrendaValue').value = '';
    document.getElementById('filterTipoPrendaType').value = 'id';
    tipoPrendas = [...allTipoPrendas];
    updateTipoPrendaTable();
    updateTipoPrendaCount();
    showNoTipoPrendaResults(false);
}

// Muestra/oculta el indicador de carga
function showTipoPrendaLoading(show) {
    const tableBody = document.querySelector('#tipoPrendaTable tbody');
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Buscando tipos de prenda...
                </td>
            </tr>
        `;
    }
}

// Muestra/oculta el mensaje de sin resultados
function showNoTipoPrendaResults(show) {
    const noResultsMessage = document.getElementById('noTipoPrendaResultsMessage');
    if (noResultsMessage) {
        if (show) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

// Actualiza el contador de tipos de prenda
function updateTipoPrendaCount() {
    const tipoPrendaCount = document.getElementById('tipoPrendaCount');
    if (tipoPrendaCount) {
        tipoPrendaCount.textContent = `Total: ${tipoPrendas.length} tipo${tipoPrendas.length !== 1 ? 's' : ''} de prenda`;
    }
}

function fetchTipoPrendas() {
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        tipoPrendas = data || [];
        allTipoPrendas = [...tipoPrendas]; // Guardamos copia de todos los tipos de prenda
        updateTipoPrendaTable();
        updateTipoPrendaCount();
        showNoTipoPrendaResults(false);
    });
}

function updateTipoPrendaTable() {
    const tableBody = document.querySelector('#tipoPrendaTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        tipoPrendas.forEach(tipoPrenda => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><strong>${tipoPrenda.id}</strong></td>
                <td>${tipoPrenda.nombre}</td>
                <td>${tipoPrenda.descripcion}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewTipoPrenda(${tipoPrenda.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editTipoPrenda(${tipoPrenda.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTipoPrenda(${tipoPrenda.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
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
        ${createViewTipoPrendaModal()}
    `;
}

function createAddTipoPrendaModals() {
    return `
        <div class="modal fade" id="addTipoPrendaModal" tabindex="-1" aria-labelledby="addTipoPrendaModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addTipoPrendaModalLabel">
                            <i class="bi bi-plus-circle"></i> Agregar Nuevo Tipo de Prenda
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addTipoPrendaForm">
                            <div class="mb-3">
                                <label for="tipoPrendaName" class="form-label">Nombre *</label>
                                <input type="text" class="form-control" id="tipoPrendaName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="tipoPrendaDescription" class="form-label">Descripción *</label>
                                <textarea class="form-control" id="tipoPrendaDescription" name="descripcion" rows="3" required></textarea>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Agregar Tipo de Prenda
                                </button>
                            </div>
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
                        <h5 class="modal-title" id="editTipoPrendaModalLabel">
                            <i class="bi bi-pencil"></i> Editar Tipo de Prenda
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTipoPrendaForm">
                            <input type="hidden" id="editTipoPrendaId" name="id">
                            <div class="mb-3">
                                <label for="editTipoPrendaName" class="form-label">Nombre *</label>
                                <input type="text" class="form-control" id="editTipoPrendaName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTipoPrendaDescription" class="form-label">Descripción *</label>
                                <textarea class="form-control" id="editTipoPrendaDescription" name="descripcion" rows="3" required></textarea>
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

function createViewTipoPrendaModal() {
    return `
        <div class="modal fade" id="viewTipoPrendaModal" tabindex="-1" aria-labelledby="viewTipoPrendaModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewTipoPrendaModalLabel">
                            <i class="bi bi-eye"></i> Detalles del Tipo de Prenda
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body" id="viewTipoPrendaContent">
                        <!-- El contenido se cargará dinámicamente -->
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
        () => {
            fetchTipoPrendas(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTipoPrendaModal'));
            modal.hide();
        }
    );

    handleFormSubmit(
        'editTipoPrendaForm',
        (form) => {
            const id = form.elements['id'].value; // Obtén el ID del formulario correctamente
            return `http://localhost:8080/api/tipoPrendas/${id}`;
        },
        'PUT', 
        'Tipo de Prenda actualizado exitosamente', 
        () => {
            fetchTipoPrendas(); // Recarga la lista completa
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTipoPrendaModal'));
            modal.hide();
        }
    );
}

window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewTipoPrenda = function(id) {
    const tipoPrenda = tipoPrendas.find(tp => tp.id === id) || allTipoPrendas.find(tp => tp.id === id);
    if (tipoPrenda) {
        const content = document.getElementById('viewTipoPrendaContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${tipoPrenda.id}</p>
                                    <p><strong>Nombre:</strong> ${tipoPrenda.nombre}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Descripción:</strong></p>
                                    <p class="text-muted">${tipoPrenda.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewTipoPrendaModal'));
        modal.show();
    } else {
        alert('Tipo de Prenda no encontrado');
    }
}

window.editTipoPrenda = function(id) {
    const tipoPrenda = tipoPrendas.find(tp => tp.id === id) || allTipoPrendas.find(tp => tp.id === id);
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
    const tipoPrenda = tipoPrendas.find(tp => tp.id === id) || allTipoPrendas.find(tp => tp.id === id);
    const tipoPrendaName = tipoPrenda ? tipoPrenda.nombre : 'este tipo de prenda';
    
    if (confirm(`¿Está seguro de que desea eliminar ${tipoPrendaName}?`)) {
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
                fetchTipoPrendas(); // Recarga la lista completa
            } else {
                alert('Error al eliminar el tipo de prenda');
                throw new Error('Error al eliminar tipo de prenda. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error al eliminar el tipo de prenda:', error);
            alert('Hubo un problema al eliminar el tipo de prenda.');
        });
    }
}