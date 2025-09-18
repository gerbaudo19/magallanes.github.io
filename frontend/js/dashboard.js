import { fetchData } from './main.js';

let clients = [];
let employees = [];
let products = [];
let orders = [];
let tipoPrenda = [];
let stockInsuficiente = [];

export function initDashboard(container) {
    container.innerHTML = `
        <h2>Panel de Control</h2>
        <div class="row">
            <div class="col-md-3">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Resumen del sistema</h5>
                        <ul class="list-group">
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Total Clientes
                                <span class="badge bg-primary rounded-pill" id="totalClients">0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Total Empleados
                                <span class="badge bg-primary rounded-pill" id="totalEmployees">0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Total Productos
                                <span class="badge bg-primary rounded-pill" id="totalProducts">0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Total Ordenes
                                <span class="badge bg-primary rounded-pill" id="totalOrders">0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Total Tipo de Prendas
                                <span class="badge bg-primary rounded-pill" id="totalTipoPrenda">0</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Ganancia Total
                                <span class="badge bg-success rounded-pill" id="totalGanancia">$0.00</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Ganancia Anual
                                <span class="badge bg-success rounded-pill" id="gananciaAnual">$0.00</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Ganancia Mensual
                                <span class="badge bg-success rounded-pill" id="gananciaMensual">$0.00</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                Ganancia Diaria
                                <span class="badge bg-success rounded-pill" id="gananciaDiaria">$0.00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Nuevo card para Stock Insuficiente -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title text-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Stock Insuficiente
                        </h5>
                        <div id="stockInsuficienteContainer">
                            <div class="text-center py-3">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <small class="d-block mt-2">Cargando reportes...</small>
                            </div>
                        </div>
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Se consideran productos con 5 o menos unidades por talle
                            </small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-9">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Pedidos recientes</h5>
                        <div class="table-responsive">
                            <table class="table table-striped" id="recentOrdersTable">
                                <thead>
                                    <tr>
                                        <th>ID Orden</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Orders will be dynamically added here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Nuevo card expandido para Stock Insuficiente en pantallas grandes -->
                <div class="card mb-4">
                    <div class="card-header bg-danger text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Reporte Detallado de Stock Insuficiente
                        </h5>
                    </div>
                    <div class="card-body">
                        <div id="stockInsuficienteTableContainer">
                            <div class="text-center py-4">
                                <div class="spinner-border" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <p class="mt-3">Cargando reporte de stock...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Productos más vendidos</h5>
                                <canvas id="topSellingProductsChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Preferencias de Pago de Clientes</h5>
                                <canvas id="salesByCategoryChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchDashboardData();
}

function fetchDashboardData() {
    fetchData('http://localhost:8080/cliente/list', data => {
        clients = data;
        updateSystemSummary();
    });
    fetchData('http://localhost:8080/empleado/list', data => {
        employees = data;
        updateSystemSummary();
    });
    fetchData('http://localhost:8080/api/productos', data => {
        products = data;
        updateSystemSummary();
    });
    fetchData('http://localhost:8080/api/ordenes', data => {
        orders = data;
        updateSystemSummary();
        updateRecentOrders();
        actualizarGanancias(orders);
    });
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        tipoPrenda = data;
        updateSystemSummary();
    });

    // Nueva llamada para obtener stock insuficiente
    fetchStockInsuficiente();

    const fechaInicio = '2025-01-01';
    const fechaFin = '2025-12-31';
    obtenerGananciaTotal(fechaInicio, fechaFin);

    createTopSellingProductsChart();
    createSalesByPaymentMethodChart();
}

function fetchStockInsuficiente() {
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8080/api/productos/stock/insuficiente', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        stockInsuficiente = data;
        updateStockInsuficiente();
        updateStockInsuficienteTable();
    })
    .catch(error => {
        console.error('Error al obtener stock insuficiente:', error);
        document.getElementById('stockInsuficienteContainer').innerHTML = `
            <div class="alert alert-warning alert-sm" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar datos
            </div>
        `;
        document.getElementById('stockInsuficienteTableContainer').innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> No se pudo cargar el reporte de stock insuficiente.
                <br><small>Detalle: ${error.message}</small>
            </div>
        `;
    });
}

function updateStockInsuficiente() {
    const container = document.getElementById('stockInsuficienteContainer');
    
    if (stockInsuficiente.length === 0) {
        container.innerHTML = `
            <div class="alert alert-success alert-sm" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <strong>¡Excelente!</strong><br>
                <small>No hay productos con stock insuficiente</small>
            </div>
        `;
        return;
    }

    // Mostrar solo los primeros 5 items en el resumen
    const displayItems = stockInsuficiente.slice(0, 5);
    const remainingCount = stockInsuficiente.length - 5;

    let html = '<div class="stock-insuficiente-list">';
    
    displayItems.forEach(item => {
        const alertClass = item.cantidad === 0 ? 'alert-danger' : 'alert-warning';
        const icon = item.cantidad === 0 ? 'fas fa-times-circle' : 'fas fa-exclamation-triangle';
        
        html += `
            <div class="alert ${alertClass} alert-sm py-2 mb-2" role="alert">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <i class="${icon} me-2"></i>
                        <strong>${item.nombreProducto}</strong>
                        <br>
                        <small class="text-muted">
                            <i class="fas fa-tag me-1"></i>${item.tipoPrenda || 'Sin categoría'} | 
                            <i class="fas fa-palette me-1"></i>${item.color} | 
                            <i class="fas fa-copyright me-1"></i>${item.marca}
                        </small>
                        <br>
                        <small><strong>Talle ${item.talle}:</strong> ${item.cantidad} unidades</small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${item.cantidad === 0 ? 'bg-danger' : 'bg-warning'} rounded-pill mb-1">
                            ${item.cantidad === 0 ? 'Agotado' : 'Bajo'}
                        </span>
                        <br>
                        <small class="text-muted">ID: ${item.productoId}</small>
                    </div>
                </div>
            </div>
        `;
    });

    if (remainingCount > 0) {
        html += `
            <div class="text-center mt-2">
                <small class="text-muted">
                    <i class="fas fa-ellipsis-h me-1"></i>
                    ... y ${remainingCount} producto${remainingCount > 1 ? 's' : ''} más con stock insuficiente
                </small>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function updateStockInsuficienteTable() {
    const container = document.getElementById('stockInsuficienteTableContainer');
    
    if (stockInsuficiente.length === 0) {
        container.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <h5 class="alert-heading">¡Excelente gestión de stock!</h5>
                <p>Todos los productos tienen stock suficiente por talle.</p>
                <hr>
                <p class="mb-0">No se requieren acciones inmediatas de reabastecimiento.</p>
            </div>
        `;
        return;
    }

    // Agrupar por producto para mejor visualización
    const productoGrouped = {};
    stockInsuficiente.forEach(item => {
        const key = `${item.productoId}`;
        if (!productoGrouped[key]) {
            productoGrouped[key] = {
                productoId: item.productoId,
                nombreProducto: item.nombreProducto,
                color: item.color,
                marca: item.marca,
                tipoPrenda: item.tipoPrenda,
                talles: []
            };
        }
        productoGrouped[key].talles.push({
            talle: item.talle,
            cantidad: item.cantidad
        });
    });

    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h6 class="text-danger mb-1">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${stockInsuficiente.length} problema${stockInsuficiente.length > 1 ? 's' : ''} de stock detectado${stockInsuficiente.length > 1 ? 's' : ''}
                </h6>
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Productos con 5 o menos unidades por talle
                </small>
            </div>
            <div class="text-end">
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    Última actualización: ${new Date().toLocaleString()}
                </small>
            </div>
        </div>

        <!-- Filtros y búsqueda -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="input-group input-group-sm">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="searchStockFilter" placeholder="Buscar producto...">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select form-select-sm" id="categoryStockFilter">
                    <option value="">Todas las categorías</option>
                    ${[...new Set(stockInsuficiente.map(item => item.tipoPrenda).filter(Boolean))].map(categoria => 
                        `<option value="${categoria}">${categoria}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select form-select-sm" id="statusStockFilter">
                    <option value="">Todos los estados</option>
                    <option value="agotado">Solo agotados</option>
                    <option value="bajo">Solo stock bajo</option>
                </select>
            </div>
            <div class="col-md-2">
                <button class="btn btn-outline-secondary btn-sm w-100" onclick="clearStockFilters()">
                    <i class="fas fa-times me-1"></i>Limpiar
                </button>
            </div>
        </div>

        <div class="row" id="stockProductsGrid">
    `;

    Object.values(productoGrouped).forEach(producto => {
        const tallesAgotados = producto.talles.filter(t => t.cantidad === 0).length;
        const tallesBajos = producto.talles.filter(t => t.cantidad > 0 && t.cantidad <= 5).length;
        const totalTallesAfectados = producto.talles.length;
        
        // Determinar el nivel de criticidad
        const criticidad = tallesAgotados > 0 ? 'critico' : 'bajo';
        const borderClass = criticidad === 'critico' ? 'border-danger' : 'border-warning';
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3 stock-product-card" 
                 data-nombre="${producto.nombreProducto.toLowerCase()}" 
                 data-categoria="${(producto.tipoPrenda || '').toLowerCase()}"
                 data-criticidad="${criticidad}">
                <div class="card ${borderClass} h-100">
                    <div class="card-header bg-light d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1 fw-bold">${producto.nombreProducto}</h6>
                            <div class="small text-muted">
                                <span class="badge bg-secondary me-1">${producto.tipoPrenda || 'Sin categoría'}</span>
                                <br>
                                <i class="fas fa-palette me-1"></i>${producto.color} | 
                                <i class="fas fa-copyright me-1"></i>${producto.marca}
                            </div>
                        </div>
                        <div class="text-end">
                            <small class="text-muted">ID: ${producto.productoId}</small>
                            <br>
                            <span class="badge ${criticidad === 'critico' ? 'bg-danger' : 'bg-warning'} rounded-pill">
                                ${criticidad === 'critico' ? 'Crítico' : 'Atención'}
                            </span>
                        </div>
                    </div>
                    <div class="card-body py-2">
                        <div class="row g-1">
        `;
        
        // Ordenar talles numéricamente cuando sea posible
        const tallesOrdenados = producto.talles.sort((a, b) => {
            const talleA = isNaN(a.talle) ? a.talle : parseInt(a.talle);
            const talleB = isNaN(b.talle) ? b.talle : parseInt(b.talle);
            if (typeof talleA === 'number' && typeof talleB === 'number') {
                return talleA - talleB;
            }
            return a.talle.localeCompare(b.talle);
        });
        
        tallesOrdenados.forEach(talle => {
            const badgeClass = talle.cantidad === 0 ? 'bg-danger' : 'bg-warning';
            const textClass = talle.cantidad === 0 ? 'text-white' : 'text-dark';
            const icon = talle.cantidad === 0 ? 'fas fa-times-circle' : 'fas fa-exclamation-triangle';
            
            html += `
                <div class="col-6 mb-2">
                    <div class="d-flex justify-content-between align-items-center p-2 rounded ${badgeClass} ${textClass}">
                        <span class="small fw-bold">
                            <i class="${icon} me-1"></i>
                            Talle ${talle.talle}
                        </span>
                        <span class="badge bg-light text-dark rounded-pill">
                            ${talle.cantidad === 0 ? 'Agotado' : `${talle.cantidad} unid.`}
                        </span>
                    </div>
                </div>
            `;
        });
        
        html += `
                        </div>
                    </div>
                    <div class="card-footer bg-light py-2">
                        <div class="row text-center">
                            <div class="col-4">
                                <small class="text-danger fw-bold">${tallesAgotados}</small>
                                <br>
                                <small class="text-muted">Agotados</small>
                            </div>
                            <div class="col-4">
                                <small class="text-warning fw-bold">${tallesBajos}</small>
                                <br>
                                <small class="text-muted">Stock Bajo</small>
                            </div>
                            <div class="col-4">
                                <small class="text-info fw-bold">${totalTallesAfectados}</small>
                                <br>
                                <small class="text-muted">Total Afectados</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    
    // Agregar estadísticas resumen mejoradas
    const totalProductosAfectados = Object.keys(productoGrouped).length;
    const totalAgotados = stockInsuficiente.filter(item => item.cantidad === 0).length;
    const totalBajos = stockInsuficiente.filter(item => item.cantidad > 0).length;
    const categoriasMasAfectadas = [...new Set(stockInsuficiente.map(item => item.tipoPrenda).filter(Boolean))];
    
    html += `
        <div class="mt-4 p-4 bg-light rounded">
            <h6 class="mb-3">
                <i class="fas fa-chart-bar me-2"></i>
                Resumen Estadístico
            </h6>
            <div class="row text-center">
                <div class="col-md-2">
                    <div class="text-danger">
                        <i class="fas fa-times-circle fa-2x mb-2"></i>
                        <h4 class="mb-1">${totalAgotados}</h4>
                        <small>Talles Agotados</small>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="text-warning">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <h4 class="mb-1">${totalBajos}</h4>
                        <small>Stock Bajo</small>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="text-info">
                        <i class="fas fa-box fa-2x mb-2"></i>
                        <h4 class="mb-1">${totalProductosAfectados}</h4>
                        <small>Productos Afectados</small>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="text-secondary">
                        <i class="fas fa-tags fa-2x mb-2"></i>
                        <h4 class="mb-1">${categoriasMasAfectadas.length}</h4>
                        <small>Categorías Afectadas</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="text-start">
                        <h6 class="mb-2">
                            <i class="fas fa-list-ul me-2"></i>
                            Categorías más afectadas:
                        </h6>
                        <div class="d-flex flex-wrap gap-1">
                            ${categoriasMasAfectadas.slice(0, 3).map(categoria => 
                                `<span class="badge bg-secondary">${categoria}</span>`
                            ).join('')}
                            ${categoriasMasAfectadas.length > 3 ? 
                                `<span class="badge bg-light text-dark">+${categoriasMasAfectadas.length - 3} más</span>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Acciones recomendadas -->
        <div class="mt-4 p-3 bg-info bg-opacity-10 border border-info rounded">
            <h6 class="text-info mb-2">
                <i class="fas fa-lightbulb me-2"></i>
                Acciones Recomendadas
            </h6>
            <ul class="mb-0 small">
                <li>Contactar proveedores para productos agotados</li>
                <li>Revisar histórico de ventas para planificar reposición</li>
                <li>Considerar promociones para productos con stock bajo</li>
                <li>Actualizar sistema de alertas automáticas</li>
            </ul>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar event listeners para los filtros
    setupStockFilters();
}

function setupStockFilters() {
    const searchFilter = document.getElementById('searchStockFilter');
    const categoryFilter = document.getElementById('categoryStockFilter');
    const statusFilter = document.getElementById('statusStockFilter');
    
    if (searchFilter && categoryFilter && statusFilter) {
        [searchFilter, categoryFilter, statusFilter].forEach(filter => {
            filter.addEventListener('input', filterStockProducts);
            filter.addEventListener('change', filterStockProducts);
        });
    }
}

function filterStockProducts() {
    const searchTerm = document.getElementById('searchStockFilter')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryStockFilter')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusStockFilter')?.value || '';
    
    const productCards = document.querySelectorAll('.stock-product-card');
    
    productCards.forEach(card => {
        const nombre = card.dataset.nombre || '';
        const categoria = card.dataset.categoria || '';
        const criticidad = card.dataset.criticidad || '';
        
        const matchesSearch = nombre.includes(searchTerm);
        const matchesCategory = !categoryFilter || categoria.includes(categoryFilter);
        const matchesStatus = !statusFilter || 
            (statusFilter === 'agotado' && criticidad === 'critico') ||
            (statusFilter === 'bajo' && criticidad === 'bajo');
        
        if (matchesSearch && matchesCategory && matchesStatus) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function clearStockFilters() {
    document.getElementById('searchStockFilter').value = '';
    document.getElementById('categoryStockFilter').value = '';
    document.getElementById('statusStockFilter').value = '';
    filterStockProducts();
}

function updateSystemSummary() {
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalTipoPrenda').textContent = tipoPrenda.length;
}

function obtenerGananciaTotal(fechaInicio, fechaFin) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8080/api/ordenes/ganancia-total?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Ganancia total:', data.gananciaTotal);
        const totalGananciaElem = document.getElementById('totalGanancia');
        if (totalGananciaElem) {
            totalGananciaElem.textContent = `$${data.gananciaTotal.toFixed(2)}`;
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateRecentOrders() {
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        
        const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

        sortedOrders.slice(0, 5).forEach(order => {
            const row = tableBody.insertRow();
            
            const date = new Date(order.fecha);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.cliente.nombre} ${order.cliente.apellido}</td>
                <td>${formattedDate}</td>
                <td>$${order.precioTotal.toFixed(2)}</td>
            `;
        });
    }
}

function calcularGananciaAnual(orders) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return orders
        .filter(order => new Date(order.fecha) >= startOfYear)
        .reduce((sum, order) => sum + order.precioTotal, 0);
}

function calcularGananciaMensual(orders) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders
        .filter(order => new Date(order.fecha) >= startOfMonth)
        .reduce((sum, order) => sum + order.precioTotal, 0);
}

function calcularGananciaDiaria(orders) {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    
    return orders
        .filter(order => order.fecha === todayString)
        .reduce((sum, order) => sum + order.precioTotal, 0);
}

function calcularGananciaTotal(orders) {
    return orders.reduce((sum, order) => sum + order.precioTotal, 0);
}

function actualizarGanancias(orders) {
    const gananciaTotal = calcularGananciaTotal(orders);
    const gananciaAnual = calcularGananciaAnual(orders);
    const gananciaMensual = calcularGananciaMensual(orders);
    const gananciaDiaria = calcularGananciaDiaria(orders);

    const gananciaAnualElem = document.getElementById('gananciaAnual');
    const gananciaMensualElem = document.getElementById('gananciaMensual');
    const gananciaDiariaElem = document.getElementById('gananciaDiaria');

    if (gananciaAnualElem) gananciaAnualElem.textContent = `$${gananciaAnual.toFixed(2)}`;
    if (gananciaMensualElem) gananciaMensualElem.textContent = `$${gananciaMensual.toFixed(2)}`;
    if (gananciaDiariaElem) gananciaDiariaElem.textContent = `$${gananciaDiaria.toFixed(2)}`;
    document.getElementById('totalGanancia').textContent = `$${gananciaTotal.toFixed(2)}`;
}

function actualizarFechaYGanancias() {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    actualizarGanancias(orders);
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarFechaYGanancias();
});

setInterval(actualizarFechaYGanancias, 86400000);

function createTopSellingProductsChart() {
    const token = localStorage.getItem('token');

    fetch('http://localhost:8080/api/productos/mas-vendidos', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const labels = data.map(product => product.nombre);
        const salesData = data.map(product => product.cantidadVendida);

        const ctx = document.getElementById('topSellingProductsChart').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas',
                    data: salesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error al obtener los productos más vendidos:', error);
    });
}

function createSalesByPaymentMethodChart() {
    const ctx = document.getElementById('salesByCategoryChart').getContext('2d');
    const token = localStorage.getItem('token');

    fetch('http://localhost:8080/api/ordenes/estadisticas/forma-pago', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        const labels = data.map(d => d.formaPago);
        const cantidades = data.map(d => d.cantidad);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: cantidades,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Órdenes por Forma de Pago' }
                }
            }
        });
    })
    .catch(error => console.error('Error al obtener estadísticas por forma de pago:', error));
}