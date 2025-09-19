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
            showMessage(`✅ Usuario registrado: ${result.user.nombre} ${result.user.apellido} (${result.user.tipo_usuario})`);
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
            showMessage(`✅ Login exitoso: Bienvenido ${result.user.nombre} (${result.user.tipo_usuario})`);
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

// ==========================================
// FUNCIONES PARA PERFILES DE POSTULANTES
// ==========================================

async function createPerfil() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const data = {
            titulo_profesional: document.getElementById('tituloProfesional').value,
            descripcion: document.getElementById('descripcionPerfil').value,
            ubicacion: document.getElementById('ubicacionPerfil').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            nivel_experiencia: document.getElementById('nivelExperiencia').value,
            salario_esperado: parseFloat(document.getElementById('salarioEsperado').value),
            modalidad_preferida: document.getElementById('modalidadPreferida').value,
            disponibilidad_inmediata: document.getElementById('disponibilidadInmediata').checked
        };

        const response = await fetch(`${API_BASE}/perfiles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Perfil creado: ${result.perfil.titulo_profesional} - ID: ${result.perfil.id_perfil}`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message || ''}`, true);
            if (result.details) {
                result.details.forEach(detail => {
                    showMessage(`   • ${detail.msg}`, true);
                });
            }
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function getMyPerfil() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/perfiles/my/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            const perfil = result.perfil;
            const completitud = result.completitud;
            const stats = result.estadisticas;
            
            showMessage(`✅ Perfil: ${perfil.titulo_profesional || 'Sin título'} - Ubicación: ${perfil.ubicacion || 'Sin ubicación'}`);
            showMessage(`📊 Completitud: ${completitud.completo ? 'Completo ✓' : 'Incompleto - Faltan: ' + completitud.campos_faltantes.join(', ')}`);
            showMessage(`📈 Estadísticas: ${stats.total_postulaciones} postulaciones, ${stats.aceptados || 0} aceptadas`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function updatePerfil() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const data = {
            titulo_profesional: document.getElementById('tituloProfesional').value,
            descripcion: document.getElementById('descripcionPerfil').value,
            ubicacion: document.getElementById('ubicacionPerfil').value,
            fecha_nacimiento: document.getElementById('fechaNacimiento').value,
            nivel_experiencia: document.getElementById('nivelExperiencia').value,
            salario_esperado: parseFloat(document.getElementById('salarioEsperado').value),
            modalidad_preferida: document.getElementById('modalidadPreferida').value,
            disponibilidad_inmediata: document.getElementById('disponibilidadInmediata').checked
        };

        const response = await fetch(`${API_BASE}/perfiles/my/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`✅ Perfil actualizado: ${result.perfil.titulo_profesional}`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function getMyStats() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/perfiles/my/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            const stats = result.estadisticas;
            const completitud = result.completitud;
            
            showMessage(`📊 Estadísticas completas:`);
            showMessage(`   • Total postulaciones: ${stats.total_postulaciones}`);
            showMessage(`   • Pendientes: ${stats.postulaciones_pendientes}`);
            showMessage(`   • En revisión: ${stats.en_revision}`);
            showMessage(`   • Preseleccionado: ${stats.preseleccionados}`);
            showMessage(`   • Entrevistas: ${stats.entrevistas}`);
            showMessage(`   • Aceptados: ${stats.aceptados}`);
            showMessage(`   • Rechazados: ${stats.rechazados}`);
            showMessage(`   • Puntuación promedio: ${stats.puntuacion_promedio ? stats.puntuacion_promedio.toFixed(1) : 'N/A'}`);
            showMessage(`   • Perfil completo: ${completitud.completo ? 'Sí ✓' : 'No - Faltan: ' + completitud.campos_faltantes.join(', ')}`);
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

async function checkCompletitud() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/perfiles/my/completitud`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            if (result.completo) {
                showMessage(`✅ Tu perfil está completo y listo para postular a ofertas`);
            } else {
                showMessage(`⚠️ Tu perfil está incompleto. Campos faltantes: ${result.campos_faltantes.join(', ')}`, true);
            }
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

// ==========================================
// FUNCIONES PARA BÚSQUEDA DE POSTULANTES
// ==========================================

async function searchPostulantes() {
    if (!currentToken) {
        showMessage('❌ Necesitas hacer login primero', true);
        return;
    }

    try {
        const searchParams = new URLSearchParams();
        
        const search = document.getElementById('searchPostulantes').value;
        const ubicacion = document.getElementById('ubicacionBusqueda').value;
        const nivel = document.getElementById('nivelBusqueda').value;
        const modalidad = document.getElementById('modalidadBusqueda').value;
        const salarioMin = document.getElementById('salarioMinBusqueda').value;
        const salarioMax = document.getElementById('salarioMaxBusqueda').value;
        const edadMin = document.getElementById('edadMinBusqueda').value;
        const edadMax = document.getElementById('edadMaxBusqueda').value;
        
        if (search) searchParams.append('search', search);
        if (ubicacion) searchParams.append('ubicacion', ubicacion);
        if (nivel) searchParams.append('nivel_experiencia', nivel);
        if (modalidad) searchParams.append('modalidad_preferida', modalidad);
        if (salarioMin) searchParams.append('salario_min', salarioMin);
        if (salarioMax) searchParams.append('salario_max', salarioMax);
        if (edadMin) searchParams.append('edad_min', edadMin);
        if (edadMax) searchParams.append('edad_max', edadMax);

        const response = await fetch(`${API_BASE}/perfiles/search?${searchParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`🔍 Búsqueda completada: ${result.postulantes.length} postulantes encontrados de ${result.pagination.total} total`);
            
            if (result.postulantes.length > 0) {
                result.postulantes.slice(0, 3).forEach((postulante, index) => {
                    showMessage(`   ${index + 1}. ${postulante.nombre} ${postulante.apellido} - ${postulante.titulo_profesional || 'Sin título'} (${postulante.ubicacion || 'Sin ubicación'})`);
                });
                
                if (result.postulantes.length > 3) {
                    showMessage(`   ... y ${result.postulantes.length - 3} postulantes más`);
                }
            }
        } else {
            showMessage(`❌ Error: ${result.error} - ${result.message}`, true);
        }
    } catch (error) {
        showMessage(`❌ Error de conexión: ${error.message}`, true);
    }
}

function clearFilters() {
    document.getElementById('searchPostulantes').value = '';
    document.getElementById('ubicacionBusqueda').value = '';
    document.getElementById('nivelBusqueda').value = '';
    document.getElementById('modalidadBusqueda').value = '';
    document.getElementById('salarioMinBusqueda').value = '';
    document.getElementById('salarioMaxBusqueda').value = '';
    document.getElementById('edadMinBusqueda').value = '';
    document.getElementById('edadMaxBusqueda').value = '';
    showMessage('🧹 Filtros limpiados');
}

// Mensaje inicial
showMessage('🚀 Probador de APIs iniciado. Sistema completo disponible');