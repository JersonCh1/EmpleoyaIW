#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para cargar datos de prueba en la base de datos"""

import os
import sys
import django
from datetime import datetime, timedelta

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'empleoya_django.settings')
django.setup()

from MyWebApps.models import (
    Usuario, Categoria, Empresa, PerfilPostulante,
    OfertaTrabajo, Postulacion
)

print('Iniciando carga de datos de prueba...\n')

# 1. Crear categorías
print('1. Creando categorías...')
categorias_data = [
    {'nombre': 'Tecnología', 'descripcion': 'Trabajos en el sector tecnológico', 'icono': 'laptop'},
    {'nombre': 'Marketing', 'descripcion': 'Trabajos en marketing y publicidad', 'icono': 'megaphone'},
    {'nombre': 'Ventas', 'descripcion': 'Trabajos en ventas y comercio', 'icono': 'shopping-cart'},
    {'nombre': 'Recursos Humanos', 'descripcion': 'Trabajos en gestión de personal', 'icono': 'users'},
    {'nombre': 'Finanzas', 'descripcion': 'Trabajos en contabilidad y finanzas', 'icono': 'dollar-sign'},
    {'nombre': 'Diseño', 'descripcion': 'Trabajos en diseño gráfico y UX/UI', 'icono': 'palette'},
    {'nombre': 'Administración', 'descripcion': 'Trabajos administrativos', 'icono': 'briefcase'},
    {'nombre': 'Educación', 'descripcion': 'Trabajos en enseñanza y capacitación', 'icono': 'book'},
]

categorias = {}
for cat_data in categorias_data:
    cat, created = Categoria.objects.get_or_create(
        nombre=cat_data['nombre'],
        defaults=cat_data
    )
    categorias[cat.nombre] = cat
    if created:
        print(f'  - Categoria creada: {cat.nombre}')

# 2. Crear usuarios empleadores
print('\n2. Creando usuarios empleadores...')
empleadores_data = [
    {
        'email': 'empresa1@empleoya.com',
        'nombre': 'Carlos',
        'apellido': 'Ramirez',
        'password': '1234',
        'tipo_usuario': 'empleador',
        'empresa': {
            'nombre_empresa': 'TechSolutions Peru',
            'ruc': '20123456789',
            'descripcion': 'Empresa líder en soluciones tecnológicas',
            'sector': 'Tecnología',
            'ubicacion': 'Lima, Peru',
            'tamaño_empresa': 'mediana',
        }
    },
    {
        'email': 'empresa2@empleoya.com',
        'nombre': 'Maria',
        'apellido': 'Lopez',
        'password': '1234',
        'tipo_usuario': 'empleador',
        'empresa': {
            'nombre_empresa': 'Marketing Digital SAC',
            'ruc': '20987654321',
            'descripcion': 'Agencia de marketing digital',
            'sector': 'Marketing',
            'ubicacion': 'Arequipa, Peru',
            'tamaño_empresa': 'pyme',
        }
    },
    {
        'email': 'empresa3@empleoya.com',
        'nombre': 'Jorge',
        'apellido': 'Torres',
        'password': '1234',
        'tipo_usuario': 'empleador',
        'empresa': {
            'nombre_empresa': 'FinanzasPro',
            'ruc': '20555666777',
            'descripcion': 'Consultora financiera',
            'sector': 'Finanzas',
            'ubicacion': 'Cusco, Peru',
            'tamaño_empresa': 'pyme',
        }
    },
]

empresas = []
for emp_data in empleadores_data:
    user, created = Usuario.objects.get_or_create(
        email=emp_data['email'],
        defaults={
            'nombre': emp_data['nombre'],
            'apellido': emp_data['apellido'],
            'tipo_usuario': emp_data['tipo_usuario'],
        }
    )
    if created:
        user.set_password(emp_data['password'])
        user.save()
        print(f'  - Usuario empleador creado: {user.email}')

    # Crear empresa
    empresa, created = Empresa.objects.get_or_create(
        usuario=user,
        defaults=emp_data['empresa']
    )
    if created:
        print(f'    Empresa creada: {empresa.nombre_empresa}')
    empresas.append(empresa)

# 3. Crear usuarios postulantes
print('\n3. Creando usuarios postulantes...')
postulantes_data = [
    {
        'email': 'juan.perez@gmail.com',
        'nombre': 'Juan',
        'apellido': 'Perez',
        'password': '1234',
        'tipo_usuario': 'postulante',
        'perfil': {
            'titulo_profesional': 'Desarrollador Full Stack',
            'resumen_profesional': 'Desarrollador con 3 años de experiencia en React y Node.js',
            'nivel_experiencia': 'semi_senior',
            'años_experiencia': 3,
            'habilidades': 'JavaScript, React, Node.js, MongoDB, Python, Django',
            'ubicacion': 'Lima, Peru',
            'salario_esperado': 3500.00,
            'disponibilidad': 'inmediata',
        }
    },
    {
        'email': 'ana.garcia@gmail.com',
        'nombre': 'Ana',
        'apellido': 'Garcia',
        'password': '1234',
        'tipo_usuario': 'postulante',
        'perfil': {
            'titulo_profesional': 'Diseñadora UX/UI',
            'resumen_profesional': 'Diseñadora creativa con pasión por la experiencia de usuario',
            'nivel_experiencia': 'junior',
            'años_experiencia': 2,
            'habilidades': 'Figma, Adobe XD, Sketch, Photoshop, Illustrator',
            'ubicacion': 'Lima, Peru',
            'salario_esperado': 2500.00,
            'disponibilidad': '2_semanas',
        }
    },
    {
        'email': 'pedro.martinez@gmail.com',
        'nombre': 'Pedro',
        'apellido': 'Martinez',
        'password': '1234',
        'tipo_usuario': 'postulante',
        'perfil': {
            'titulo_profesional': 'Analista de Marketing Digital',
            'resumen_profesional': 'Especialista en marketing digital y redes sociales',
            'nivel_experiencia': 'semi_senior',
            'años_experiencia': 4,
            'habilidades': 'Google Ads, Facebook Ads, SEO, SEM, Google Analytics',
            'ubicacion': 'Arequipa, Peru',
            'salario_esperado': 3000.00,
            'disponibilidad': '1_mes',
        }
    },
    {
        'email': 'lucia.silva@gmail.com',
        'nombre': 'Lucia',
        'apellido': 'Silva',
        'password': '1234',
        'tipo_usuario': 'postulante',
        'perfil': {
            'titulo_profesional': 'Contador Publico',
            'resumen_profesional': 'Contadora certificada con experiencia en auditoría',
            'nivel_experiencia': 'senior',
            'años_experiencia': 7,
            'habilidades': 'Contabilidad, Auditoría, SAP, Excel Avanzado, NIIF',
            'ubicacion': 'Lima, Peru',
            'salario_esperado': 4500.00,
            'disponibilidad': 'negociable',
        }
    },
]

perfiles_postulantes = []
for post_data in postulantes_data:
    user, created = Usuario.objects.get_or_create(
        email=post_data['email'],
        defaults={
            'nombre': post_data['nombre'],
            'apellido': post_data['apellido'],
            'tipo_usuario': post_data['tipo_usuario'],
        }
    )
    if created:
        user.set_password(post_data['password'])
        user.save()
        print(f'  - Usuario postulante creado: {user.email}')

    # Crear perfil
    perfil, created = PerfilPostulante.objects.get_or_create(
        usuario=user,
        defaults=post_data['perfil']
    )
    if created:
        print(f'    Perfil creado: {perfil.titulo_profesional}')
    perfiles_postulantes.append(perfil)

# 4. Crear ofertas de trabajo
print('\n4. Creando ofertas de trabajo...')
ofertas_data = [
    {
        'empresa': empresas[0],
        'categoria': categorias['Tecnología'],
        'titulo': 'Desarrollador Full Stack Senior',
        'descripcion': 'Buscamos desarrollador Full Stack con experiencia en React y Node.js',
        'requisitos': '- 3+ años de experiencia\n- Conocimiento en React y Node.js\n- Experiencia con bases de datos\n- Inglés intermedio',
        'responsabilidades': '- Desarrollar aplicaciones web\n- Mantener código existente\n- Trabajar en equipo',
        'beneficios': '- Trabajo remoto\n- Seguro médico\n- Bonos por desempeño',
        'salario_min': 3000.00,
        'salario_max': 5000.00,
        'ubicacion': 'Lima, Peru',
        'modalidad': 'remoto',
        'tipo_contrato': 'tiempo_completo',
        'nivel_experiencia': 'senior',
        'vacantes_disponibles': 2,
        'estado': 'activa',
        'aprobada_admin': True,
        'fecha_publicacion': datetime.now(),
        'fecha_expiracion': datetime.now() + timedelta(days=30),
    },
    {
        'empresa': empresas[1],
        'categoria': categorias['Marketing'],
        'titulo': 'Especialista en Marketing Digital',
        'descripcion': 'Se requiere especialista en marketing digital para gestionar campañas',
        'requisitos': '- 2+ años de experiencia\n- Conocimiento en Google Ads y Facebook Ads\n- Experiencia en SEO/SEM',
        'responsabilidades': '- Gestionar campañas publicitarias\n- Analizar métricas\n- Crear estrategias de marketing',
        'beneficios': '- Horario flexible\n- Bonos por resultados\n- Capacitaciones',
        'salario_min': 2500.00,
        'salario_max': 4000.00,
        'ubicacion': 'Arequipa, Peru',
        'modalidad': 'hibrido',
        'tipo_contrato': 'tiempo_completo',
        'nivel_experiencia': 'semi_senior',
        'vacantes_disponibles': 1,
        'estado': 'activa',
        'aprobada_admin': True,
        'fecha_publicacion': datetime.now(),
        'fecha_expiracion': datetime.now() + timedelta(days=45),
    },
    {
        'empresa': empresas[0],
        'categoria': categorias['Diseño'],
        'titulo': 'Diseñador UX/UI Junior',
        'descripcion': 'Buscamos diseñador UX/UI para unirse a nuestro equipo creativo',
        'requisitos': '- 1+ año de experiencia\n- Dominio de Figma y Adobe XD\n- Portafolio requerido',
        'responsabilidades': '- Diseñar interfaces de usuario\n- Crear prototipos\n- Colaborar con desarrolladores',
        'beneficios': '- Trabajo remoto\n- Ambiente creativo\n- Capacitaciones',
        'salario_min': 2000.00,
        'salario_max': 3000.00,
        'ubicacion': 'Lima, Peru',
        'modalidad': 'remoto',
        'tipo_contrato': 'tiempo_completo',
        'nivel_experiencia': 'junior',
        'vacantes_disponibles': 1,
        'estado': 'activa',
        'aprobada_admin': True,
        'fecha_publicacion': datetime.now(),
        'fecha_expiracion': datetime.now() + timedelta(days=60),
    },
    {
        'empresa': empresas[2],
        'categoria': categorias['Finanzas'],
        'titulo': 'Contador Senior',
        'descripcion': 'Consultora financiera busca contador con experiencia',
        'requisitos': '- 5+ años de experiencia\n- Certificación CPC\n- Conocimiento de NIIF\n- Experiencia en auditoría',
        'responsabilidades': '- Llevar contabilidad de clientes\n- Realizar auditorías\n- Asesorar en temas tributarios',
        'beneficios': '- Salario competitivo\n- Bonos\n- Crecimiento profesional',
        'salario_min': 4000.00,
        'salario_max': 6000.00,
        'ubicacion': 'Cusco, Peru',
        'modalidad': 'presencial',
        'tipo_contrato': 'tiempo_completo',
        'nivel_experiencia': 'senior',
        'vacantes_disponibles': 1,
        'estado': 'activa',
        'aprobada_admin': True,
        'fecha_publicacion': datetime.now(),
        'fecha_expiracion': datetime.now() + timedelta(days=30),
    },
    {
        'empresa': empresas[1],
        'categoria': categorias['Ventas'],
        'titulo': 'Ejecutivo de Ventas',
        'descripcion': 'Buscamos ejecutivo de ventas proactivo para nuestro equipo comercial',
        'requisitos': '- 1+ año de experiencia en ventas\n- Excelentes habilidades de comunicación\n- Orientado a resultados',
        'responsabilidades': '- Captar nuevos clientes\n- Cumplir metas de ventas\n- Mantener relaciones con clientes',
        'beneficios': '- Comisiones atractivas\n- Bonos por metas\n- Capacitación constante',
        'salario_min': 1500.00,
        'salario_max': 3000.00,
        'ubicacion': 'Arequipa, Peru',
        'modalidad': 'presencial',
        'tipo_contrato': 'tiempo_completo',
        'nivel_experiencia': 'junior',
        'vacantes_disponibles': 3,
        'estado': 'activa',
        'aprobada_admin': True,
        'fecha_publicacion': datetime.now(),
        'fecha_expiracion': datetime.now() + timedelta(days=30),
    },
]

ofertas = []
for oferta_data in ofertas_data:
    oferta = OfertaTrabajo.objects.create(**oferta_data)
    ofertas.append(oferta)
    print(f'  - Oferta creada: {oferta.titulo} ({oferta.empresa.nombre_empresa})')

# 5. Crear algunas postulaciones
print('\n5. Creando postulaciones de ejemplo...')
postulaciones_data = [
    {'oferta': ofertas[0], 'postulante': perfiles_postulantes[0], 'estado': 'en_revision', 'puntuacion_match': 85},
    {'oferta': ofertas[1], 'postulante': perfiles_postulantes[2], 'estado': 'preseleccionado', 'puntuacion_match': 90},
    {'oferta': ofertas[2], 'postulante': perfiles_postulantes[1], 'estado': 'entrevista', 'puntuacion_match': 88},
    {'oferta': ofertas[3], 'postulante': perfiles_postulantes[3], 'estado': 'pendiente', 'puntuacion_match': 92},
    {'oferta': ofertas[0], 'postulante': perfiles_postulantes[1], 'estado': 'pendiente', 'puntuacion_match': 75},
    {'oferta': ofertas[4], 'postulante': perfiles_postulantes[2], 'estado': 'en_revision', 'puntuacion_match': 80},
]

for post_data in postulaciones_data:
    postulacion, created = Postulacion.objects.get_or_create(
        oferta=post_data['oferta'],
        postulante=post_data['postulante'],
        defaults={
            'estado': post_data['estado'],
            'puntuacion_match': post_data['puntuacion_match'],
            'carta_presentacion': f'Estoy muy interesado en la posición de {post_data["oferta"].titulo}',
        }
    )
    if created:
        print(f'  - Postulacion creada: {post_data["postulante"].usuario.nombre_completo} -> {post_data["oferta"].titulo}')

print('\n[OK] Datos de prueba cargados exitosamente!')
print('\n=== Resumen ===')
print(f'Categorias: {Categoria.objects.count()}')
print(f'Usuarios: {Usuario.objects.count()}')
print(f'Empresas: {Empresa.objects.count()}')
print(f'Perfiles de Postulantes: {PerfilPostulante.objects.count()}')
print(f'Ofertas de Trabajo: {OfertaTrabajo.objects.count()}')
print(f'Postulaciones: {Postulacion.objects.count()}')
print('\n[LISTO] La base de datos db.sqlite3 contiene todos los datos necesarios!')
