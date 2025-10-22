"""
Script para crear datos iniciales del proyecto EMPLEOYA
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'empleoya_django.settings')
django.setup()

from MyWebApps.models import Usuario, Categoria, Empresa, PerfilPostulante, OfertaTrabajo
from django.utils import timezone
from datetime import timedelta

def crear_datos_iniciales():
    print("Creando datos iniciales...")

    # 1. Crear usuario admin
    if not Usuario.objects.filter(email='admin@empleoya.com').exists():
        admin = Usuario.objects.create_superuser(
            email='admin@empleoya.com',
            password='1234',
            first_name='Admin',
            last_name='EMPLEOYA'
        )
        print("[OK] Usuario admin creado")

    # 2. Crear categorías
    categorias = [
        {'nombre': 'Tecnología', 'descripcion': 'Trabajos en el sector tecnológico', 'icono': 'laptop'},
        {'nombre': 'Ventas', 'descripcion': 'Oportunidades en ventas y comercio', 'icono': 'chart-line'},
        {'nombre': 'Educación', 'descripcion': 'Empleos en el sector educativo', 'icono': 'graduation-cap'},
        {'nombre': 'Salud', 'descripcion': 'Trabajos en el sector salud', 'icono': 'heartbeat'},
        {'nombre': 'Construcción', 'descripcion': 'Empleos en construcción', 'icono': 'hard-hat'},
        {'nombre': 'Administración', 'descripcion': 'Puestos administrativos', 'icono': 'briefcase'},
    ]

    for cat_data in categorias:
        Categoria.objects.get_or_create(**cat_data)
    print("[OK] Categorias creadas")

    # 3. Crear empleador de prueba
    if not Usuario.objects.filter(email='empresa1@empleoya.com').exists():
        empleador = Usuario.objects.create_user(
            email='empresa1@empleoya.com',
            password='1234',
            first_name='TechSolutions',
            last_name='Perú',
            tipo_usuario='empleador'
        )
        empleador.is_staff = True
        empleador.save()

        Empresa.objects.create(
            usuario=empleador,
            nombre_empresa='TechSolutions Perú',
            ruc='20123456789',
            descripcion='Empresa líder en soluciones tecnológicas',
            sector='Tecnología',
            ubicacion='Lima, Perú',
            tamaño_empresa='mediana'
        )
        print("[OK] Empleador de prueba creado")

    # 4. Crear postulante de prueba
    if not Usuario.objects.filter(email='juan.perez@gmail.com').exists():
        postulante = Usuario.objects.create_user(
            email='juan.perez@gmail.com',
            password='1234',
            first_name='Juan',
            last_name='Pérez',
            tipo_usuario='postulante'
        )
        postulante.is_staff = True
        postulante.save()

        PerfilPostulante.objects.create(
            usuario=postulante,
            titulo_profesional='Desarrollador Full Stack',
            resumen_profesional='Desarrollador con experiencia en Django y React',
            nivel_experiencia='semi_senior',
            años_experiencia=4,
            habilidades='Python, Django, JavaScript, React',
            ubicacion='Lima, Perú'
        )
        print("[OK] Postulante de prueba creado")

    # 5. Crear una oferta de trabajo de ejemplo
    empresa = Empresa.objects.first()
    categoria_tech = Categoria.objects.get(nombre='Tecnología')

    if empresa and not OfertaTrabajo.objects.filter(titulo='Desarrollador Full Stack').exists():
        OfertaTrabajo.objects.create(
            empresa=empresa,
            categoria=categoria_tech,
            titulo='Desarrollador Full Stack',
            descripcion='Buscamos desarrollador Full Stack con experiencia en Django y React',
            requisitos='- 3+ años de experiencia\n- Python, Django\n- JavaScript, React',
            responsabilidades='- Desarrollar aplicaciones web\n- Colaborar con el equipo',
            beneficios='- Trabajo remoto\n- Seguro médico\n- Capacitaciones',
            salario_min=3000,
            salario_max=5000,
            ubicacion='Lima, Perú',
            modalidad='remoto',
            tipo_contrato='tiempo_completo',
            nivel_experiencia='semi_senior',
            vacantes_disponibles=2,
            fecha_publicacion=timezone.now(),
            fecha_expiracion=timezone.now() + timedelta(days=30),
            estado='activa',
            aprobada_admin=True
        )
        print("[OK] Oferta de trabajo de ejemplo creada")

    print("\nDatos iniciales creados exitosamente!\n")
    print("Usuarios de prueba:")
    print("- Admin: admin@empleoya.com / 1234")
    print("- Empleador: empresa1@empleoya.com / 1234")
    print("- Postulante: juan.perez@gmail.com / 1234")

if __name__ == '__main__':
    crear_datos_iniciales()
