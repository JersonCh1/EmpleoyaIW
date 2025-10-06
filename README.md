# EMPLEOYA - Sistema de Bolsa Laboral

Sistema de gestión de empleo desarrollado con Django 5.2.7 y SQLite.

## 👥 Desarrolladores

- **Piero De La Cruz**
- **Jerson Chura**

**Universidad Nacional de San Agustín - Ingeniería Web**

---

## 🚀 Características

- ✅ Sistema de autenticación completo (empleadores y postulantes)
- ✅ Gestión de ofertas de trabajo
- ✅ Sistema de postulaciones
- ✅ Dashboards diferenciados por tipo de usuario
- ✅ API REST con Django REST Framework
- ✅ Autenticación por Token
- ✅ Diseño moderno y responsive
- ✅ Base de datos SQLite con datos de prueba

---

## 📋 Requisitos

- Python 3.10+
- pip

---

## 🛠️ Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/JersonCh1/EmpleoyaIW.git
cd EmpleoyaIW
\`\`\`

### 2. Crear entorno virtual

\`\`\`bash
python -m venv .venv
\`\`\`

### 3. Activar entorno virtual

**Windows:**
\`\`\`bash
.venv\Scripts\activate
\`\`\`

**Linux/Mac:**
\`\`\`bash
source .venv/bin/activate
\`\`\`

### 4. Instalar dependencias

\`\`\`bash
pip install django djangorestframework django-cors-headers
\`\`\`

### 5. Iniciar el servidor

\`\`\`bash
python manage.py runserver
\`\`\`

El servidor estará disponible en: **http://127.0.0.1:8000/**

---

## 👤 Usuarios de Prueba

### Admin
- **Email:** admin@empleoya.com
- **Contraseña:** 1234

### Empleador
- **Email:** empresa1@empleoya.com
- **Contraseña:** 1234

### Postulante
- **Email:** juan.perez@gmail.com
- **Contraseña:** 1234

---

## 📁 Estructura del Proyecto

\`\`\`
empleoya/
├── MyWebApps/              # Aplicación principal Django
│   ├── models.py           # Modelos de base de datos
│   ├── views.py            # Vistas web
│   ├── api_views.py        # Vistas API REST
│   ├── serializers.py      # Serializers para API
│   ├── urls.py             # URLs de la aplicación
│   ├── admin.py            # Configuración del admin
│   ├── migrations/         # Migraciones de BD
│   └── templates/          # Templates HTML
├── empleoya_django/        # Configuración del proyecto
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py               # Script de gestión Django
├── db.sqlite3              # Base de datos SQLite
├── cargar_datos.py         # Script para cargar datos de prueba
└── crear_admin.py          # Script para crear usuario admin
\`\`\`

---

## 🌐 Rutas Principales

### Web
- \`/\` - Página de inicio
- \`/login/\` - Iniciar sesión
- \`/register/\` - Registrarse
- \`/dashboard/\` - Dashboard
- \`/ofertas/\` - Lista de ofertas
- \`/mis-ofertas/\` - Mis ofertas (empleador)
- \`/mis-postulaciones/\` - Mis postulaciones (postulante)

### API REST
- \`/api/auth/login/\` - Login API
- \`/api/ofertas/\` - CRUD de ofertas
- \`/api/postulaciones/\` - CRUD de postulaciones

Ver: **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## 📊 Modelos

- **Usuario** - Usuarios del sistema
- **Empresa** - Empresas empleadoras
- **PerfilPostulante** - Perfiles de postulantes
- **Categoria** - Categorías de ofertas
- **OfertaTrabajo** - Ofertas publicadas
- **Postulacion** - Postulaciones
- **Favorito** - Favoritos
- **Notificacion** - Notificaciones

---

## 🔧 Scripts Útiles

\`\`\`bash
# Cargar datos de prueba
python cargar_datos.py

# Crear usuario admin
python crear_admin.py

# Acceder al admin
python manage.py runserver
# http://127.0.0.1:8000/admin/
\`\`\`

---

## 📝 Requisitos del Profesor ✅

1. ✅ Usuario admin: \`admin@empleoya.com\` / \`1234\`
2. ✅ Base de datos \`db.sqlite3\` incluida
3. ✅ Carpeta \`MyWebApps\` presente
4. ✅ \`.gitignore\` configurado
5. ✅ Migraciones aplicadas y datos cargados

---

## 🎨 Tecnologías

- Django 5.2.7
- Django REST Framework
- SQLite
- HTML5 + CSS3

---

**Ingeniería Web - UNSA - 2025**
