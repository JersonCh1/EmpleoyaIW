#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para verificar y arreglar usuarios"""

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

print('='*60)
print('VERIFICANDO TODOS LOS USUARIOS')
print('='*60)

usuarios = Usuario.objects.all()

for usuario in usuarios:
    print(f'\nEmail: {usuario.email}')
    print(f'  - Nombre: {usuario.nombre} {usuario.apellido}')
    print(f'  - is_active: {usuario.is_active}')
    print(f'  - is_staff: {usuario.is_staff}')
    print(f'  - is_superuser: {usuario.is_superuser}')
    print(f'  - tipo_usuario: {usuario.tipo_usuario}')
    print(f'  - estado: {usuario.estado}')
    print(f'  - Password hash: {usuario.password[:20]}...')

print('\n' + '='*60)
print('ARREGLANDO USUARIOS...')
print('='*60)

count = 0
for usuario in usuarios:
    updated = False

    # Asegurar que esté activo
    if not usuario.is_active:
        usuario.is_active = True
        updated = True

    # Dar permisos de staff
    if not usuario.is_staff:
        usuario.is_staff = True
        updated = True

    # Asegurar que el estado sea 'activo'
    if usuario.estado != 'activo':
        usuario.estado = 'activo'
        updated = True

    if updated:
        usuario.save()
        print(f'[ACTUALIZADO] {usuario.email}')
        count += 1
    else:
        print(f'[OK] {usuario.email} ya estaba correcto')

print(f'\n{count} usuarios actualizados')

print('\n' + '='*60)
print('PROBANDO AUTENTICACION')
print('='*60)

from django.contrib.auth import authenticate

# Probar cada usuario
test_users = [
    'admin@empleoya.com',
    'empresa1@empleoya.com',
    'juan.perez@gmail.com'
]

for email in test_users:
    user = authenticate(email=email, password='1234')
    if user:
        print(f'[OK] {email} - Autenticacion exitosa')
        print(f'     is_active={user.is_active}, is_staff={user.is_staff}')
    else:
        print(f'[ERROR] {email} - NO se pudo autenticar')
        # Intentar obtener el usuario
        try:
            u = Usuario.objects.get(email=email)
            print(f'     Usuario existe pero password no coincide')
            print(f'     Reiniciando password...')
            u.set_password('1234')
            u.save()
            print(f'     [OK] Password reiniciado')
        except Usuario.DoesNotExist:
            print(f'     Usuario no existe en la base de datos')

print('\n' + '='*60)
print('VERIFICACION FINAL')
print('='*60)
print('\nIntenta acceder al admin con:')
print('URL: http://127.0.0.1:8000/admin')
print('\nCualquiera de estos usuarios:')
for u in usuarios:
    print(f'  - {u.email} / 1234')
