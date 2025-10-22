# EMPLEOYA - Sistema de Bolsa de Trabajo

Proyecto de bolsa laboral desarrollado con Django para el curso de Ingeniería Web. Sistema completo que permite a empresas publicar ofertas de trabajo y a postulantes buscar empleo.

**Desarrolladores:** Piero De La Cruz, Jerson Chura
**Institución:** Universidad La Salle - Ingeniería Web
**Año:** 2025

---

## 📋 REQUISITOS

- Python 3.10 o superior
- pip (gestor de paquetes de Python)
- Navegador web

---

## 🚀 INSTALACIÓN Y EJECUCIÓN

### Paso 1: Clonar o descargar el proyecto

```bash
git clone https://github.com/JersonCh1/EmpleoyaIW.git
cd EmpleoyaIW
```

O descarga el ZIP y descomprime en una carpeta.

### Paso 2: Crear entorno virtual (RECOMENDADO)

```bash
python -m venv .venv
```

### Paso 3: Activar el entorno virtual

**Windows:**
```bash
.venv\Scripts\activate
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

### Paso 4: Instalar Django

```bash
pip install django
```

### Paso 5: Verificar que la base de datos existe

El proyecto ya incluye `db.sqlite3` con datos de prueba. Si el archivo no existe o quieres recrear la base de datos:

```bash
# Eliminar base de datos (si existe)
rm db.sqlite3

# Eliminar migraciones anteriores
rm -rf MyWebApps/migrations/

# Crear carpeta de migraciones
mkdir MyWebApps/migrations
touch MyWebApps/migrations/__init__.py

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Cargar datos de prueba
python crear_datos_iniciales.py
```

### Paso 6: Iniciar el servidor

```bash
python manage.py runserver
```

Verás un mensaje como:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Paso 7: Abrir en el navegador

Abre tu navegador y ve a: **http://127.0.0.1:8000/**

---

## 👤 USUARIOS DE PRUEBA

La base de datos ya incluye 3 usuarios de prueba:

### Administrador (acceso completo)
```
Email: admin@empleoya.com
Contraseña: 1234
Panel admin: http://127.0.0.1:8000/admin/
```

### Empleador (puede publicar ofertas)
```
Email: empresa1@empleoya.com
Contraseña: 1234
Empresa: TechSolutions Perú
```

### Postulante (puede postularse)
```
Email: juan.perez@gmail.com
Contraseña: 1234
Perfil: Desarrollador Full Stack
```

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### Para Visitantes (sin login)
- Ver página de inicio
- Registrarse como empleador o postulante
- Iniciar sesión

### Para Empleadores
- Dashboard con estadísticas de ofertas y postulaciones
- Crear nuevas ofertas de trabajo
- Ver y gestionar ofertas publicadas
- Revisar postulaciones recibidas
- Editar perfil de empresa

### Para Postulantes
- Dashboard con ofertas recomendadas
- Buscar y filtrar ofertas de trabajo
- Ver detalles completos de cada oferta
- Postularse a ofertas
- Ver estado de postulaciones
- Editar perfil profesional

### Para Administradores
- Acceso al panel de administración de Django
- Gestionar todos los usuarios
- Aprobar/rechazar ofertas
- Gestionar categorías
- Ver todas las postulaciones

---

## 🌐 RUTAS DISPONIBLES

### Páginas Públicas
- `/` - Página de inicio
- `/login/` - Iniciar sesión
- `/register/` - Registrarse

### Autenticado (requiere login)
- `/dashboard/` - Dashboard (redirige según tipo de usuario)
- `/ofertas/` - Lista de todas las ofertas
- `/ofertas/<id>/` - Detalle de una oferta específica
- `/perfil/` - Ver y editar perfil
- `/logout/` - Cerrar sesión

### Solo Empleadores
- `/mis-ofertas/` - Mis ofertas publicadas
- `/crear-oferta/` - Crear nueva oferta de trabajo
- `/ofertas/<id>/postulaciones/` - Ver postulaciones de mi oferta

### Solo Postulantes
- `/postular/<id>/` - Postularse a una oferta
- `/mis-postulaciones/` - Ver mis postulaciones

### Administración
- `/admin/` - Panel de administración Django

---

## 📁 ESTRUCTURA DEL PROYECTO

```
EmpleoyaIW/
├── manage.py                   # Script principal de Django
├── db.sqlite3                  # Base de datos SQLite
├── crear_datos_iniciales.py    # Script para cargar datos de prueba
│
├── MyWebApps/                  # Aplicación principal
│   ├── models.py               # Modelos de base de datos
│   ├── views.py                # Lógica de vistas
│   ├── urls.py                 # Rutas de la aplicación
│   ├── admin.py                # Configuración del panel admin
│   ├── migrations/             # Migraciones de base de datos
│   └── templates/              # Plantillas HTML
│       └── MyWebApps/
│           ├── base.html
│           ├── home.html
│           ├── login.html
│           ├── register.html
│           ├── dashboard_empleador.html
│           ├── dashboard_postulante.html
│           ├── ofertas_lista.html
│           ├── oferta_detalle.html
│           ├── crear_oferta.html
│           ├── mis_ofertas.html
│           ├── mis_postulaciones.html
│           ├── postular_oferta.html
│           ├── postulaciones_oferta.html
│           ├── perfil_empresa.html
│           └── perfil_postulante.html
│
└── empleoya_django/            # Configuración del proyecto
    ├── settings.py             # Configuración de Django
    ├── urls.py                 # Rutas principales
    ├── wsgi.py                 # Servidor WSGI
    └── asgi.py                 # Servidor ASGI
```

---

## 💾 MODELOS DE BASE DE DATOS

El proyecto incluye 8 modelos principales:

### 1. Usuario (modelo personalizado con AbstractUser)
- Extiende AbstractUser de Django
- Login con email en lugar de username
- Campos: email, first_name, last_name, telefono, tipo_usuario, estado
- Tipos: postulante, empleador, admin

### 2. Empresa
- Perfil de empresas empleadoras
- Campos: nombre_empresa, ruc, descripcion, sector, ubicacion, tamaño_empresa

### 3. PerfilPostulante
- Perfil de postulantes
- Campos: titulo_profesional, resumen, experiencia, habilidades, educacion

### 4. Categoria
- Categorías de ofertas de trabajo
- Ejemplos: Tecnología, Ventas, Educación, Salud

### 5. OfertaTrabajo
- Ofertas publicadas por empresas
- Campos: titulo, descripcion, requisitos, salario, modalidad, tipo_contrato

### 6. Postulacion
- Postulaciones de candidatos a ofertas
- Campos: oferta, postulante, estado, carta_presentacion

### 7. Favorito
- Ofertas guardadas como favoritas por usuarios

### 8. Notificacion
- Sistema de notificaciones para usuarios

---

## 🎨 TECNOLOGÍAS UTILIZADAS

- **Backend:** Django 5.2.7 (Python)
- **Base de Datos:** SQLite3
- **Frontend:** HTML5, CSS3
- **Autenticación:** AbstractUser (Django)
- **Panel Admin:** Django Admin

---

## 🔧 COMANDOS ÚTILES

### Ver estado del proyecto
```bash
python manage.py check
```

### Crear un nuevo superusuario
```bash
python manage.py createsuperuser
```

### Acceder a la shell de Django
```bash
python manage.py shell
```

### Ver migraciones aplicadas
```bash
python manage.py showmigrations
```

### Cargar datos de prueba (si se eliminaron)
```bash
python crear_datos_iniciales.py
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error: "No module named 'django'"
**Solución:** Instala Django
```bash
pip install django
```

### Error: "Port 8000 is already in use"
**Solución:** Usa otro puerto
```bash
python manage.py runserver 8080
```

### Error al iniciar sesión
**Solución:** Verifica que usas el **email** (no username) y contraseña correcta

### Base de datos vacía o corrupta
**Solución:** Recrea la base de datos
```bash
rm db.sqlite3
python manage.py migrate
python crear_datos_iniciales.py
```

### No se ven los estilos CSS
**Solución:** Verifica que el servidor esté corriendo en modo DEBUG
```bash
# En settings.py debe estar:
DEBUG = True
```

---

## 📝 DATOS INCLUIDOS EN LA BASE DE DATOS

Cuando ejecutas `crear_datos_iniciales.py` se crean:

- **3 usuarios:** admin, empleador, postulante
- **6 categorías:** Tecnología, Ventas, Educación, Salud, Construcción, Administración
- **1 empresa:** TechSolutions Perú
- **1 perfil de postulante:** Juan Pérez (Desarrollador Full Stack)
- **1 oferta de trabajo:** Desarrollador Full Stack

---

## 📚 CARACTERÍSTICAS TÉCNICAS

### Modelo Usuario Personalizado
El proyecto usa `AbstractUser` de Django para el modelo de usuario personalizado:
- Login con email en lugar de username
- Campos personalizados (tipo_usuario, telefono, estado)
- Manager personalizado (UsuarioManager)
- Configurado en settings.py: `AUTH_USER_MODEL = 'MyWebApps.Usuario'`

### Sistema de Autenticación
- Registro diferenciado por rol (Empleador/Postulante)
- Login con email
- Redirección automática según tipo de usuario
- Logout con limpieza de sesión

### Panel de Administración
- Configuración personalizada para cada modelo
- Filtros por campos relevantes
- Búsqueda en múltiples campos
- Campos de solo lectura para auditoría

---

## 🎓 REQUISITOS DEL PROFESOR (CUMPLIDOS)

✅ Usuario admin: `admin@empleoya.com` / `1234`
✅ Base de datos `db.sqlite3` incluida con datos
✅ Carpeta `MyWebApps` presente
✅ `.gitignore` configurado correctamente
✅ Migraciones aplicadas
✅ Modelo Usuario con AbstractUser implementado
✅ Sin REST API (solo Django tradicional)

---

## 📞 SOPORTE

Si encuentras problemas:

1. Verifica que Python 3.10+ esté instalado: `python --version`
2. Asegúrate de que Django esté instalado: `pip list | grep Django`
3. Revisa que el servidor esté corriendo: debe mostrar "Starting development server..."
4. Verifica la ruta en el navegador: `http://127.0.0.1:8000/`

---

## 📄 LICENCIA

Proyecto académico para el curso de Ingeniería Web
Universidad La Salle - 2025

---

**¡El proyecto está listo para usar! 🚀**

Para iniciar: `python manage.py runserver`
Luego abre: `http://127.0.0.1:8000/`
