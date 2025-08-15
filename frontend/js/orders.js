import { fetchData, getAuthHeader } from './main.js';

let orders = [];
let allOrders = []; // Guardamos todas las órdenes para poder restaurar la lista completa
let clients = [];
let employees = [];
let products = [];

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
            <button class="btn btn-primary" onclick="openModal('addOrder')">
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
        updateProductDropdown();
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

function updateProductDropdown() {
    const productSelect = document.getElementById('orderProducts');
    const editProductSelect = document.getElementById('editOrderProducts');
    const options = products.map(product => 
        `<option value="${product.id}">${product.nombre} - $${product.precio.toFixed(2)}</option>`
    ).join('');
    
    if (productSelect) productSelect.innerHTML = options;
    if (editProductSelect) editProductSelect.innerHTML = options;
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
            const cantidades = formData.getAll('cantidad[]');

            for (let i = 0; i < productoIds.length; i++) {
                requestBody.detallesOrden.push({
                    productoId: parseInt(productoIds[i]),
                    cantidad: parseInt(cantidades[i])
                });
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
                } else {
                    alert('Error al agregar la orden');
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
            const cantidades = formData.getAll('cantidad[]');

            for (let i = 0; i < productoIds.length; i++) {
                requestBody.detallesOrden.push({
                    productoId: parseInt(productoIds[i]),
                    cantidad: parseInt(cantidades[i])
                });
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
                } else {
                    alert('Error al actualizar la orden');
                }
            })
            .catch(error => console.error('Error:', error));
        });
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
                return `<li>${nombreProducto} - Cantidad: ${detalle.cantidad} - Subtotal: $${detalle.precioDetalle.toFixed(2)}</li>`;
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

window.editOrder = function(id) {
    const order = orders.find(o => o.id == id) || allOrders.find(o => o.id == id);
    if (!order) {
        alert('Orden no encontrada');
        return;
    }

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
            addProductToEditOrder(detalle.productoId, detalle.cantidad);
        });
    } else {
        addProductToEditOrder(); // Agregar al menos una fila vacía
    }

    openModal('editOrder');
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

window.addProductToOrder = function(productId = '', quantity = 1) {
    const container = document.getElementById('orderProductsContainer');
    const row = document.createElement('div');
    row.className = 'row mb-2 product-row';
    row.innerHTML = `
        <div class="col-md-7">
            <select class="form-select" name="productoId[]" required>
                <option value="">Seleccionar producto</option>
                ${products.map(product => `<option value="${product.id}" ${product.id == productId ? 'selected' : ''}>${product.nombre} - $${product.precio.toFixed(2)}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control" name="cantidad[]" value="${quantity}" placeholder="Cantidad..." min="1" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeProductRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
}

window.removeProductRow = function(button) {
    const row = button.closest('.product-row');
    row.remove();
}

window.addProductToEditOrder = function(productId = '', quantity = 1) {
    const container = document.getElementById('editOrderProductsContainer');
    const row = document.createElement('div');
    row.className = 'row mb-2 product-row';
    row.innerHTML = `
        <div class="col-md-7">
            <select class="form-select" name="productoId[]" required>
                <option value="">Seleccionar producto</option>
                ${products.map(product => `<option value="${product.id}" ${product.id == productId ? 'selected' : ''}>${product.nombre} - $${product.precio.toFixed(2)}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control" name="cantidad[]" value="${quantity}" placeholder="Cantidad..." min="1" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeProductRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(row);
}