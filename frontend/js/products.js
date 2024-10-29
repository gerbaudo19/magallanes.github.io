import { fetchData, handleFormSubmit, } from './main.js';

let products = [];
let productTypes = [];

export function initProducts(container) {
    container.innerHTML = `
        <h2>Productos</h2>
        <button class="btn btn-primary mb-3" onclick="openModal('addProduct')">Agregar Nuevo Producto</button>
        <div class="table-responsive">
            <table class="table table-striped" id="productTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Marca</th>
                        <th>Tipo</th>
                        <th>Talle</th>
                        <th>Color</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Las filas de productos se agregarán dinámicamente aquí -->
                </tbody>
            </table>
        </div>
        ${createProductModals()}
    `;

    fetchProducts();
    fetchProductTypes();
    setupProductEventListeners();
}

function fetchProducts() {
    fetchData('http://localhost:8080/api/productos', data => {
        products = data;
        updateProductTable();
    });
}

function fetchProductTypes() {
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        productTypes = data;
        updateProductTypeDropdowns();
    });
}

function updateProductTable() {
    const tableBody = document.querySelector('#productTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        products.forEach(product => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.nombre}</td>
                <td>$${product.precio.toFixed(2)}</td>
                <td>${product.marca}</td>
                <td>${product.tipoPrenda ? product.tipoPrenda.nombre : 'N/A'}</td>
                <td>${product.talle}</td>
                <td>${product.color}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewProduct(${product.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Eliminar</button>
                </td>
            `;
        });
    }
}

function updateProductTypeDropdowns() {
    const addSelect = document.getElementById('productType');
    const editSelect = document.getElementById('editProductType');
    const options = productTypes.map(type => `<option value="${type.id}">${type.nombre}</option>`).join('');
    
    if (addSelect) addSelect.innerHTML = `<option value="">Select a type</option>${options}`;
    if (editSelect) editSelect.innerHTML = `<option value="">Select a type</option>${options}`;
}

function createProductModals() {
    return `
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addProductModalLabel">Agregar Nuevo Producto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addProductForm">
                            <div class="mb-3">
                                <label for="productName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="productName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="productPrice" class="form-label">Precio</label>
                                <input type="number" step="0.01" class="form-control" id="productPrice" name="precio" required>
                            </div>
                            <div class="mb-3">
                                <label for="productBrand" class="form-label">Marca</label>
                                <input type="text" class="form-control" id="productBrand" name="marca" required>
                            </div>
                            <div class="mb-3">
                                <label for="productSize" class="form-label">Talle</label>
                                <input type="text" class="form-control" id="productSize" name="talle" required>
                            </div>
                            <div class="mb-3">
                                <label for="productColor" class="form-label">Color</label>
                                <input type="text" class="form-control" id="productColor" name="color" required>
                            </div>
                            <div class="mb-3">
                                <label for="productType" class="form-label">Tipo</label>
                                <select class="form-select" id="productType" name="tipoPrendaId" required>
                                    <option value="">Seleccionar un tipo</option>
                                    <!-- Las opciones se agregarán dinámicamente aquí -->
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Agregar Producto</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editProductModalLabel">Editar Producto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProductForm">
                            <input type="hidden" id="editProductId" name="id">
                            <div class="mb-3">
                                <label for="editProductName" class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="editProductName" name="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="editProductPrice" class="form-label">Precio</label>
                                <input type="number" step="0.01" class="form-control" id="editProductPrice" name="precio" required>
                            </div>
                            <div class="mb-3">
                                <label for="editProductBrand" class="form-label">Marca</label>
                                <input type="text" class="form-control" id="editProductBrand" name="marca" required>
                            </div>
                            <div class="mb-3">
                                <label for="editProductSize" class="form-label">Talle</label>
                                <input type="text" class="form-control" id="editProductSize" name="talle" required>
                            </div>
                            <div class="mb-3">
                                <label for="editProductColor" class="form-label">Color</label>
                                <input type="text" class="form-control" id="editProductColor" name="color" required>
                            </div>
                            <div class="mb-3">
                                <label for="editProductType" class="form-label">Tipo</label>
                                <select class="form-select" id="editProductType" name="tipoPrendaId" required>
                                    <option value="">Seleccionar un tipo</option>
                                    <!-- Las opciones se agregarán dinámicamente aquí -->
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

function setupProductEventListeners() {
    handleFormSubmit('addProductForm', 'http://localhost:8080/api/productos/create', 'POST', 'Producto agregado exitosamente', fetchProducts);
    handleFormSubmit('editProductForm', 'http://localhost:8080/api/productos', 'PUT', 'Producto actualizado correctamente', fetchProducts);
}

window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.viewProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        alert(JSON.stringify(product, null, 2));
    } else {
        alert('Producto no encontrado');
    }
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.nombre;
        document.getElementById('editProductPrice').value = product.precio;
        document.getElementById('editProductBrand').value = product.marca;
        document.getElementById('editProductSize').value = product.talle;
        document.getElementById('editProductColor').value = product.color;
        document.getElementById('editProductType').value = product.tipoPrendaId;
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } else {
        alert('Producto no encontrado');
    }
}

window.deleteProduct = function(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        const token = localStorage.getItem('token'); // O de donde estés almacenando tu token

        fetch(`http://localhost:8080/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // Añade el token aquí
                'Content-Type': 'application/json' // Si es necesario
            },
        })
        .then(response => {
            if (response.ok) {
                alert('Producto eliminado exitosamente');
                fetchProducts();
            } else {
                alert('Error al eliminar el producto: ' + response.statusText);
            }
        });
    }
}

