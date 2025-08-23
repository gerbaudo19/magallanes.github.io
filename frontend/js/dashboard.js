import { fetchData } from './main.js';

let clients = [];
let employees = [];
let products = [];
let orders = [];
let tipoPrenda = [];

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
        actualizarGanancias(orders); // Actualizar ganancias
    });
    fetchData('http://localhost:8080/api/tipoPrendas', data => {
        tipoPrenda = data;
        updateSystemSummary();
    });

    // Llamada para obtener la ganancia total
    const fechaInicio = '2025-01-01'; // Fecha de inicio
    const fechaFin = '2025-12-31';   // Fecha de fin
    obtenerGananciaTotal(fechaInicio, fechaFin);

    createTopSellingProductsChart();
    createSalesByPaymentMethodChart();

}

function updateSystemSummary() {
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalTipoPrenda').textContent = tipoPrenda.length;
}

function obtenerGananciaTotal(fechaInicio, fechaFin) {
    const token = localStorage.getItem('token'); // O tu forma de obtener el token
    fetch(`http://localhost:8080/api/ordenes/ganancia-total?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Ganancia total:', data.gananciaTotal);
        // Mostrar la ganancia total en la interfaz
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
        
        // Sort orders by ID in descending order (highest/most recent first)
        const sortedOrders = [...orders].sort((a, b) => b.id - a.id);

        // Display only the 5 most recent orders
        sortedOrders.slice(0, 5).forEach(order => {
            const row = tableBody.insertRow();
            
            // Parse the date string and format it
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
    const todayString = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
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
    
    // Actualizar la fecha en algún lugar del dashboard si es necesario
    // document.getElementById('fechaActual').textContent = formattedDate;

    // Actualizar las ganancias
    actualizarGanancias(orders);
}

// Llamar a la función inicialmente
document.addEventListener('DOMContentLoaded', () => {
    actualizarFechaYGanancias();
});

// Actualizar cada 24 horas (86400000 milisegundos)
setInterval(actualizarFechaYGanancias, 86400000);

function createTopSellingProductsChart() {
    // Obtener el token desde el almacenamiento local
    const token = localStorage.getItem('token');

    // Hacer la solicitud para obtener los productos más vendidos
    fetch('http://localhost:8080/api/productos/mas-vendidos', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Añadir el token JWT en los headers
        }
    })
    .then(response => response.json()) // Parsear la respuesta a JSON
    .then(data => {
        // Extraer los nombres de los productos y las cantidades vendidas
        const labels = data.map(product => product.nombre);
        const salesData = data.map(product => product.cantidadVendida);

        // Obtener el contexto del canvas para el gráfico
        const ctx = document.getElementById('topSellingProductsChart').getContext('2d');

        // Crear el gráfico con los datos obtenidos
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,  // Nombres de los productos
                datasets: [{
                    label: 'Ventas',
                    data: salesData,  // Cantidad vendida de cada producto
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
        // data es un array de objetos { formaPago, cantidad }
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
