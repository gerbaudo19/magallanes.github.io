document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    let currentLanguage = 'es';

    const translations = {
        es: {
            loginTitle: 'Iniciar Sesión',
            usernameLabel: 'Nombre de Usuario',
            passwordLabel: 'Contraseña',
            loginButton: 'Iniciar Sesión',
            languageToggle: 'Switch to English',
            invalidCredentials: 'Credenciales inválidas',
            errorOccurred: 'Ocurrió un error'
        },
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                } else {
                    const token = await response.text();
                    localStorage.setItem('token', token);
                }
                window.location.href = 'index.html'; // Redirige a la página principal
            } else {
                alert(translations[currentLanguage].invalidCredentials);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(translations[currentLanguage].errorOccurred);
        }
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        togglePassword.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    // Inicializar el idioma
    updateLanguage();
});

function updateLanguage() {
    const currentLanguage = 'es'; // Set the current language dynamically if needed
    const elementsToTranslate = [
        { id: 'loginTitle', key: 'loginTitle' },
        { id: 'usernameLabel', key: 'usernameLabel' },
        { id: 'passwordLabel', key: 'passwordLabel' },
        { id: 'loginButton', key: 'loginButton' },
    ];

    elementsToTranslate.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.textContent = translations[currentLanguage][item.key];
        }
    });
}
