# 🚀 CÓMO USAR LA API - GUÍA RÁPIDA

## ✅ TODO LISTO

Tu proyecto EMPLEOYA ahora tiene una **API REST completa** con todas las funcionalidades.

---

## 🎯 PASO 1: INICIAR EL SERVIDOR

```bash
python manage.py runserver
```

El servidor estará en: **http://127.0.0.1:8000**

---

## 🔗 ENDPOINTS PRINCIPALES

### Panel Admin
```
http://127.0.0.1:8000/admin/
```

### API Base
```
http://127.0.0.1:8000/api/
```

---

## 📝 PROBAR LA API (Ejemplos Rápidos)

### 1. Ver Ofertas (Sin autenticación)
```bash
curl http://127.0.0.1:8000/api/ofertas/
```

### 2. Ver Categorías
```bash
curl http://127.0.0.1:8000/api/categorias/
```

### 3. Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@gmail.com", "password":"1234"}'
```

**Respuesta:**
```json
{
  "token": "abc123def456...",
  "user": {...}
}
```

### 4. Ver Mi Perfil (Con token)
```bash
curl http://127.0.0.1:8000/api/auth/perfil/ \
  -H "Authorization: Token abc123def456..."
```

---

## 🌐 CONECTAR TU FRONTEND REACT

### 1. Configurar la URL base en tu frontend

En tu archivo de configuración de React (`.env` o `config.js`):

```javascript
// .env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 2. Ejemplo de servicio de autenticación

```javascript
// src/services/auth.js
const API_URL = 'http://127.0.0.1:8000/api';

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async register(userData) {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) throw new Error('Registration failed');

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};
```

### 3. Ejemplo de servicio de ofertas

```javascript
// src/services/ofertas.js
const API_URL = 'http://127.0.0.1:8000/api';

export const ofertasService = {
  async getOfertas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/ofertas/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch ofertas');

    return response.json();
  },

  async getOfertaById(id) {
    const response = await fetch(`${API_URL}/ofertas/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch oferta');

    return response.json();
  },

  async crearOferta(ofertaData, token) {
    const response = await fetch(`${API_URL}/ofertas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(ofertaData)
    });

    if (!response.ok) throw new Error('Failed to create oferta');

    return response.json();
  }
};
```

### 4. Ejemplo de componente React

```javascript
// src/components/OfertasList.jsx
import { useState, useEffect } from 'react';
import { ofertasService } from '../services/ofertas';

export default function OfertasList() {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const data = await ofertasService.getOfertas();
        setOfertas(data.results);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfertas();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Ofertas de Trabajo</h1>
      {ofertas.map(oferta => (
        <div key={oferta.id}>
          <h3>{oferta.titulo}</h3>
          <p>{oferta.empresa_nombre}</p>
          <p>{oferta.ubicacion} - {oferta.modalidad}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 ENDPOINTS DISPONIBLES

### Autenticación
- ✅ `POST /api/auth/login/` - Iniciar sesión
- ✅ `POST /api/auth/register/` - Registrarse
- ✅ `POST /api/auth/logout/` - Cerrar sesión
- ✅ `GET /api/auth/perfil/` - Obtener perfil actual

### Ofertas
- ✅ `GET /api/ofertas/` - Listar ofertas (con filtros)
- ✅ `GET /api/ofertas/{id}/` - Detalle de oferta
- ✅ `POST /api/ofertas/` - Crear oferta (empleador)
- ✅ `PUT/PATCH /api/ofertas/{id}/` - Actualizar oferta
- ✅ `DELETE /api/ofertas/{id}/` - Eliminar oferta
- ✅ `GET /api/ofertas/{id}/similares/` - Ofertas similares
- ✅ `GET /api/ofertas/mis_ofertas/` - Mis ofertas (empleador)

### Postulaciones
- ✅ `GET /api/postulaciones/` - Mis postulaciones
- ✅ `POST /api/postulaciones/` - Postular a oferta
- ✅ `GET /api/postulaciones/{id}/` - Detalle de postulación
- ✅ `POST /api/postulaciones/{id}/cambiar_estado/` - Cambiar estado (empleador)

### Empresas
- ✅ `GET /api/empresas/` - Listar empresas
- ✅ `GET /api/empresas/{id}/` - Detalle de empresa
- ✅ `GET /api/empresas/mi_empresa/` - Mi empresa (empleador)
- ✅ `PUT/PATCH /api/empresas/mi_empresa/` - Actualizar mi empresa

### Perfiles
- ✅ `GET /api/perfiles/` - Listar perfiles
- ✅ `GET /api/perfiles/{id}/` - Detalle de perfil
- ✅ `GET /api/perfiles/mi_perfil/` - Mi perfil (postulante)
- ✅ `PUT/PATCH /api/perfiles/mi_perfil/` - Actualizar mi perfil

### Categorías
- ✅ `GET /api/categorias/` - Listar categorías

### Favoritos
- ✅ `GET /api/favoritos/` - Mis favoritos
- ✅ `POST /api/favoritos/` - Agregar favorito
- ✅ `DELETE /api/favoritos/{id}/` - Eliminar favorito

### Notificaciones
- ✅ `GET /api/notificaciones/` - Mis notificaciones
- ✅ `POST /api/notificaciones/{id}/marcar_leida/` - Marcar como leída
- ✅ `POST /api/notificaciones/marcar_todas_leidas/` - Marcar todas

### Estadísticas
- ✅ `GET /api/estadisticas/generales/` - Estadísticas generales
- ✅ `GET /api/estadisticas/mis-estadisticas/` - Mis estadísticas

---

## 🔐 USUARIOS DE PRUEBA

```javascript
// Admin
{ email: "admin@empleoya.com", password: "1234" }

// Empleadores
{ email: "empresa1@empleoya.com", password: "1234" }
{ email: "empresa2@empleoya.com", password: "1234" }
{ email: "empresa3@empleoya.com", password: "1234" }

// Postulantes
{ email: "juan.perez@gmail.com", password: "1234" }
{ email: "ana.garcia@gmail.com", password: "1234" }
{ email: "pedro.martinez@gmail.com", password: "1234" }
{ email: "lucia.silva@gmail.com", password: "1234" }
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Ver: **API_DOCUMENTATION.md** para la documentación completa de todos los endpoints.

---

## 🛠️ HERRAMIENTAS ÚTILES

### 1. Postman / Insomnia
Importa estos endpoints para probar la API visualmente.

### 2. Navegador REST Client
Extensión de VSCode para probar APIs directamente.

### 3. curl
Herramienta de línea de comandos para probar endpoints.

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cómo obtengo el token de un usuario?
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com", "password":"1234"}'
```

### ¿Cómo uso el token en las peticiones?
```bash
curl http://127.0.0.1:8000/api/ofertas/mis_ofertas/ \
  -H "Authorization: Token abc123def456..."
```

### ¿Cómo filtro las ofertas?
```bash
# Por modalidad
curl "http://127.0.0.1:8000/api/ofertas/?modalidad=remoto"

# Por categoría
curl "http://127.0.0.1:8000/api/ofertas/?categoria=1"

# Búsqueda
curl "http://127.0.0.1:8000/api/ofertas/?search=desarrollador"

# Combinado
curl "http://127.0.0.1:8000/api/ofertas/?modalidad=remoto&categoria=1&search=senior"
```

---

## ✅ ESTADO DEL PROYECTO

```
✅ API REST completa
✅ Autenticación por Token
✅ CORS configurado
✅ Paginación automática
✅ Filtros y búsqueda
✅ Permisos por tipo de usuario
✅ Serializers validados
✅ Documentación completa
✅ Datos de prueba cargados
✅ Base de datos SQLite incluida

ESTADO: LISTO PARA USAR
```

---

**¡Tu API está lista! Ahora puedes conectar tu frontend React.** 🎉
