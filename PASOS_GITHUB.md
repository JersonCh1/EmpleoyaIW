# 📤 PASOS PARA SUBIR A GITHUB

## ✅ Paso 1: Verificar repositorio remoto
```bash
cd "C:\Users\Jerson\Desktop\mis-proyectos\empleoya"
git remote -v
```
**✅ COMPLETADO** - Apunta a: https://github.com/JersonCh1/EmpleoyaIW.git

---

## ✅ Paso 2: Verificar estado del proyecto
```bash
git status
```
**Estado actual:**
- ✅ Archivos nuevos listos para agregar (MyWebApps/, db.sqlite3, etc.)
- ✅ Archivos antiguos eliminados (backend/, database/, etc.)

---

## 🔄 Paso 3: Agregar todos los archivos
```bash
git add .
```
**Esto agregará:**
- Archivos nuevos del proyecto Django
- Cambios en .gitignore
- Eliminaciones de carpetas antiguas
- README.md actualizado

---

## 🔄 Paso 4: Verificar lo que se va a subir
```bash
git status
```

---

## 🔄 Paso 5: Crear commit
```bash
git commit -m "feat: Migración completa a Django - Sistema EMPLEOYA

- Transformación de Node.js/Express/MongoDB a Django/SQLite
- Implementación completa de API REST con Django REST Framework
- 15 templates HTML con diseño moderno y responsive
- Sistema de autenticación por Token
- Gestión de ofertas y postulaciones
- Dashboards para empleadores y postulantes
- Base de datos SQLite con datos de prueba cargados
- Usuario admin: admin@empleoya.com / 1234
- Documentación completa de API y uso

Desarrollado por: Piero De La Cruz & Jerson Chura
Universidad Nacional de San Agustín - Ingeniería Web"
```

---

## 🔄 Paso 6: Subir a GitHub
```bash
git push origin main
```

**Si pide credenciales:**
- Usuario: Tu usuario de GitHub
- Token: Personal Access Token de GitHub (no contraseña)

---

## 🎯 PASOS RESUMIDOS:

```bash
# 1. Ir al directorio
cd "C:\Users\Jerson\Desktop\mis-proyectos\empleoya"

# 2. Agregar archivos
git add .

# 3. Hacer commit
git commit -m "feat: Migración completa a Django - Sistema EMPLEOYA completo"

# 4. Subir a GitHub
git push origin main
```

---

## ⚠️ Si hay conflictos:

Si GitHub rechaza el push porque hay cambios en el repositorio remoto:

```bash
# Traer cambios del remoto
git pull origin main --rebase

# Resolver conflictos si hay (poco probable)
# Luego continuar:
git push origin main
```

---

## 🔐 Si pide autenticación:

GitHub ya NO acepta contraseñas, necesitas un **Personal Access Token**:

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Selecciona scope: `repo` (acceso completo a repositorios)
4. Genera y copia el token
5. Úsalo como contraseña cuando Git lo pida

---

## ✅ Verificar subida exitosa:

Después del push, verifica en:
https://github.com/JersonCh1/EmpleoyaIW

Deberías ver:
- ✅ Carpeta MyWebApps/
- ✅ Carpeta empleoya_django/
- ✅ archivo db.sqlite3
- ✅ README.md actualizado
- ✅ Sin carpetas backend/, database/, docs/

---

**Estado:** Listo para ejecutar
**Fecha:** 06 de Octubre, 2025
