# EMPLEOYA - Bolsa de Trabajo Online

Proyecto de bolsa laboral hecho con Django para el curso de Ingeniería Web. Permite a empresas publicar ofertas y a postulantes buscar trabajo.

## 👥 Equipo

- Piero De La Cruz
- Jerson Chura

**Universidad La Salle - Ingeniería Web**

---

## 🚀 Lo que hace

- Login para empresas y postulantes
- Las empresas pueden publicar ofertas de trabajo
- Los postulantes pueden ver ofertas y postularse
- Cada usuario tiene su propio dashboard
- También tiene API REST por si queremos conectar con React después
- Diseño responsive (se ve bien en celular)
- Ya viene con datos de prueba cargados para probar rápido

---

## 📋 Requisitos

- Python 3.10+
- pip

---

## 🛠️ Cómo ejecutarlo

### 1. Clona el repo

\`\`\`bash
git clone https://github.com/JersonCh1/EmpleoyaIW.git
cd EmpleoyaIW
\`\`\`

### 2. Crea el entorno virtual (recomendado)

\`\`\`bash
python -m venv .venv
\`\`\`

### 3. Activa el entorno

Si estás en Windows:
\`\`\`bash
.venv\Scripts\activate
\`\`\`

Si estás en Linux/Mac:
\`\`\`bash
source .venv/bin/activate
\`\`\`

### 4. Instala las librerías necesarias

\`\`\`bash
pip install django djangorestframework django-cors-headers
\`\`\`

### 5. Corre el servidor

\`\`\`bash
python manage.py runserver
\`\`\`

Luego abre en el navegador: **http://127.0.0.1:8000/**

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

---

Proyecto hecho para el curso de Ingeniería Web - Universidad La Salle 2025
