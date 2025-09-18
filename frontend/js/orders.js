import { fetchData, getAuthHeader } from './main.js';

let orders = [];
let allOrders = []; // Guardamos todas las órdenes para poder restaurar la lista completa
let clients = [];
let employees = [];
let products = [];
let currentEditingOrder = null; // Para guardar la orden que se está editando

export function initOrders(container) {
    container.innerHTML = `
        <h2>Órdenes</h2>
        
        <!-- Sistema de filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <h6 class="card-title mb-3">Filtrar Órdenes</h6>
                <div class="row align-items-end">
                    <div class="col-md-2">
                        <label for="filterOrderType" class="form-label">Filtrar por:</label>
                        <select class="form-select" id="filterOrderType">
                            <option value="cliente">Cliente</option>
                            <option value="empleado">Empleado</option>
                            <option value="fecha">Rango de Fechas</option>
                            <option value="precio">Rango de Precio</option>
                        </select>
                    </div>
                    <div class="col-md-6" id="filterInputContainer">
                        <!-- Los campos de filtro se cargarán dinámicamente aquí -->
                    </div>
                    <div class="col-md-4">
                        <button class="btn btn-primary me-2" onclick="filterOrders()">
                            <i class="bi bi-search"></i> Buscar
                        </button>
                        <button class="btn btn-secondary" onclick="clearOrderFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-info" id="orderCount">Total: 0 órdenes</span>
            </div>
            <button class="btn btn-primary" onclick="openAddOrderModal()">
                <i class="bi bi-plus-circle"></i> Agregar Nueva Orden
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-striped" id="orderTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Total</th>
                        <th>Forma de Pago</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de órdenes se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        
        <!-- Mensaje cuando no hay resultados -->
        <div id="noOrderResultsMessage" class="alert alert-info text-center d-none">
            <i class="bi bi-info-circle"></i> No se encontraron órdenes con los criterios especificados.
        </div>
        
        ${createOrderModals()}
    `;

    fetchOrders();
    fetchClients();
    fetchEmployees();
    fetchProducts();
    setupOrderEventListeners();
    setupOrderFilterEventListeners();
}

// Configura los event listeners para los filtros
function setupOrderFilterEventListeners() {
    const filterType = document.getElementById('filterOrderType');
    if (filterType) {
        filterType.addEventListener('change', updateFilterInputs);
        updateFilterInputs(); // Inicializar con el primer tipo
    }
}

// Actualiza los campos de entrada según el tipo de filtro seleccionado
function updateFilterInputs() {
    const filterType = document.getElementById('filterOrderType').value;
    const container = document.getElementById('filterInputContainer');
    
    switch(filterType) {
        case 'cliente':
            container.innerHTML = `
                <label for="filterClientValue" class="form-label">Seleccionar Cliente:</label>
                <select class="form-select" id="filterClientValue">
                    <option value="">Seleccionar cliente...</option>
                    ${clients.map(client => `<option value="${client.id}">${client.nombre} ${client.apellido}</option>`).join('')}
                </select>
            `;
            break;
        case 'empleado':
            container.innerHTML = `
                <label for="filterEmployeeValue" class="form-label">Seleccionar Empleado:</label>
                <select class="form-select" id="filterEmployeeValue">
                    <option value="">Seleccionar empleado...</option>
                    ${employees.map(employee => `<option value="${employee.id}">${employee.nombre} ${employee.apellido}</option>`).join('')}
                </select>
            `;
            break;
        case 'fecha':
            container.innerHTML = `
                <div class="row">
                    <div class="col-6">
                        <label for="filterFechaInicio" class="form-label">Fecha Inicio:</label>
                        <input type="date" class="form-control" id="filterFechaInicio">
                    </div>
                    <div class="col-6">
                        <label for="filterFechaFin" class="form-label">Fecha Fin:</label>
                        <input type="date" class="form-control" id="filterFechaFin">
                    </div>
                </div>
            `;
            break;
        case 'precio':
            container.innerHTML = `
                <div class="row">
                    <div class="col-6">
                        <label for="filterPrecioMin" class="form-label">Precio Mínimo:</label>
                        <input type="number" step="0.01" class="form-control" id="filterPrecioMin" placeholder="0.00">
                    </div>
                    <div class="col-6">
                        <label for="filterPrecioMax" class="form-label">Precio Máximo:</label>
                        <input type="number" step="0.01" class="form-control" id="filterPrecioMax" placeholder="999999.99">
                    </div>
                </div>
            `;
            break;
    }
}

// Función para filtrar órdenes
window.filterOrders = function() {
    const filterType = document.getElementById('filterOrderType').value;
    
    // Mostrar indicador de carga
    showOrderLoading(true);
    
    let endpoint;
    let params = new URLSearchParams();
    
    switch(filterType) {
        case 'cliente':
            const clienteId = document.getElementById('filterClientValue').value;
            if (!clienteId) {
                alert('Por favor seleccione un cliente');
                showOrderLoading(false);
                return;
            }
            endpoint = `http://localhost:8080/api/ordenes/filter/cliente/${clienteId}`;
            break;
        case 'empleado':
            const empleadoId = document.getElementById('filterEmployeeValue').value;
            if (!empleadoId) {
                alert('Por favor seleccione un empleado');
                showOrderLoading(false);
                return;
            }
            endpoint = `http://localhost:8080/api/ordenes/filter/empleado/${empleadoId}`;
            break;
        case 'fecha':
            const fechaInicio = document.getElementById('filterFechaInicio').value;
            const fechaFin = document.getElementById('filterFechaFin').value;
            if (!fechaInicio || !fechaFin) {
                alert('Por favor ingrese ambas fechas');
                showOrderLoading(false);
                return;
            }
            params.append('fechaInicio', fechaInicio);
            params.append('fechaFin', fechaFin);
            endpoint = `http://localhost:8080/api/ordenes/filter/fechas?${params.toString()}`;
            break;
        case 'precio':
            const precioMin = document.getElementById('filterPrecioMin').value;
            const precioMax = document.getElementById('filterPrecioMax').value;
            if (!precioMin || !precioMax) {
                alert('Por favor ingrese ambos valores de precio');
                showOrderLoading(false);
                return;
            }
            params.append('min', precioMin);
            params.append('max', precioMax);
            endpoint = `http://localhost:8080/api/ordenes/filter/precio?${params.toString()}`;
            break;
        default:
            endpoint = 'http://localhost:8080/api/ordenes';
    }

    fetchData(endpoint, data => {
        showOrderLoading(false);
        orders = data || [];
        updateOrderTable();
        updateOrderCount();
        showNoOrderResults(orders.length === 0);
    }, error => {
        showOrderLoading(false);
        console.error('Error al filtrar órdenes:', error);
        orders = [];
        updateOrderTable();
        updateOrderCount();
        showNoOrderResults(true);
    });
}

// Función para limpiar filtros
window.clearOrderFilters = function() {
    document.getElementById('filterOrderType').value = 'cliente';
    updateFilterInputs();
    orders = [...allOrders];
    updateOrderTable();
    updateOrderCount();
    showNoOrderResults(false);
}

// Muestra/oculta el indicador de carga
function showOrderLoading(show) {
    const tableBody = document.querySelector('#orderTable tbody');
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Buscando órdenes...
                </td>
            </tr>
        `;
    }
}

// Muestra/oculta el mensaje de sin resultados
function showNoOrderResults(show) {
    const noResultsMessage = document.getElementById('noOrderResultsMessage');
    if (noResultsMessage) {
        if (show) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

// Actualiza el contador de órdenes
function updateOrderCount() {
    const orderCount = document.getElementById('orderCount');
    if (orderCount) {
        orderCount.textContent = `Total: ${orders.length} orden${orders.length !== 1 ? 'es' : ''}`;
    }
}

function fetchOrders() {
    fetchData('http://localhost:8080/api/ordenes', data => {
        orders = data || [];
        allOrders = [...orders]; // Guardamos copia de todas las órdenes
        updateOrderTable();
        updateOrderCount();
        showNoOrderResults(false);
    });
}

function fetchClients() {
    fetchData('http://localhost:8080/cliente/list', data => {
        clients = data || [];
        updateClientDropdown();
        updateFilterInputs(); // Actualizar filtros después de cargar clientes
    });
}

function fetchEmployees() {
    fetchData('http://localhost:8080/empleado/list', data => {
        employees = data || [];
        updateEmployeeDropdown();
        updateFilterInputs(); // Actualizar filtros después de cargar empleados
    });
}

function fetchProducts() {
    fetchData('http://localhost:8080/api/productos', data => {
        products = data || [];
    });
}

// Función para refrescar productos desde el backend
function refreshProducts() {
    return new Promise((resolve, reject) => {
        fetchData('http://localhost:8080/api/productos', data => {
            products = data || [];
            resolve(products);
        }, error => {
            console.error('Error al refrescar productos:', error);
            reject(error);
        });
    });
}

function updateOrderTable() {
    const tableBody = document.querySelector('#orderTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        orders.forEach(order => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${order.cliente.nombre} ${order.cliente.apellido}</td>
                <td>${order.empleado.nombre} ${order.empleado.apellido}</td>
                <td>${order.fecha}</td>
                <td>${order.hora}</td>
                <td><span class="badge bg-success">$${order.precioTotal.toFixed(2)}</span></td>
                <td><span class="badge bg-info">${order.formaPago.nombre}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${order.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editOrder(${order.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${order.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        });
    }
}

function updateClientDropdown() {
    const clientSelect = document.getElementById('orderClient');
    const editClientSelect = document.getElementById('editOrderClient');
    const options = clients.map(client => 
        `<option value="${client.id}">${client.nombre} ${client.apellido}</option>`
    ).join('');
    
    if (clientSelect) clientSelect.innerHTML = `<option value="">Seleccionar cliente</option>${options}`;
    if (editClientSelect) editClientSelect.innerHTML = `<option value="">Seleccionar cliente</option>${options}`;
}

function updateEmployeeDropdown() {
    const employeeSelect = document.getElementById('orderEmployee');
    const editEmployeeSelect = document.getElementById('editOrderEmployee');
    const options = employees.map(employee => 
        `<option value="${employee.id}">${employee.nombre} ${employee.apellido}</option>`
    ).join('');
    
    if (employeeSelect) employeeSelect.innerHTML = `<option value="">Seleccionar empleado</option>${options}`;
    if (editEmployeeSelect) editEmployeeSelect.innerHTML = `<option value="">Seleccionar empleado</option>${options}`;
}

// Función para generar opciones de productos sin talles
function generateProductOptions(selectedProductId = '') {
    let options = '<option value="">Seleccionar producto...</option>';
    
    products.forEach(product => {
        const selected = (product.id == selectedProductId) ? 'selected' : '';
        const hasStock = product.stockPorTalle && Object.values(product.stockPorTalle).some(stock => stock > 0);
        if (hasStock) {
            options += `<option value="${product.id}" ${selected}>${product.nombre} - $${product.precio.toFixed(2)}</option>`;
        }
    });
    
    return options;
}

// Función para generar opciones de talles para un producto específico
function generateTalleOptions(productId, selectedTalle = '', isEditing = false, originalProductId = null, originalTalle = null, originalQuantity = 0) {
    let options = '<option value="">Seleccionar talle...</option>';
    
    if (!productId) return options;
    
    const product = products.find(p => p.id == productId);
    if (product && product.stockPorTalle) {
        Object.entries(product.stockPorTalle).forEach(([talle, stock]) => {
            let availableStock = stock;
            
            // Si estamos editando y este es el mismo producto y talle original, 
            // agregamos la cantidad original al stock disponible
            if (isEditing && originalProductId == productId && originalTalle === talle) {
                availableStock += originalQuantity;
            }
            
            if (availableStock > 0) {
                const selected = (talle === selectedTalle) ? 'selected' : '';
                options += `<option value="${talle}" ${selected}>${talle} (Stock: ${availableStock})</option>`;
            }
        });
    }
    
    return options;
}

// Función para actualizar las opciones de talle cuando cambia el producto
function updateTalleOptions(productSelect, talleSelect, selectedTalle = '', isEditing = false, originalProductId = null, originalTalle = null, originalQuantity = 0) {
    const productId = productSelect.value;
    talleSelect.innerHTML = generateTalleOptions(productId, selectedTalle, isEditing, originalProductId, originalTalle, originalQuantity);
    
    // Habilitar/deshabilitar el select de talle
    talleSelect.disabled = !productId;
}

// Función para calcular el stock disponible considerando la orden en edición
function getAvailableStock(productId, talle, isEditing = false, originalProductId = null, originalTalle = null, originalQuantity = 0) {
    const product = products.find(p => p.id == productId);
    if (!product || !product.stockPorTalle) return 0;
    
    let availableStock = product.stockPorTalle[talle] || 0;
    
    // Si estamos editando y este es el mismo producto y talle original,
    // agregamos la cantidad original al stock disponible
    if (isEditing && originalProductId == productId && originalTalle === talle) {
        availableStock += originalQuantity;
    }
    
    return availableStock;
}

function createOrderModals() {
    return `
        ${createAddOrderModal()}
        ${createEditOrderModal()}
        ${createViewOrderModal()}
    `;
}

function createAddOrderModal() {
    return `
        <div class="modal fade" id="addOrderModal" tabindex="-1" aria-labelledby="addOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addOrderModalLabel">
                            <i class="bi bi-plus-circle"></i> Agregar Nueva Orden
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addOrderForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="orderDate" class="form-label">Fecha *</label>
                                    <input type="date" class="form-control" id="orderDate" name="fecha" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="orderTime" class="form-label">Hora *</label>
                                    <input type="time" class="form-control" id="orderTime" name="hora" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="orderClient" class="form-label">Cliente *</label>
                                    <select class="form-select" id="orderClient" name="clienteId" required>
                                        <option value="">Seleccionar cliente</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="orderEmployee" class="form-label">Empleado *</label>
                                    <select class="form-select" id="orderEmployee" name="empleadoId" required>
                                        <option value="">Seleccionar empleado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="orderPaymentMethod" class="form-label">Método de Pago *</label>
                                <select class="form-select" id="orderPaymentMethod" name="formaPagoId" required>
                                    <option value="">Seleccionar método de pago</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Tarjeta de crédito</option>
                                    <option value="3">Tarjeta de débito</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Productos *</label>
                                <div id="orderProductsContainer">
                                    <!-- Los productos se agregarán dinámicamente -->
                                </div>
                                <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="addProductToOrder()">
                                    <i class="bi bi-plus"></i> Agregar Producto
                                </button>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Agregar Orden
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditOrderModal() {
    return `
        <div class="modal fade" id="editOrderModal" tabindex="-1" aria-labelledby="editOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editOrderModalLabel">
                            <i class="bi bi-pencil"></i> Editar Orden
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editOrderForm">
                            <input type="hidden" id="editOrderId" name="id">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editOrderDate" class="form-label">Fecha *</label>
                                    <input type="date" class="form-control" id="editOrderDate" name="fecha" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editOrderTime" class="form-label">Hora *</label>
                                    <input type="time" class="form-control" id="editOrderTime" name="hora" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="editOrderClient" class="form-label">Cliente *</label>
                                    <select class="form-select" id="editOrderClient" name="clienteId" required>
                                        <option value="">Seleccionar cliente</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="editOrderEmployee" class="form-label">Empleado *</label>
                                    <select class="form-select" id="editOrderEmployee" name="empleadoId" required>
                                        <option value="">Seleccionar empleado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="editOrderPaymentMethod" class="form-label">Método de Pago *</label>
                                <select class="form-select" id="editOrderPaymentMethod" name="formaPagoId" required>
                                    <option value="">Seleccionar método de pago</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Tarjeta de crédito</option>
                                    <option value="3">Tarjeta de débito</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Productos *</label>
                                <div id="editOrderProductsContainer">
                                    <!-- Los productos se cargarán dinámicamente -->
                                </div>
                                <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="addProductToEditOrder()">
                                    <i class="bi bi-plus"></i> Agregar Producto
                                </button>
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

function createViewOrderModal() {
    return `
        <div class="modal fade" id="viewOrderModal" tabindex="-1" aria-labelledby="viewOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewOrderModalLabel">
                            <i class="bi bi-eye"></i> Detalles de la Orden
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="viewOrderContent">
                        <!-- El contenido se cargará dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupOrderEventListeners() {
    // Handle Add Order Form Submit
    const addOrderForm = document.getElementById('addOrderForm');
    if (addOrderForm) {
        addOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(addOrderForm);
            
            const requestBody = {
                fecha: formData.get('fecha'),
                hora: formData.get('hora'),
                clienteId: parseInt(formData.get('clienteId')),
                formaPagoId: parseInt(formData.get('formaPagoId')),
                empleadoId: parseInt(formData.get('empleadoId')),
                detallesOrden: []
            };

            const productoIds = formData.getAll('productoId[]');
            const talles = formData.getAll('talle[]');
            const cantidades = formData.getAll('cantidad[]');

            for (let i = 0; i < productoIds.length; i++) {
                if (productoIds[i] && talles[i] && cantidades[i]) {
                    requestBody.detallesOrden.push({
                        productoId: parseInt(productoIds[i]),
                        talle: talles[i],
                        cantidad: parseInt(cantidades[i])
                    });
                }
            }

            if (requestBody.detallesOrden.length === 0) {
                alert('Debe agregar al menos un producto a la orden');
                return;
            }

            fetch('http://localhost:8080/api/ordenes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                if (response.ok) {
                    alert('Orden agregada exitosamente');
                    const modal = bootstrap.Modal.getInstance(addOrderForm.closest('.modal'));
                    if (modal) {
                        modal.hide();
                    }
                    fetchOrders();
                    // Limpiar el formulario
                    addOrderForm.reset();
                    document.getElementById('orderProductsContainer').innerHTML = '';
                } else {
                    response.text().then(text => {
                        alert('Error al agregar la orden: ' + text);
                    });
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Handle Edit Order Form Submit
    const editOrderForm = document.getElementById('editOrderForm');
    if (editOrderForm) {
        editOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(editOrderForm);
            const orderId = formData.get('id');

            const requestBody = {
                fecha: formData.get('fecha'),
                hora: formData.get('hora'),
                clienteId: parseInt(formData.get('clienteId')),
                formaPagoId: parseInt(formData.get('formaPagoId')),
                empleadoId: parseInt(formData.get('empleadoId')),
                detallesOrden: []
            };

            const productoIds = formData.getAll('productoId[]');
            const talles = formData.getAll('talle[]');
            const cantidades = formData.getAll('cantidad[]');

            for (let i = 0; i < productoIds.length; i++) {
                if (productoIds[i] && talles[i] && cantidades[i]) {
                    requestBody.detallesOrden.push({
                        productoId: parseInt(productoIds[i]),
                        talle: talles[i],
                        cantidad: parseInt(cantidades[i])
                    });
                }
            }

            if (requestBody.detallesOrden.length === 0) {
                alert('Debe agregar al menos un producto a la orden');
                return;
            }

            fetch(`http://localhost:8080/api/ordenes/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                if (response.ok) {
                    alert('Orden actualizada exitosamente');
                    const modal = bootstrap.Modal.getInstance(editOrderForm.closest('.modal'));
                    if (modal) {
                        modal.hide();
                    }
                    fetchOrders();
                    currentEditingOrder = null; // Limpiar la orden en edición
                } else {
                    response.text().then(text => {
                        alert('Error al actualizar la orden: ' + text);
                    });
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
}

// Función mejorada para abrir el modal de agregar orden
window.openAddOrderModal = async function() {
    // Refrescar productos desde el backend antes de abrir el modal
    try {
        await refreshProducts();
        
        // Limpiar el formulario
        const form = document.getElementById('addOrderForm');
        if (form) {
            form.reset();
            document.getElementById('orderProductsContainer').innerHTML = '';
        }
        
        // Establecer fecha y hora actuales por defecto
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        document.getElementById('orderDate').value = today;
        document.getElementById('orderTime').value = currentTime;
        
        // Abrir el modal
        const modal = new bootstrap.Modal(document.getElementById('addOrderModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error al refrescar productos:', error);
        alert('Error al cargar los datos de productos. Intente nuevamente.');
    }
}

// Global functions for window object
window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewOrder = function(id) {
    const order = orders.find(o => o.id === id) || allOrders.find(o => o.id === id);
    if (order) {
        const content = document.getElementById('viewOrderContent');
        
        let productosInfo = '';
        if (order.detalles && order.detalles.length > 0) {
            productosInfo = order.detalles.map(detalle => {
                const producto = products.find(p => p.id === detalle.productoId);
                const nombreProducto = producto ? producto.nombre : `Producto ID: ${detalle.productoId}`;
                const talleInfo = detalle.talle ? ` - Talle: ${detalle.talle}` : '';
                return `<li>${nombreProducto}${talleInfo} - Cantidad: ${detalle.cantidad} - Subtotal: $${detalle.precioDetalle.toFixed(2)}</li>`;
            }).join('');
        } else {
            productosInfo = '<li>No hay productos en esta orden</li>';
        }

        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${order.id}</p>
                                    <p><strong>Cliente:</strong> ${order.cliente.nombre} ${order.cliente.apellido}</p>
                                    <p><strong>Empleado:</strong> ${order.empleado.nombre} ${order.empleado.apellido}</p>
                                    <p><strong>Fecha:</strong> ${order.fecha}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Hora:</strong> ${order.hora}</p>
                                    <p><strong>Forma de Pago:</strong> <span class="badge bg-info">${order.formaPago.nombre}</span></p>
                                    <p><strong>Total:</strong> <span class="badge bg-success">$${order.precioTotal.toFixed(2)}</span></p>
                                </div>
                            </div>
                            <hr>
                            <h6>Productos:</h6>
                            <ul>${productosInfo}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
        modal.show();
    } else {
        alert('Orden no encontrada');
    }
}

window.editOrder = async function(id) {
    try {
        // Refrescar productos desde el backend antes de editar
        await refreshProducts();
        
        const order = orders.find(o => o.id == id) || allOrders.find(o => o.id == id);
        if (!order) {
            alert('Orden no encontrada');
            return;
        }

        // Guardar la orden que se está editando
        currentEditingOrder = order;

        document.getElementById('editOrderId').value = order.id;
        document.getElementById('editOrderDate').value = order.fecha;
        document.getElementById('editOrderTime').value = order.hora;
        document.getElementById('editOrderClient').value = order.cliente.id;
        document.getElementById('editOrderEmployee').value = order.empleado.id;
        document.getElementById('editOrderPaymentMethod').value = order.formaPago.id;

        const productContainer = document.getElementById('editOrderProductsContainer');
        productContainer.innerHTML = '';
        
        if (order.detalles && order.detalles.length > 0) {
            order.detalles.forEach(detalle => {
                addProductToEditOrder(detalle.productoId, detalle.talle, detalle.cantidad);
            });
        } else {
            addProductToEditOrder(); // Agregar al menos una fila vacía
        }

        openModal('editOrder');
        
    } catch (error) {
        console.error('Error al cargar datos para edición:', error);
        alert('Error al cargar los datos para editar. Intente nuevamente.');
    }
}

window.deleteOrder = function(id) {
    const order = orders.find(o => o.id === id) || allOrders.find(o => o.id === id);
    const orderInfo = order ? `la orden #${order.id} del cliente ${order.cliente.nombre} ${order.cliente.apellido}` : 'esta orden';
    
    if (confirm(`¿Está seguro de que desea eliminar ${orderInfo}?`)) {
        fetch(`http://localhost:8080/api/ordenes/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Orden eliminada exitosamente');
                fetchOrders(); // Recarga la lista completa
            } else {
                alert('Error al eliminar la orden');
                throw new Error('Error al eliminar orden. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error al eliminar la orden:', error);
            alert('Hubo un problema al eliminar la orden.');
        });
    }
}

window.addProductToOrder = function(productId = '', talle = '', quantity = 1) {
    const container = document.getElementById('orderProductsContainer');
    const rowId = Date.now(); // Unique identifier for this row
    const row = document.createElement('div');
    row.className = 'row mb-3 product-row border rounded p-3 bg-light';
    row.setAttribute('data-row-id', rowId);
    
    row.innerHTML = `
        <div class="col-md-4">
            <label class="form-label">Producto:</label>
            <select class="form-select product-select" name="productoId[]" data-row-id="${rowId}" required>
                ${generateProductOptions(productId)}
            </select>
        </div>
        <div class="col-md-4">
            <label class="form-label">Talle:</label>
            <select class="form-select talle-select" name="talle[]" data-row-id="${rowId}" required disabled>
                <option value="">Primero seleccione un producto</option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Cantidad:</label>
            <input type="number" class="form-control quantity-input" name="cantidad[]" value="${quantity}" min="1" required data-row-id="${rowId}">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeProductRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(row);
    
    // Configurar event listeners para esta fila
    setupProductRowListeners(row, productId, talle, false);
}

window.addProductToEditOrder = function(productId = '', talle = '', quantity = 1) {
    const container = document.getElementById('editOrderProductsContainer');
    const rowId = Date.now(); // Unique identifier for this row
    const row = document.createElement('div');
    row.className = 'row mb-3 product-row border rounded p-3 bg-light';
    row.setAttribute('data-row-id', rowId);
    
    // Guardar los valores originales para el cálculo de stock
    row.setAttribute('data-original-product-id', productId);
    row.setAttribute('data-original-talle', talle);
    row.setAttribute('data-original-quantity', quantity);
    
    row.innerHTML = `
        <div class="col-md-4">
            <label class="form-label">Producto:</label>
            <select class="form-select product-select" name="productoId[]" data-row-id="${rowId}" required>
                ${generateProductOptions(productId)}
            </select>
        </div>
        <div class="col-md-4">
            <label class="form-label">Talle:</label>
            <select class="form-select talle-select" name="talle[]" data-row-id="${rowId}" required disabled>
                <option value="">Primero seleccione un producto</option>
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label">Cantidad:</label>
            <input type="number" class="form-control quantity-input" name="cantidad[]" value="${quantity}" min="1" required data-row-id="${rowId}">
        </div>
        <div class="col-md-1 d-flex align-items-end">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeProductRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(row);
    
    // Configurar event listeners para esta fila (modo edición)
    setupProductRowListeners(row, productId, talle, true);
}

// Función para configurar event listeners en una fila de producto
function setupProductRowListeners(row, initialProductId = '', initialTalle = '', isEditing = false) {
    const productSelect = row.querySelector('.product-select');
    const talleSelect = row.querySelector('.talle-select');
    const quantityInput = row.querySelector('.quantity-input');
    
    // Obtener valores originales para el cálculo de stock en edición
    const originalProductId = row.getAttribute('data-original-product-id') || initialProductId;
    const originalTalle = row.getAttribute('data-original-talle') || initialTalle;
    const originalQuantity = parseInt(row.getAttribute('data-original-quantity')) || 0;
    
    // Event listener para cuando cambia el producto
    productSelect.addEventListener('change', function() {
        updateTalleOptions(productSelect, talleSelect, '', isEditing, originalProductId, originalTalle, originalQuantity);
        // Resetear cantidad cuando cambia el producto
        quantityInput.value = '1';
    });
    
    // Event listener para validar stock cuando cambia la cantidad
    function validateStock() {
        const selectedProductId = productSelect.value;
        const selectedTalle = talleSelect.value;
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (selectedProductId && selectedTalle && quantity > 0) {
            const availableStock = getAvailableStock(
                selectedProductId, 
                selectedTalle, 
                isEditing, 
                originalProductId, 
                originalTalle, 
                originalQuantity
            );
            
            if (quantity > availableStock) {
                alert(`Stock insuficiente. Solo hay ${availableStock} unidades disponibles del talle ${selectedTalle}`);
                quantityInput.value = Math.min(quantity, availableStock);
            }
        }
    }
    
    quantityInput.addEventListener('change', validateStock);
    talleSelect.addEventListener('change', validateStock);
    
    // Si hay valores iniciales, configurarlos
    if (initialProductId) {
        productSelect.value = initialProductId;
        updateTalleOptions(productSelect, talleSelect, initialTalle, isEditing, originalProductId, originalTalle, originalQuantity);
    }
}

window.removeProductRow = function(button) {
    const row = button.closest('.product-row');
    row.remove();
}