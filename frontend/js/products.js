import { fetchData, handleFormSubmit } from './main.js';

let products = [];
let allProducts = []; // Guardamos todos los productos para poder restaurar la lista completa
let productTypes = [];

// Inicializa la sección de productos
export function initProducts(container) {
    container.innerHTML = `
        <h2>Productos</h2>
        
        <!-- Sistema de filtros -->
        <div class="card mb-4">
            <div class="card-body">
                <h6 class="card-title mb-3">Filtrar Productos</h6>
                <div class="row align-items-end">
                    <div class="col-md-3">
                        <label for="filterProductType" class="form-label">Filtrar por:</label>
                        <select class="form-select" id="filterProductType">
                            <option value="id">ID</option>
                            <option value="nombre">Nombre</option>
                            <option value="marca">Marca</option>
                            <option value="color">Color</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="filterProductValue" class="form-label">Valor de búsqueda:</label>
                        <input type="text" class="form-control" id="filterProductValue" placeholder="Ingrese el valor a buscar...">
                    </div>
                    <div class="col-md-5">
                        <button class="btn btn-primary me-2" onclick="filterProducts()">
                            <i class="bi bi-search"></i> Buscar
                        </button>
                        <button class="btn btn-secondary" onclick="clearProductFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Limpiar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <span class="badge bg-info" id="productCount">Total: 0 productos</span>
            </div>
            <button class="btn btn-primary" onclick="openModal('addProduct')">
                <i class="bi bi-plus-circle"></i> Agregar Nuevo Producto
            </button>
        </div>
        
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
        
        <!-- Mensaje cuando no hay resultados -->
        <div id="noProductResultsMessage" class="alert alert-info text-center d-none">
            <i class="bi bi-info-circle"></i> No se encontraron productos con los criterios especificados.
        </div>
        
        ${createProductModals()}
    `;

    fetchProducts();
    fetchProductTypes();
    setupProductEventListeners();
    setupProductFilterEventListeners();
}

// Configura los event listeners para los filtros
function setupProductFilterEventListeners() {
    // Búsqueda al presionar Enter
    const filterValue = document.getElementById('filterProductValue');
    if (filterValue) {
        filterValue.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
    }
}

// Función para filtrar productos
window.filterProducts = function() {
    const filterType = document.getElementById('filterProductType').value;
    const filterValue = document.getElementById('filterProductValue').value.trim();
    
    if (!filterValue) {
        alert('Por favor ingrese un valor para buscar');
        return;
    }

    // Mostrar indicador de carga
    showProductLoading(true);
    
    let endpoint;
    switch(filterType) {
        case 'id':
            endpoint = `http://localhost:8080/api/productos/listById/${filterValue}`;
            break;
        case 'nombre':
            endpoint = `http://localhost:8080/api/productos/listByNombre/${filterValue}`;
            break;
        case 'marca':
            endpoint = `http://localhost:8080/api/productos/listByMarca/${filterValue}`;
            break;
        case 'color':
            endpoint = `http://localhost:8080/api/productos/listByColor/${filterValue}`;
            break;
        default:
            endpoint = 'http://localhost:8080/api/productos';
    }

    fetchData(endpoint, data => {
        showProductLoading(false);
        
        if (filterType === 'id') {
            // Para búsquedas por ID que devuelven Optional<Producto>
            if (data && Object.keys(data).length > 0) {
                products = [data];
            } else {
                products = [];
            }
        } else {
            // Para búsquedas por nombre, marca y color que devuelven List<Producto>
            products = data || [];
        }
        
        updateProductTable();
        updateProductCount();
        showNoProductResults(products.length === 0);
    }, error => {
        showProductLoading(false);
        console.error('Error al filtrar productos:', error);
        products = [];
        updateProductTable();
        updateProductCount();
        showNoProductResults(true);
    });
}

// Función para limpiar filtros
window.clearProductFilters = function() {
    document.getElementById('filterProductValue').value = '';
    document.getElementById('filterProductType').value = 'id';
    products = [...allProducts];
    updateProductTable();
    updateProductCount();
    showNoProductResults(false);
}

// Muestra/oculta el indicador de carga
function showProductLoading(show) {
    const tableBody = document.querySelector('#productTable tbody');
    if (show) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    Buscando productos...
                </td>
            </tr>
        `;
    }
}

// Muestra/oculta el mensaje de sin resultados
function showNoProductResults(show) {
    const noResultsMessage = document.getElementById('noProductResultsMessage');
    if (noResultsMessage) {
        if (show) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }
}

// Actualiza el contador de productos
function updateProductCount() {
    const productCount = document.getElementById('productCount');
    if (productCount) {
        productCount.textContent = `Total: ${products.length} producto${products.length !== 1 ? 's' : ''}`;
    }
}

function fetchProducts() {
    fetchData('http://localhost:8080/api/productos', data => {
        products = data || [];
        allProducts = [...products]; // Guardamos copia de todos los productos
        updateProductTable();
        updateProductCount();
        showNoProductResults(false);
    });
}

function fetchProductTypes() {
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        productTypes = data || [];
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
                <td><strong>${product.id}</strong></td>
                <td>${product.nombre}</td>
                <td><span class="badge bg-success">$${product.precio.toFixed(2)}</span></td>
                <td>${product.marca}</td>
                <td><span class="badge bg-secondary">${product.color}</span></td>
                <td>${product.tipoPrenda ? product.tipoPrenda.nombre : 'N/A'}</td>
                <td><small>${stockDisplay}</small></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewProduct(${product.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="editProduct(${product.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
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
        ${createViewProductModal()}
    `;
}

function createAddProductModal() {
    return `
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addProductModalLabel">
                            <i class="bi bi-plus-circle"></i> Agregar Nuevo Producto
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addProductForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="mb-3">Datos del Producto</h6>
                                    <div class="mb-3">
                                        <label for="productName" class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="productName" name="nombre" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productPrice" class="form-label">Precio *</label>
                                        <input type="number" step="0.01" class="form-control" id="productPrice" name="precio" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productBrand" class="form-label">Marca *</label>
                                        <input type="text" class="form-control" id="productBrand" name="marca" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productColor" class="form-label">Color *</label>
                                        <input type="text" class="form-control" id="productColor" name="color" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="productType" class="form-label">Tipo de Prenda *</label>
                                        <select class="form-select" id="productType" name="tipoPrendaId" required>
                                            <option value="">Seleccionar un tipo</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="mb-3">Stock Inicial (Opcional)</h6>
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
                                    <button type="button" class="btn btn-sm btn-secondary" onclick="addStockEntry()">
                                        <i class="bi bi-plus"></i> Agregar Talle
                                    </button>
                                </div>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-check-circle"></i> Agregar Producto
                                </button>
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
                        <h5 class="modal-title" id="editProductModalLabel">
                            <i class="bi bi-pencil"></i> Editar Producto
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProductForm">
                            <input type="hidden" id="editProductId" name="id">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="mb-3">Datos del Producto</h6>
                                    <div class="mb-3">
                                        <label for="editProductName" class="form-label">Nombre *</label>
                                        <input type="text" class="form-control" id="editProductName" name="nombre" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editProductPrice" class="form-label">Precio *</label>
                                        <input type="number" step="0.01" class="form-control" id="editProductPrice" name="precio" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editProductBrand" class="form-label">Marca *</label>
                                        <input type="text" class="form-control" id="editProductBrand" name="marca" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editProductColor" class="form-label">Color *</label>
                                        <input type="text" class="form-control" id="editProductColor" name="color" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editProductType" class="form-label">Tipo de Prenda *</label>
                                        <select class="form-select" id="editProductType" name="tipoPrendaId" required>
                                            <option value="">Seleccionar un tipo</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="mb-3">Stock por Talle</h6>
                                    <div id="editStockEntries">
                                        <!-- Se llenará dinámicamente -->
                                    </div>
                                    <button type="button" class="btn btn-sm btn-secondary" onclick="addEditStockEntry()">
                                        <i class="bi bi-plus"></i> Agregar Talle
                                    </button>
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

function createViewProductModal() {
    return `
        <div class="modal fade" id="viewProductModal" tabindex="-1" aria-labelledby="viewProductModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="viewProductModalLabel">
                            <i class="bi bi-eye"></i> Detalles del Producto
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body" id="viewProductContent">
                        <!-- El contenido se cargará dinámicamente -->
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
    const product = products.find(p => p.id === id) || allProducts.find(p => p.id === id);
    if (product) {
        const content = document.getElementById('viewProductContent');
        
        let stockInfo = '';
        if (product.stockPorTalle && Object.keys(product.stockPorTalle).length > 0) {
            stockInfo = Object.entries(product.stockPorTalle)
                .map(([talle, cantidad]) => `<span class="badge bg-light text-dark me-1">${talle}: ${cantidad}</span>`)
                .join('');
        } else {
            stockInfo = '<span class="badge bg-warning">Sin stock disponible</span>';
        }

        content.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> ${product.id}</p>
                                    <p><strong>Nombre:</strong> ${product.nombre}</p>
                                    <p><strong>Precio:</strong> <span class="badge bg-success">$${product.precio.toFixed(2)}</span></p>
                                    <p><strong>Marca:</strong> ${product.marca}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Color:</strong> <span class="badge bg-secondary">${product.color}</span></p>
                                    <p><strong>Tipo:</strong> ${product.tipoPrenda ? product.tipoPrenda.nombre : 'N/A'}</p>
                                    <p><strong>Stock por Talle:</strong></p>
                                    <div>${stockInfo}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewProductModal'));
        modal.show();
    } else {
        alert('Producto no encontrado');
    }
}

window.editProduct = function(id) {
    const product = products.find(p => p.id === id) || allProducts.find(p => p.id === id);
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
        openModal('editProduct');
    } else {
        alert('Producto no encontrado');
    }
}

window.deleteProduct = function(id) {
    const product = products.find(p => p.id === id) || allProducts.find(p => p.id === id);
    const productName = product ? product.nombre : 'este producto';
    
    if (confirm(`¿Está seguro de que desea eliminar ${productName}?`)) {
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
                alert('Error al eliminar el producto');
                throw new Error('Error al eliminar producto. Código: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al eliminar el producto.');
        });
    }
}