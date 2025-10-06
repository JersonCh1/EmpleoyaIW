# Cómo subir el proyecto a GitHub

## Paso 1: Ver que el repo esté bien configurado
```bash
cd "C:\Users\Jerson\Desktop\mis-proyectos\empleoya"
git remote -v
```
**Listo** - Ya apunta a: https://github.com/JersonCh1/EmpleoyaIW.git

---

## Paso 2: Ver qué archivos cambiaron
```bash
git status
```
Acá verás todos los archivos nuevos y modificados

---

## Paso 3: Agregar todo al staging
```bash
git add .
```
Esto agrega todos los cambios para el commit

---

## Paso 4: Ver qué se va a subir (opcional)
```bash
git status
```

---

## Paso 5: Hacer el commit
```bash
git commit -m "Proyecto EMPLEOYA completo

Terminamos el proyecto de la bolsa de trabajo con Django.
Tiene todo lo que pidieron: login, registro, ofertas, postulaciones,
dashboards y API REST. Ya funciona todo.

admin@empleoya.com / 1234 para probar"
```

---

## Paso 6: Subir todo a GitHub
```bash
git push origin main
```

Si pide usuario y contraseña, usa tu GitHub username y un Personal Access Token

---

## Resumen rápido:

```bash
cd "C:\Users\Jerson\Desktop\mis-proyectos\empleoya"
git add .
git commit -m "Proyecto completo"
git push origin main
```

---

## Si te da error al hacer push:

Probablemente hay cambios en GitHub que no tienes local. Hace esto:

```bash
git pull origin main --rebase
git push origin main
```

---

## Cómo conseguir el token de GitHub:

GitHub ya no acepta contraseñas normales, necesitas un token:

1. Entra a: https://github.com/settings/tokens
2. Dale a "Generate new token (classic)"
3. Marca la casilla de `repo`
4. Genera el token y cópialo
5. Úsalo como contraseña cuando git te lo pida

---

## Verificar que se subió bien:

Entra a https://github.com/JersonCh1/EmpleoyaIW y revisa que esté:
- La carpeta MyWebApps/
- El archivo db.sqlite3
- El README actualizado
