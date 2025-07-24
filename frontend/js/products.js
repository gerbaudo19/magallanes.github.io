import { fetchData, handleFormSubmit } from './main.js';

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
                        <th>Color</th>
                        <th>Tipo</th>
                        <th>Stock por Talle</th>
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
            // Formatear stock por talle para mostrar
            let stockDisplay = 'Sin stock';
            if (product.stockPorTalle && Object.keys(product.stockPorTalle).length > 0) {
                stockDisplay = Object.entries(product.stockPorTalle)
                    .map(([talle, cantidad]) => `${talle}: ${cantidad}`)
                    .join(', ');
            }

            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.nombre}</td>
                <td>$${product.precio.toFixed(2)}</td>
                <td>${product.marca}</td>
                <td>${product.color}</td>
                <td>${product.tipoPrenda ? product.tipoPrenda.nombre : 'N/A'}</td>
                <td><small>${stockDisplay}</small></td>
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
    
    if (addSelect) addSelect.innerHTML = `<option value="">Seleccionar un tipo</option>${options}`;
    if (editSelect) editSelect.innerHTML = `<option value="">Seleccionar un tipo</option>${options}`;
}

function createProductModals() {
    return `
        ${createAddProductModal()}
        ${createEditProductModal()}
    `;
}

function createAddProductModal() {
    return `
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addProductModalLabel">Agregar Nuevo Producto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addProductForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Datos del Producto</h6>
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
                                        <label for="productColor" class="form-label">Color</label>
                                        <input type="text" class="form-control" id="productColor" name="color" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productType" class="form-label">Tipo de Prenda</label>
                                        <select class="form-select" id="productType" name="tipoPrendaId" required>
                                            <option value="">Seleccionar un tipo</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Stock Inicial (Opcional)</h6>
                                    <div id="stockEntries">
                                        <div class="stock-entry mb-3">
                                            <div class="row">
                                                <div class="col-5">
                                                    <label class="form-label">Talle</label>
                                                    <input type="text" class="form-control stock-talle" placeholder="Ej: S, M, L">
                                                </div>
                                                <div class="col-5">
                                                    <label class="form-label">Cantidad</label>
                                                    <input type="number" class="form-control stock-cantidad" min="0" placeholder="0">
                                                </div>
                                                <div class="col-2 d-flex align-items-end">
                                                    <button type="button" class="btn btn-sm btn-danger" onclick="removeStockEntry(this)" style="display: none;">×</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-secondary" onclick="addStockEntry()">+ Agregar Talle</button>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Agregar Producto</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createEditProductModal() {
    return `
        <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editProductModalLabel">Editar Producto</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProductForm">
                            <input type="hidden" id="editProductId" name="id">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Datos del Producto</h6>
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
                                        <label for="editProductColor" class="form-label">Color</label>
                                        <input type="text" class="form-control" id="editProductColor" name="color" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editProductType" class="form-label">Tipo de Prenda</label>
                                        <select class="form-select" id="editProductType" name="tipoPrendaId" required>
                                            <option value="">Seleccionar un tipo</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6>Stock por Talle</h6>
                                    <div id="editStockEntries">
                                        <!-- Se llenará dinámicamente -->
                                    </div>
                                    <button type="button" class="btn btn-sm btn-secondary" onclick="addEditStockEntry()">+ Agregar Talle</button>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupProductEventListeners() {
    // Manejar el formulario de agregar producto
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productData = {
                nombre: formData.get('nombre'),
                precio: parseFloat(formData.get('precio')),
                marca: formData.get('marca'),
                color: formData.get('color'),
                tipoPrendaId: parseInt(formData.get('tipoPrendaId'))
            };

            // Recoger datos de stock
            const stockEntries = document.querySelectorAll('#stockEntries .stock-entry');
            const stockPorTalle = {};
            
            stockEntries.forEach(entry => {
                const talle = entry.querySelector('.stock-talle').value.trim();
                const cantidad = parseInt(entry.querySelector('.stock-cantidad').value) || 0;
                
                if (talle && cantidad > 0) {
                    stockPorTalle[talle] = cantidad;
                }
            });

            // Solo agregar stock si hay entradas válidas
            if (Object.keys(stockPorTalle).length > 0) {
                productData.stockPorTalle = stockPorTalle;
            }

            // Enviar al servidor
            const token = localStorage.getItem('token');
            fetch('http://localhost:8080/api/productos/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(productData)
            })
            .then(response => {
                if (response.ok) {
                    alert('Producto agregado exitosamente');
                    fetchProducts();
                    this.reset();
                    resetStockEntries();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                    if (modal) modal.hide();
                } else {
                    alert('Error al agregar el producto');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar el producto');
            });
        });
    }

    // Manejar el formulario de editar producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productData = {
                nombre: formData.get('nombre'),
                precio: parseFloat(formData.get('precio')),
                marca: formData.get('marca'),
                color: formData.get('color'),
                tipoPrendaId: parseInt(formData.get('tipoPrendaId'))
            };

            // Recoger datos de stock editados
            const stockEntries = document.querySelectorAll('#editStockEntries .stock-entry');
            const stockPorTalle = {};
            
            stockEntries.forEach(entry => {
                const talle = entry.querySelector('.stock-talle').value.trim();
                const cantidad = parseInt(entry.querySelector('.stock-cantidad').value) || 0;
                
                if (talle) {
                    stockPorTalle[talle] = cantidad;
                }
            });

            if (Object.keys(stockPorTalle).length > 0) {
                productData.stockPorTalle = stockPorTalle;
            }

            const id = formData.get('id');
            const token = localStorage.getItem('token');
            
            fetch(`http://localhost:8080/api/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(productData)
            })
            .then(response => {
                if (response.ok) {
                    alert('Producto actualizado correctamente');
                    fetchProducts();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                    if (modal) modal.hide();
                } else {
                    alert('Error al actualizar el producto');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al actualizar el producto');
            });
        });
    }
}

// Funciones globales
window.openModal = function(modalType) {
    const modal = new bootstrap.Modal(document.getElementById(`${modalType}Modal`));
    modal.show();
}

window.addStockEntry = function() {
    const stockEntries = document.getElementById('stockEntries');
    const newEntry = document.createElement('div');
    newEntry.className = 'stock-entry mb-3';
    newEntry.innerHTML = `
        <div class="row">
            <div class="col-5">
                <input type="text" class="form-control stock-talle" placeholder="Ej: S, M, L">
            </div>
            <div class="col-5">
                <input type="number" class="form-control stock-cantidad" min="0" placeholder="0">
            </div>
            <div class="col-2 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeStockEntry(this)">×</button>
            </div>
        </div>
    `;
    stockEntries.appendChild(newEntry);
    updateRemoveButtons();
}

window.addEditStockEntry = function() {
    const stockEntries = document.getElementById('editStockEntries');
    const newEntry = document.createElement('div');
    newEntry.className = 'stock-entry mb-3';
    newEntry.innerHTML = `
        <div class="row">
            <div class="col-5">
                <input type="text" class="form-control stock-talle" placeholder="Ej: S, M, L">
            </div>
            <div class="col-5">
                <input type="number" class="form-control stock-cantidad" min="0" placeholder="0">
            </div>
            <div class="col-2 d-flex align-items-end">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeEditStockEntry(this)">×</button>
            </div>
        </div>
    `;
    stockEntries.appendChild(newEntry);
    updateEditRemoveButtons();
}

window.removeStockEntry = function(button) {
    button.closest('.stock-entry').remove();
    updateRemoveButtons();
}

window.removeEditStockEntry = function(button) {
    button.closest('.stock-entry').remove();
    updateEditRemoveButtons();
}

function updateRemoveButtons() {
    const entries = document.querySelectorAll('#stockEntries .stock-entry');
    entries.forEach((entry, index) => {
        const removeBtn = entry.querySelector('.btn-danger');
        if (entries.length > 1) {
            removeBtn.style.display = 'block';
        } else {
            removeBtn.style.display = 'none';
        }
    });
}

function updateEditRemoveButtons() {
    const entries = document.querySelectorAll('#editStockEntries .stock-entry');
    entries.forEach((entry, index) => {
        const removeBtn = entry.querySelector('.btn-danger');
        if (entries.length > 1) {
            removeBtn.style.display = 'block';
        } else {
            removeBtn.style.display = 'none';
        }
    });
}

function resetStockEntries() {
    document.getElementById('stockEntries').innerHTML = `
        <div class="stock-entry mb-3">
            <div class="row">
                <div class="col-5">
                    <label class="form-label">Talle</label>
                    <input type="text" class="form-control stock-talle" placeholder="Ej: S, M, L">
                </div>
                <div class="col-5">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control stock-cantidad" min="0" placeholder="0">
                </div>
                <div class="col-2 d-flex align-items-end">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeStockEntry(this)" style="display: none;">×</button>
                </div>
            </div>
        </div>
    `;
}

window.viewProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        let productInfo = `
ID: ${product.id}
Nombre: ${product.nombre}
Precio: $${product.precio.toFixed(2)}
Marca: ${product.marca}
Color: ${product.color}
Tipo: ${product.tipoPrenda ? product.tipoPrenda.nombre : 'N/A'}`;

        if (product.stockPorTalle && Object.keys(product.stockPorTalle).length > 0) {
            productInfo += '\n\nStock por Talle:';
            Object.entries(product.stockPorTalle).forEach(([talle, cantidad]) => {
                productInfo += `\n${talle}: ${cantidad}`;
            });
        } else {
            productInfo += '\n\nSin stock disponible';
        }

        alert(productInfo);
    } else {
        alert('Producto no encontrado');
    }
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        // Llenar datos básicos
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.nombre;
        document.getElementById('editProductPrice').value = product.precio;
        document.getElementById('editProductBrand').value = product.marca;
        document.getElementById('editProductColor').value = product.color;
        document.getElementById('editProductType').value = product.tipoPrenda ? product.tipoPrenda.id : '';
        
        // Llenar stock existente
        const editStockEntries = document.getElementById('editStockEntries');
        editStockEntries.innerHTML = '';
        
        if (product.stockPorTalle && Object.keys(product.stockPorTalle).length > 0) {
            Object.entries(product.stockPorTalle).forEach(([talle, cantidad]) => {
                const stockEntry = document.createElement('div');
                stockEntry.className = 'stock-entry mb-3';
                stockEntry.innerHTML = `
                    <div class="row">
                        <div class="col-5">
                            <label class="form-label">Talle</label>
                            <input type="text" class="form-control stock-talle" value="${talle}">
                        </div>
                        <div class="col-5">
                            <label class="form-label">Cantidad</label>
                            <input type="number" class="form-control stock-cantidad" min="0" value="${cantidad}">
                        </div>
                        <div class="col-2 d-flex align-items-end">
                            <button type="button" class="btn btn-sm btn-danger" onclick="removeEditStockEntry(this)">×</button>
                        </div>
                    </div>
                `;
                editStockEntries.appendChild(stockEntry);
            });
        } else {
            // Si no hay stock, agregar una entrada vacía
            const stockEntry = document.createElement('div');
            stockEntry.className = 'stock-entry mb-3';
            stockEntry.innerHTML = `
                <div class="row">
                    <div class="col-5">
                        <label class="form-label">Talle</label>
                        <input type="text" class="form-control stock-talle" placeholder="Ej: S, M, L">
                    </div>
                    <div class="col-5">
                        <label class="form-label">Cantidad</label>
                        <input type="number" class="form-control stock-cantidad" min="0" placeholder="0">
                    </div>
                    <div class="col-2 d-flex align-items-end">
                        <button type="button" class="btn btn-sm btn-danger" onclick="removeEditStockEntry(this)" style="display: none;">×</button>
                    </div>
                </div>
            `;
            editStockEntries.appendChild(stockEntry);
        }
        
        updateEditRemoveButtons();
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } else {
        alert('Producto no encontrado');
    }
}

window.deleteProduct = function(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:8080/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (response.ok) {
                alert('Producto eliminado exitosamente');
                fetchProducts();
            } else {
                alert('Error al eliminar el producto: ' + response.statusText);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar el producto');
        });
    }
}