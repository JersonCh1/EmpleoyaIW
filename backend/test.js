let currentToken = '';
const API_BASE = '/api';

function showMessage(message, isError = false) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.innerHTML = `<strong>${new Date().toLocaleTimeString()}:</strong> ${message}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showToken(token) {
    currentToken = token;
    document.getElementById('currentToken').textContent = token;
    document.getElementById('tokenDisplay').style.display = 'block';
}

async function register() {
    try {
        const data = {
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            nombre: document.getElementById('regNombre').value,
            apellido: document.getElementById('regApellido').value,
            telefono: document.getElementById('regTelefono').value,
            tipo_usuario: document.getElementById('regTipo').value
        };

        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Usuario registrado: ${result.user.nombre} ${result.user.apellido}`);
            showToken(result.token);
            document.getElementById('loginEmail').value = data.email;
            document.getElementById('loginPassword').value = data.password;
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message || ''}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function login() {
    try {
        const data = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Login exitoso: Bienvenido ${result.user.nombre}`);
            showToken(result.token);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function getProfile() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Perfil obtenido: ${result.user.nombre} ${result.user.apellido} (${result.user.tipo_usuario})`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function testPostulante() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/test/postulante`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ ${result.message} - Usuario: ${result.user}`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function testEmpleador() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/test/empleador`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ ${result.message} - Usuario: ${result.user}`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

showMessage('🚀 Probador de APIs iniciado. Servidor funcionando correctamente');