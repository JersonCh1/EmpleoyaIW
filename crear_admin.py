#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para crear el usuario admin con contraseña 1234"""

import os
import sys
import django

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'empleoya_django.settings')
django.setup()

from MyWebApps.models import Usuario

# Crear usuario admin
try:
    if Usuario.objects.filter(email='admin@empleoya.com').exists():
        print('El usuario admin ya existe. Actualizando contrasena...')
        admin = Usuario.objects.get(email='admin@empleoya.com')
        admin.set_password('1234')
        admin.save()
        print('[OK] Contrasena del admin actualizada a: 1234')
    else:
        admin = Usuario.objects.create_superuser(
            email='admin@empleoya.com',
            password='1234',
            nombre='Admin',
            apellido='EMPLEOYA'
        )
        print('[OK] Usuario admin creado exitosamente')
        print('  Email: admin@empleoya.com')
        print('  Contrasena: 1234')
except Exception as e:
    print(f'[ERROR] Error al crear el usuario admin: {e}')
