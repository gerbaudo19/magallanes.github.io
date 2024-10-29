import { fetchData, handleFormSubmit, getAuthHeader } from './main.js';

let orders = [];
let clients = [];
let employees = [];
let products = [];

export function initOrders(container) {
    container.innerHTML = `
        <h2>Órdenes</h2>
        <button class="btn btn-primary mb-3" onclick="openModal('addOrder')">Agregar Nueva Orden</button>
        <div class="table-responsive">
            <table class="table table-striped" id="orderTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Order rows will be dynamically added here -->
                </tbody>
            </table>
        </div>
        ${createOrderModals()}
    `;

    fetchOrders();
    fetchClients();
    fetchEmployees();
    fetchProducts();
    setupOrderEventListeners();
}

function fetchOrders() {
    fetchData('http://localhost:8080/api/ordenes', data => {
        orders = data;
        updateOrderTable();
    });
}

function fetchClients() {
    fetchData('http://localhost:8080/cliente/list', data => {
        clients = data;
        updateClientDropdown();
    });
}

function fetchEmployees() {
    fetchData('http://localhost:8080/empleado/list', data => {
        employees = data;
        updateEmployeeDropdown();
    });
}

function fetchProducts() {
    fetchData('http://localhost:8080/api/productos', data => {
        products = data;
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
                <td>${order.id}</td>
                <td>${order.cliente.nombre} ${order.cliente.apellido}</td>
                <td>${order.fecha}</td>
                <td>${order.hora}</td>
                <td>$${order.precioTotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editOrder(${order.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">Eliminar</button>
                </td>
            `;
        });
    }
}

function updateClientDropdown() {
    const clientSelect = document.getElementById('orderClient');
    const editClientSelect = document.getElementById('editOrderClient');
    const options = clients.map(client => `<option value="${client.id}">${client.nombre} ${client.apellido}</option>`).join('');
    
    if (clientSelect) clientSelect.innerHTML = `<option value="">Seleccionar cliente</option>${options}`;
    if (editClientSelect) editClientSelect.innerHTML = `<option value="">Seleccionar cliente</option>${options}`;
}

function updateEmployeeDropdown() {
    const employeeSelect = document.getElementById('orderEmployee');
    const editEmployeeSelect = document.getElementById('editOrderEmployee');
    const options = employees.map(employee => `<option value="${employee.id}">${employee.nombre} ${employee.apellido}</option>`).join('');
    
    if (employeeSelect) employeeSelect.innerHTML = `<option value="">Seleccionar empleado</option>${options}`;
    if (editEmployeeSelect) editEmployeeSelect.innerHTML = `<option value="">Seleccionar empleado</option>${options}`;
}

function updateProductDropdown() {
    const productSelect = document.getElementById('orderProducts');
    const editProductSelect = document.getElementById('editOrderProducts');
    const options = products.map(product => `<option value="${product.id}">${product.nombre} - $${product.precio.toFixed(2)}</option>`).join('');
    
    if (productSelect) productSelect.innerHTML = options;
    if (editProductSelect) editProductSelect.innerHTML = options;
}

function createOrderModals() {
    return `
        <div class="modal fade" id="addOrderModal" tabindex="-1" aria-labelledby="addOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addOrderModalLabel">Agregar Nueva Orden</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addOrderForm">
                            <div class="mb-3">
                                <label for="orderDate" class="form-label">Fecha</label>
                                <input type="date" class="form-control" id="orderDate" name="fecha" required>
                            </div>
                            <div class="mb-3">
                                <label for="orderTime" class="form-label">Hora</label>
                                <input type="time" class="form-control" id="orderTime" name="hora" required>
                            </div>
                            <div class="mb-3">
                                <label for="orderClient" class="form-label">Cliente</label>
                                <select class="form-select" id="orderClient" name="clienteId" required>
                                    <option value="">Seleccionar cliente</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="orderEmployee" class="form-label">Empleado</label>
                                <select class="form-select" id="orderEmployee" name="empleadoId" required>
                                    <option value="">Seleccionar empleado</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="orderPaymentMethod" class="form-label">Método de Pago</label>
                                <select class="form-select" id="orderPaymentMethod" name="formaPagoId" required>
                                    <option value="">Seleccionar método de pago</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Tarjeta de crédito</option>
                                    <option value="3">Tarjeta de débito</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Productos</label>
                                <div id="orderProductsContainer">
                                    <div class="row mb-2">
                                    </div>
                                </div>
                                <button type="button" class="btn btn-secondary mt-2" onclick="addProductToOrder()">Agregar Producto</button>
                            </div>
                            <button type="submit" class="btn btn-primary">Agregar Orden</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="editOrderModal" tabindex="-1" aria-labelledby="editOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editOrderModalLabel">Editar Orden</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editOrderForm">
                            <input type="hidden" id="editOrderId" name="id">
                            <div class="mb-3">
                                <label for="editOrderDate" class="form-label">Fecha</label>
                                <input type="date" class="form-control" id="editOrderDate" name="fecha" required>
                            </div>
                            <div class="mb-3">
                                <label for="editOrderTime" class="form-label">Hora</label>
                                <input type="time" class="form-control" id="editOrderTime" name="hora" required>
                            </div>
                            <div class="mb-3">
                                <label for="editOrderClient" class="form-label">Cliente</label>
                                <select class="form-select" id="editOrderClient" name="clienteId" required>
                                    <option value="">Seleccionar cliente</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editOrderEmployee" class="form-label">Empleado</label>
                                <select class="form-select" id="editOrderEmployee" name="empleadoId" required>
                                    <option value="">Seleccionar empleado</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editOrderPaymentMethod" class="form-label">Método de Pago</label>
                                <select class="form-select" id="editOrderPaymentMethod" name="formaPagoId" required>
                                    <option value="">Seleccionar método de pago</option>
                                    <option value="1">Efectivo</option>
                                    <option value="2">Tarjeta de crédito</option>
                                    <option value="3">Tarjeta de débito</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Productos</label>
                                <div id="editOrderProductsContainer">
                                    <!-- Product rows will be dynamically added here -->
                                </div>
                                <button type="button" class="btn btn-secondary mt-2" onclick="addProductToEditOrder()">Agregar Producto</button>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupOrderEventListeners() {
    handleFormSubmit('addOrderForm', 'http://localhost:8080/api/ordenes', 'POST', 'Orden agregada exitosamente', fetchOrders);
    handleFormSubmit('editOrderForm', 'http://localhost:8080/api/ordenes', 'PUT', 'Orden actualizada exitosamente', fetchOrders);
}



window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewOrder = function(id) {
    const order = orders.find(o => o.id === id);
    if (order) {
        alert(JSON.stringify(order, null, 2));
    } else {
        alert('Orden no encontrada');
    }
}

window.editOrder = function(id) {
    const order = orders.find(o => o.id === id);
    if (order) {
        document.getElementById('editOrderId').value = order.id;
        document.getElementById('editOrderDate').value = order.fecha;
        document.getElementById('editOrderTime').value = order.hora;
        document.getElementById('editOrderClient').value = order.cliente.id;
        document.getElementById('editOrderEmployee').value = order.empleado.id;
        document.getElementById('editOrderPaymentMethod').value = order.formaPago.id;
        
        const productContainer = document.getElementById('editOrderProductsContainer');
        productContainer.innerHTML = '';
        order.detallesOrden.forEach(detalle => {
            addProductToEditOrder(detalle.producto.id, detalle.cantidad);
        });
        
        openModal('editOrder');
    } else {
        alert('Orden no encontrada');
    }
}

window.deleteOrder = function(id) {
    if (confirm('¿Está seguro de que desea eliminar esta orden?')) {
        fetch(`http://localhost:8080/api/ordenes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        })
        .then(response => {
            if (response.ok) {
                alert('Orden eliminada exitosamente');
                fetchOrders();
            } else {
                alert('Error al eliminar la orden');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

window.addProductToOrder = function(productId = '', quantity = 1) {
    const container = document.getElementById('orderProductsContainer');
    const row = document.createElement('div');
    row.className = 'row mb-2';
    row.innerHTML = `
        <div class="col-md-8">
            <select class="form-select" name="productoId[]" required>
                <option value="">Seleccionar producto</option>
                ${products.map(product => `<option value="${product.id}" ${product.id === productId ? 'selected' : ''}>${product.nombre} - $${product.precio.toFixed(2)}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <input type="number" class="form-control" name="cantidad[]" value="${quantity}" placeholder="Cantidad..." min="1" required>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger" onclick="removeProductRow(this)">Eliminar</button>
        </div>
    `;
    container.appendChild(row);
}

// Función para eliminar una fila de producto
window.removeProductRow = function(button) {
    const row = button.closest('.row');
    row.remove();
}

// Añade esta función en el contenedor de productos al abrir el modal de edición
window.addProductToEditOrder = function(productId = '', quantity = 1) {
    const container = document.getElementById('editOrderProductsContainer');
    const row = document.createElement('div');
    row.className = 'row mb-2';
    row.innerHTML = `
        <div class="col-md-8">
            <select class="form-select" name="productoId[]" required>
                <option value="">Seleccionar producto</option>
                ${products.map(product => `<option value="${product.id}" ${product.id === productId ? 'selected' : ''}>${product.nombre} - $${product.precio.toFixed(2)}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <input type="number" class="form-control" name="cantidad[]" value="${quantity}" placeholder="Cantidad..." min="1" required>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger" onclick="removeProductRow(this)">Eliminar</button>
        </div>
    `;
    container.appendChild(row);
}

