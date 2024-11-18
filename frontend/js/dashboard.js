import { fetchData } from './main.js';

let clients = [];
let employees = [];
let products = [];
let orders = [];

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
                                <h5 class="card-title">Ventas por categoría</h5>
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
    });

    createTopSellingProductsChart();
    createSalesByCategoryChart();
}

function updateSystemSummary() {
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
}

function updateRecentOrders() {
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
        orders.slice(0, 5).forEach(order => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.cliente.nombre} ${order.cliente.apellido}</td>
                <td>${order.fecha}</td>
                <td>$${order.precioTotal.toFixed(2)}</td>
            `;
        });
    }
}

function createTopSellingProductsChart() {
    const ctx = document.getElementById('topSellingProductsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
            datasets: [{
                label: 'Sales',
                data: [12, 19, 3, 5, 2],
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
}

function createSalesByCategoryChart() {
    const ctx = document.getElementById('salesByCategoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Category A', 'Category B', 'Category C', 'Category D'],
            datasets: [{
                data: [30, 50, 20, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Sales by Category'
                }
            }
        }
    });
}