import { initDashboard } from './dashboard.js';
import { initClients } from './clients.js';
import { initEmployees } from './employees.js';
import { initProducts } from './products.js';
import { initOrders } from './orders.js';
import { initTipoPrenda } from './tipoPrenda.js';

let currentSection = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadSection(currentSection);
    addLogoutButton();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('#navbarNav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.target.getAttribute('data-section');
            loadSection(targetSection);
        });
    });
}

function loadSection(sectionName) {
    currentSection = sectionName;
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = ''; // Clear current content

    switch(sectionName) {
        case 'dashboard':
            initDashboard(mainContent);
            break;
        case 'clients':
            initClients(mainContent);
            break;
        case 'employees':
            initEmployees(mainContent);
            break;
        case 'products':
            initProducts(mainContent);
            break;
        case 'orders':
            initOrders(mainContent);
            break;
        case 'tipoPrenda':
            initTipoPrenda(mainContent);
            break;
    }

    updateActiveNavLink(sectionName);
}

function updateActiveNavLink(sectionName) {
    const navLinks = document.querySelectorAll('#navbarNav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
}


export function getAuthHeader() {
    const token = localStorage.getItem('token'); 
    return token ? { Authorization: `Bearer ${token}` } : {};
}


export function fetchData(url, callback) {
    fetch(url, {
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error(`Error fetching data from ${url}:`, error));
}

export function handleFormSubmit(formId, url, method, successMessage, successCallback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const jsonData = Object.fromEntries(formData.entries());
            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader() // Asegúrate de que esta función retorna un objeto con el encabezado de autorización
                },
                body: JSON.stringify(jsonData)
            })
            .then(response => {
                if (response.ok) {
                    alert(successMessage);
                    const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
                    if (modal) {
                        modal.hide();
                    }
                    successCallback();
                } else {
                    alert('Error submitting form');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
}


function addLogoutButton() {
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    if (navbarNav) {
        const logoutLi = document.createElement('li');
        logoutLi.className = 'nav-item';
        const logoutLink = document.createElement('a');
        logoutLink.className = 'nav-link btn btn-danger text-white';
        logoutLink.href = '#';
        logoutLink.textContent = 'Cerrar sesión';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
        logoutLi.appendChild(logoutLink);
        navbarNav.appendChild(logoutLi);
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}