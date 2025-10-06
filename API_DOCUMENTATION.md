# 📚 EMPLEOYA - Documentación API REST

**Base URL:** `http://127.0.0.1:8000/api/`

---

## 🔐 AUTENTICACIÓN

Todos los endpoints protegidos requieren un token de autenticación en el header:

```
Authorization: Token <tu_token_aqui>
```

### 1. Login

**Endpoint:** `POST /api/auth/login/`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "1234"
}
```

**Response:**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Perez",
    "nombre_completo": "Juan Perez",
    "tipo_usuario": "postulante",
    "estado": "activo"
  }
}
```

### 2. Registro

**Endpoint:** `POST /api/auth/register/`

**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "1234",
  "password2": "1234",
  "nombre": "Nuevo",
  "apellido": "Usuario",
  "telefono": "987654321",
  "tipo_usuario": "postulante"
}
```

**Tipos de usuario:** `postulante`, `empleador`

**Response:**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": { ... }
}
```

### 3. Logout

**Endpoint:** `POST /api/auth/logout/`

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

### 4. Perfil Actual

**Endpoint:** `GET /api/auth/perfil/`

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "nombre": "Juan",
  "apellido": "Perez",
  "empresa": { ... },  // Si es empleador
  "perfil_postulante": { ... }  // Si es postulante
}
```

---

## 📁 CATEGORÍAS

### Listar Categorías

**Endpoint:** `GET /api/categorias/`

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "nombre": "Tecnología",
      "descripcion": "Trabajos en el sector tecnológico",
      "icono": "laptop",
      "activa": true,
      "num_ofertas": 15
    }
  ]
}
```

---

## 💼 OFERTAS DE TRABAJO

### 1. Listar Ofertas

**Endpoint:** `GET /api/ofertas/`

**Query Params:**
- `search` - Buscar por título o descripción
- `categoria` - Filtrar por ID de categoría
- `modalidad` - `presencial`, `remoto`, `hibrido`
- `ubicacion` - Buscar por ubicación
- `tipo_contrato` - `tiempo_completo`, `medio_tiempo`, etc.
- `nivel_experiencia` - `sin_experiencia`, `junior`, `senior`, etc.
- `salario_min` - Salario mínimo
- `salario_max` - Salario máximo
- `ordering` - `-fecha_publicacion`, `salario_max`, etc.
- `page` - Número de página

**Ejemplo:** `GET /api/ofertas/?modalidad=remoto&categoria=1&page=1`

**Response:**
```json
{
  "count": 50,
  "next": "http://127.0.0.1:8000/api/ofertas/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "titulo": "Desarrollador Full Stack Senior",
      "empresa_nombre": "TechSolutions Peru",
      "empresa_logo": null,
      "categoria_nombre": "Tecnología",
      "ubicacion": "Lima, Peru",
      "modalidad": "remoto",
      "tipo_contrato": "tiempo_completo",
      "nivel_experiencia": "senior",
      "salario_min": "3000.00",
      "salario_max": "5000.00",
      "moneda": "PEN",
      "fecha_publicacion": "2025-10-05T21:55:39Z",
      "vistas": 42,
      "vacantes_disponibles": 2
    }
  ]
}
```

### 2. Detalle de Oferta

**Endpoint:** `GET /api/ofertas/{id}/`

**Response:**
```json
{
  "id": 1,
  "empresa": {
    "id": 1,
    "nombre_empresa": "TechSolutions Peru",
    "ruc": "20123456789",
    "descripcion": "Empresa líder en soluciones tecnológicas",
    "sector": "Tecnología",
    "ubicacion": "Lima, Peru",
    "sitio_web": null,
    "logo_url": null,
    "tamaño_empresa": "mediana",
    "total_ofertas": 5
  },
  "categoria": {
    "id": 1,
    "nombre": "Tecnología",
    "descripcion": "Trabajos en el sector tecnológico"
  },
  "titulo": "Desarrollador Full Stack Senior",
  "descripcion": "Buscamos desarrollador Full Stack...",
  "requisitos": "- 3+ años de experiencia\n- React y Node.js",
  "responsabilidades": "- Desarrollar aplicaciones web",
  "beneficios": "- Trabajo remoto\n- Seguro médico",
  "salario_min": "3000.00",
  "salario_max": "5000.00",
  "moneda": "PEN",
  "ubicacion": "Lima, Peru",
  "modalidad": "remoto",
  "tipo_contrato": "tiempo_completo",
  "nivel_experiencia": "senior",
  "vacantes_disponibles": 2,
  "fecha_publicacion": "2025-10-05T21:55:39Z",
  "fecha_expiracion": "2025-11-04T21:55:39Z",
  "estado": "activa",
  "aprobada_admin": true,
  "vistas": 42,
  "total_postulaciones": 15
}
```

### 3. Ofertas Similares

**Endpoint:** `GET /api/ofertas/{id}/similares/`

**Response:** Array de ofertas similares

### 4. Mis Ofertas (Empleador)

**Endpoint:** `GET /api/ofertas/mis_ofertas/`

**Headers:** `Authorization: Token <token>`

**Response:** Array de ofertas del empleador actual

### 5. Crear Oferta (Empleador)

**Endpoint:** `POST /api/ofertas/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "categoria": 1,
  "titulo": "Nueva Oferta",
  "descripcion": "Descripción de la oferta",
  "requisitos": "Requisitos del puesto",
  "responsabilidades": "Responsabilidades",
  "beneficios": "Beneficios",
  "salario_min": "2000.00",
  "salario_max": "3000.00",
  "moneda": "PEN",
  "ubicacion": "Lima, Peru",
  "modalidad": "remoto",
  "tipo_contrato": "tiempo_completo",
  "nivel_experiencia": "junior",
  "vacantes_disponibles": 1
}
```

### 6. Actualizar Oferta

**Endpoint:** `PUT /api/ofertas/{id}/` o `PATCH /api/ofertas/{id}/`

**Headers:** `Authorization: Token <token>`

### 7. Eliminar Oferta

**Endpoint:** `DELETE /api/ofertas/{id}/`

**Headers:** `Authorization: Token <token>`

---

## 📝 POSTULACIONES

### 1. Listar Mis Postulaciones (Postulante)

**Endpoint:** `GET /api/postulaciones/`

**Headers:** `Authorization: Token <token>`

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "oferta": 1,
      "oferta_titulo": "Desarrollador Full Stack Senior",
      "empresa_nombre": "TechSolutions Peru",
      "postulante": 1,
      "postulante_nombre": "Juan Perez",
      "postulante_email": "juan.perez@gmail.com",
      "fecha_postulacion": "2025-10-05T21:55:40Z",
      "estado": "pendiente",
      "puntuacion_match": 85
    }
  ]
}
```

### 2. Detalle de Postulación

**Endpoint:** `GET /api/postulaciones/{id}/`

**Headers:** `Authorization: Token <token>`

### 3. Crear Postulación (Postulante)

**Endpoint:** `POST /api/postulaciones/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "oferta": 1,
  "carta_presentacion": "Estimado reclutador, estoy muy interesado...",
  "cv_url_postulacion": "https://..."
}
```

### 4. Cambiar Estado de Postulación (Empleador)

**Endpoint:** `POST /api/postulaciones/{id}/cambiar_estado/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "estado": "en_revision",
  "notas_empleador": "Candidato interesante"
}
```

**Estados disponibles:**
- `pendiente`
- `en_revision`
- `preseleccionado`
- `entrevista`
- `rechazado`
- `aceptado`

---

## 🏢 EMPRESAS

### 1. Listar Empresas

**Endpoint:** `GET /api/empresas/`

### 2. Detalle de Empresa

**Endpoint:** `GET /api/empresas/{id}/`

### 3. Mi Empresa (Empleador)

**Endpoint:** `GET /api/empresas/mi_empresa/`

**Headers:** `Authorization: Token <token>`

### 4. Actualizar Mi Empresa

**Endpoint:** `PUT /api/empresas/mi_empresa/` o `PATCH /api/empresas/mi_empresa/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "nombre_empresa": "Mi Empresa SAC",
  "ruc": "20123456789",
  "descripcion": "Somos una empresa...",
  "sector": "Tecnología",
  "ubicacion": "Lima, Peru",
  "sitio_web": "https://miempresa.com",
  "tamaño_empresa": "pyme",
  "telefono_empresa": "987654321"
}
```

---

## 👤 PERFILES DE POSTULANTE

### 1. Listar Perfiles

**Endpoint:** `GET /api/perfiles/`

### 2. Detalle de Perfil

**Endpoint:** `GET /api/perfiles/{id}/`

### 3. Mi Perfil (Postulante)

**Endpoint:** `GET /api/perfiles/mi_perfil/`

**Headers:** `Authorization: Token <token>`

### 4. Actualizar Mi Perfil

**Endpoint:** `PUT /api/perfiles/mi_perfil/` o `PATCH /api/perfiles/mi_perfil/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "titulo_profesional": "Desarrollador Full Stack",
  "resumen_profesional": "Desarrollador con 3 años de experiencia...",
  "nivel_experiencia": "semi_senior",
  "años_experiencia": 3,
  "habilidades": "JavaScript, React, Node.js, Python, Django",
  "ubicacion": "Lima, Peru",
  "salario_esperado": "3500.00",
  "disponibilidad": "inmediata"
}
```

---

## ⭐ FAVORITOS

### 1. Listar Mis Favoritos

**Endpoint:** `GET /api/favoritos/`

**Headers:** `Authorization: Token <token>`

### 2. Agregar a Favoritos

**Endpoint:** `POST /api/favoritos/`

**Headers:** `Authorization: Token <token>`

**Request:**
```json
{
  "oferta_id": 1
}
```

### 3. Eliminar de Favoritos

**Endpoint:** `DELETE /api/favoritos/{id}/`

**Headers:** `Authorization: Token <token>`

---

## 🔔 NOTIFICACIONES

### 1. Listar Mis Notificaciones

**Endpoint:** `GET /api/notificaciones/`

**Headers:** `Authorization: Token <token>`

### 2. Marcar como Leída

**Endpoint:** `POST /api/notificaciones/{id}/marcar_leida/`

**Headers:** `Authorization: Token <token>`

### 3. Marcar Todas como Leídas

**Endpoint:** `POST /api/notificaciones/marcar_todas_leidas/`

**Headers:** `Authorization: Token <token>`

---

## 📊 ESTADÍSTICAS

### 1. Estadísticas Generales

**Endpoint:** `GET /api/estadisticas/generales/`

**Response:**
```json
{
  "total_ofertas": 50,
  "total_empresas": 10,
  "total_postulantes": 100,
  "total_categorias": 8,
  "ofertas_esta_semana": 5
}
```

### 2. Mis Estadísticas

**Endpoint:** `GET /api/estadisticas/mis-estadisticas/`

**Headers:** `Authorization: Token <token>`

**Response (Empleador):**
```json
{
  "total_ofertas": 5,
  "ofertas_activas": 3,
  "total_postulaciones": 25,
  "postulaciones_pendientes": 10,
  "postulaciones_este_mes": 15
}
```

**Response (Postulante):**
```json
{
  "total_postulaciones": 10,
  "en_proceso": 5,
  "aceptadas": 2,
  "rechazadas": 3,
  "postulaciones_este_mes": 3
}
```

---

## 🔧 CÓDIGOS DE ESTADO HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error en los datos enviados
- `401 Unauthorized` - Token inválido o no proporcionado
- `403 Forbidden` - No tienes permisos para esta acción
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 📝 EJEMPLOS DE USO

### Ejemplo 1: Login y Obtener Ofertas

```javascript
// 1. Login
const loginResponse = await fetch('http://127.0.0.1:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan.perez@gmail.com',
    password: '1234'
  })
});
const { token } = await loginResponse.json();

// 2. Obtener ofertas
const ofertasResponse = await fetch('http://127.0.0.1:8000/api/ofertas/?modalidad=remoto', {
  headers: { 'Authorization': `Token ${token}` }
});
const ofertas = await ofertasResponse.json();
```

### Ejemplo 2: Crear Postulación

```javascript
const response = await fetch('http://127.0.0.1:8000/api/postulaciones/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`
  },
  body: JSON.stringify({
    oferta: 1,
    carta_presentacion: 'Estimado reclutador...'
  })
});
```

---

## 🚀 INICIO RÁPIDO

1. **Instalar dependencias:**
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

2. **Iniciar servidor:**
   ```bash
   python manage.py runserver
   ```

3. **API Base URL:**
   ```
   http://127.0.0.1:8000/api/
   ```

4. **Admin Panel:**
   ```
   http://127.0.0.1:8000/admin/
   ```

---

**¡La API está lista para usar!** 🎉
