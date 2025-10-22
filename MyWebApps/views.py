from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.utils import timezone
from .models import (
    Usuario, Categoria, Empresa, PerfilPostulante,
    OfertaTrabajo, Postulacion, Favorito, Notificacion
)

# Views del sistema EMPLEOYA
# Acá están todas las funciones para mostrar las páginas web

# ==================== VISTAS PÚBLICAS ====================

def home(request):
    """Página de inicio pública"""
    # Obtener ofertas destacadas (últimas 6 ofertas activas)
    ofertas_destacadas = OfertaTrabajo.objects.filter(
        estado='activa',
        aprobada_admin=True
    ).select_related('empresa', 'categoria').order_by('-fecha_publicacion')[:6]

    # Obtener categorías con conteo de ofertas
    categorias = Categoria.objects.filter(activa=True).annotate(
        num_ofertas=Count('ofertas', filter=Q(ofertas__estado='activa'))
    )[:8]

    # Estadísticas generales
    stats = {
        'total_ofertas': OfertaTrabajo.objects.filter(estado='activa').count(),
        'total_empresas': Empresa.objects.count(),
        'total_postulantes': PerfilPostulante.objects.count(),
        'total_categorias': Categoria.objects.filter(activa=True).count(),
    }

    context = {
        'ofertas_destacadas': ofertas_destacadas,
        'categorias': categorias,
        'stats': stats,
    }
    return render(request, 'MyWebApps/home.html', context)


def ofertas_lista(request):
    """Lista de ofertas con filtros y búsqueda"""
    ofertas = OfertaTrabajo.objects.filter(
        estado='activa',
        aprobada_admin=True
    ).select_related('empresa', 'categoria')

    # Filtros
    search = request.GET.get('search', '')
    categoria_id = request.GET.get('categoria', '')
    modalidad = request.GET.get('modalidad', '')
    ubicacion = request.GET.get('ubicacion', '')
    tipo_contrato = request.GET.get('tipo_contrato', '')

    if search:
        ofertas = ofertas.filter(
            Q(titulo__icontains=search) |
            Q(descripcion__icontains=search) |
            Q(empresa__nombre_empresa__icontains=search)
        )

    if categoria_id:
        ofertas = ofertas.filter(categoria_id=categoria_id)

    if modalidad:
        ofertas = ofertas.filter(modalidad=modalidad)

    if ubicacion:
        ofertas = ofertas.filter(ubicacion__icontains=ubicacion)

    if tipo_contrato:
        ofertas = ofertas.filter(tipo_contrato=tipo_contrato)

    # Ordenamiento
    orden = request.GET.get('orden', '-fecha_publicacion')
    ofertas = ofertas.order_by(orden)

    # Paginación
    paginator = Paginator(ofertas, 12)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    # Datos para filtros
    categorias = Categoria.objects.filter(activa=True)

    context = {
        'page_obj': page_obj,
        'categorias': categorias,
        'search': search,
        'categoria_id': categoria_id,
        'modalidad': modalidad,
        'ubicacion': ubicacion,
        'tipo_contrato': tipo_contrato,
        'orden': orden,
    }
    return render(request, 'MyWebApps/ofertas_lista.html', context)


def oferta_detalle(request, oferta_id):
    """Detalle de una oferta específica"""
    oferta = get_object_or_404(
        OfertaTrabajo.objects.select_related('empresa', 'categoria'),
        id=oferta_id,
        estado='activa'
    )

    # Incrementar vistas
    oferta.vistas += 1
    oferta.save(update_fields=['vistas'])

    # Verificar si el usuario ya postuló
    ya_postulo = False
    if request.user.is_authenticated and hasattr(request.user, 'perfil_postulante'):
        ya_postulo = Postulacion.objects.filter(
            oferta=oferta,
            postulante=request.user.perfil_postulante
        ).exists()

    # Ofertas similares
    ofertas_similares = OfertaTrabajo.objects.filter(
        categoria=oferta.categoria,
        estado='activa',
        aprobada_admin=True
    ).exclude(id=oferta.id).select_related('empresa')[:4]

    context = {
        'oferta': oferta,
        'ya_postulo': ya_postulo,
        'ofertas_similares': ofertas_similares,
    }
    return render(request, 'MyWebApps/oferta_detalle.html', context)


# ==================== AUTENTICACIÓN ====================

def login_view(request):
    """Vista de login"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f'¡Bienvenido {user.first_name}!')
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)
        else:
            messages.error(request, 'Email o contraseña incorrectos')

    return render(request, 'MyWebApps/login.html')


def register_view(request):
    """Vista de registro"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        first_name = request.POST.get('nombre')  # El formulario sigue usando 'nombre'
        last_name = request.POST.get('apellido')  # El formulario sigue usando 'apellido'
        telefono = request.POST.get('telefono', '')
        tipo_usuario = request.POST.get('tipo_usuario', 'postulante')

        # Validaciones
        if password != password2:
            messages.error(request, 'Las contraseñas no coinciden')
        elif Usuario.objects.filter(email=email).exists():
            messages.error(request, 'Este email ya está registrado')
        else:
            # Crear usuario
            user = Usuario.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                telefono=telefono,
                tipo_usuario=tipo_usuario
            )
            user.is_staff = True  # Para que puedan acceder al admin
            user.save()

            # Crear perfil según tipo
            if tipo_usuario == 'postulante':
                PerfilPostulante.objects.create(usuario=user)
            elif tipo_usuario == 'empleador':
                Empresa.objects.create(
                    usuario=user,
                    nombre_empresa=request.POST.get('nombre_empresa', f'Empresa de {first_name}')
                )

            messages.success(request, '¡Registro exitoso! Ahora puedes iniciar sesión')
            return redirect('login')

    return render(request, 'MyWebApps/register.html')


def logout_view(request):
    """Vista de logout"""
    logout(request)
    messages.success(request, 'Has cerrado sesión correctamente')
    return redirect('home')


# ==================== DASHBOARD ====================

@login_required
def dashboard(request):
    """Dashboard principal - redirige según tipo de usuario"""
    if request.user.tipo_usuario == 'empleador':
        return redirect('dashboard_empleador')
    elif request.user.tipo_usuario == 'postulante':
        return redirect('dashboard_postulante')
    else:
        return redirect('admin:index')


@login_required
def dashboard_empleador(request):
    """Dashboard para empleadores"""
    if request.user.tipo_usuario != 'empleador':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    empresa = get_object_or_404(Empresa, usuario=request.user)

    # Estadísticas
    ofertas = OfertaTrabajo.objects.filter(empresa=empresa)
    stats = {
        'total_ofertas': ofertas.count(),
        'ofertas_activas': ofertas.filter(estado='activa').count(),
        'total_postulaciones': Postulacion.objects.filter(oferta__empresa=empresa).count(),
        'postulaciones_pendientes': Postulacion.objects.filter(
            oferta__empresa=empresa,
            estado='pendiente'
        ).count(),
    }

    # Últimas ofertas
    ultimas_ofertas = ofertas.order_by('-fecha_creacion')[:5]

    # Últimas postulaciones
    ultimas_postulaciones = Postulacion.objects.filter(
        oferta__empresa=empresa
    ).select_related('postulante__usuario', 'oferta').order_by('-fecha_postulacion')[:10]

    context = {
        'empresa': empresa,
        'stats': stats,
        'ultimas_ofertas': ultimas_ofertas,
        'ultimas_postulaciones': ultimas_postulaciones,
    }
    return render(request, 'MyWebApps/dashboard_empleador.html', context)


@login_required
def dashboard_postulante(request):
    """Dashboard para postulantes"""
    if request.user.tipo_usuario != 'postulante':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    perfil = get_object_or_404(PerfilPostulante, usuario=request.user)

    # Estadísticas
    postulaciones = Postulacion.objects.filter(postulante=perfil)
    stats = {
        'total_postulaciones': postulaciones.count(),
        'en_proceso': postulaciones.filter(estado__in=['pendiente', 'en_revision', 'preseleccionado', 'entrevista']).count(),
        'aceptadas': postulaciones.filter(estado='aceptado').count(),
        'rechazadas': postulaciones.filter(estado='rechazado').count(),
    }

    # Últimas postulaciones
    ultimas_postulaciones = postulaciones.select_related('oferta__empresa').order_by('-fecha_postulacion')[:10]

    # Ofertas recomendadas (según categoría de interés o ubicación)
    ofertas_recomendadas = OfertaTrabajo.objects.filter(
        estado='activa',
        aprobada_admin=True
    ).exclude(
        postulaciones__postulante=perfil
    ).select_related('empresa', 'categoria')[:6]

    context = {
        'perfil': perfil,
        'stats': stats,
        'ultimas_postulaciones': ultimas_postulaciones,
        'ofertas_recomendadas': ofertas_recomendadas,
    }
    return render(request, 'MyWebApps/dashboard_postulante.html', context)


# ==================== GESTIÓN DE OFERTAS (EMPLEADOR) ====================

@login_required
def mis_ofertas(request):
    """Lista de ofertas del empleador"""
    if request.user.tipo_usuario != 'empleador':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    empresa = get_object_or_404(Empresa, usuario=request.user)
    ofertas = OfertaTrabajo.objects.filter(empresa=empresa).order_by('-fecha_creacion')

    context = {'ofertas': ofertas, 'empresa': empresa}
    return render(request, 'MyWebApps/mis_ofertas.html', context)


@login_required
def crear_oferta(request):
    """Crear nueva oferta"""
    if request.user.tipo_usuario != 'empleador':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    empresa = get_object_or_404(Empresa, usuario=request.user)

    if request.method == 'POST':
        oferta = OfertaTrabajo.objects.create(
            empresa=empresa,
            categoria_id=request.POST.get('categoria'),
            titulo=request.POST.get('titulo'),
            descripcion=request.POST.get('descripcion'),
            requisitos=request.POST.get('requisitos', ''),
            responsabilidades=request.POST.get('responsabilidades', ''),
            beneficios=request.POST.get('beneficios', ''),
            salario_min=request.POST.get('salario_min') or None,
            salario_max=request.POST.get('salario_max') or None,
            moneda=request.POST.get('moneda', 'PEN'),
            ubicacion=request.POST.get('ubicacion', ''),
            modalidad=request.POST.get('modalidad'),
            tipo_contrato=request.POST.get('tipo_contrato'),
            nivel_experiencia=request.POST.get('nivel_experiencia'),
            vacantes_disponibles=request.POST.get('vacantes_disponibles', 1),
            estado='activa',
            fecha_publicacion=timezone.now()
        )

        messages.success(request, 'Oferta creada exitosamente')
        return redirect('mis_ofertas')

    categorias = Categoria.objects.filter(activa=True)
    context = {'categorias': categorias, 'empresa': empresa}
    return render(request, 'MyWebApps/crear_oferta.html', context)


@login_required
def postulaciones_oferta(request, oferta_id):
    """Ver postulaciones de una oferta específica"""
    if request.user.tipo_usuario != 'empleador':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    empresa = get_object_or_404(Empresa, usuario=request.user)
    oferta = get_object_or_404(OfertaTrabajo, id=oferta_id, empresa=empresa)

    # Cambiar estado de postulación
    if request.method == 'POST':
        postulacion_id = request.POST.get('postulacion_id')
        nuevo_estado = request.POST.get('nuevo_estado')
        postulacion = get_object_or_404(Postulacion, id=postulacion_id, oferta=oferta)
        postulacion.estado = nuevo_estado
        if nuevo_estado != 'pendiente':
            postulacion.fecha_revision = timezone.now()
        postulacion.save()
        messages.success(request, f'Estado actualizado a: {postulacion.get_estado_display()}')
        return redirect('postulaciones_oferta', oferta_id=oferta_id)

    postulaciones = Postulacion.objects.filter(
        oferta=oferta
    ).select_related('postulante__usuario').order_by('-fecha_postulacion')

    context = {
        'oferta': oferta,
        'postulaciones': postulaciones,
    }
    return render(request, 'MyWebApps/postulaciones_oferta.html', context)


# ==================== POSTULACIONES (POSTULANTE) ====================

@login_required
def postular_oferta(request, oferta_id):
    """Postular a una oferta"""
    if request.user.tipo_usuario != 'postulante':
        messages.error(request, 'Solo los postulantes pueden postular a ofertas')
        return redirect('oferta_detalle', oferta_id=oferta_id)

    perfil = get_object_or_404(PerfilPostulante, usuario=request.user)
    oferta = get_object_or_404(OfertaTrabajo, id=oferta_id, estado='activa')

    # Verificar si ya postuló
    if Postulacion.objects.filter(oferta=oferta, postulante=perfil).exists():
        messages.warning(request, 'Ya has postulado a esta oferta')
        return redirect('oferta_detalle', oferta_id=oferta_id)

    if request.method == 'POST':
        Postulacion.objects.create(
            oferta=oferta,
            postulante=perfil,
            carta_presentacion=request.POST.get('carta_presentacion', ''),
            cv_url_postulacion=perfil.cv_url
        )

        messages.success(request, '¡Postulación enviada exitosamente!')
        return redirect('mis_postulaciones')

    context = {'oferta': oferta, 'perfil': perfil}
    return render(request, 'MyWebApps/postular_oferta.html', context)


@login_required
def mis_postulaciones(request):
    """Ver mis postulaciones"""
    if request.user.tipo_usuario != 'postulante':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    perfil = get_object_or_404(PerfilPostulante, usuario=request.user)
    postulaciones = Postulacion.objects.filter(
        postulante=perfil
    ).select_related('oferta__empresa', 'oferta__categoria').order_by('-fecha_postulacion')

    context = {'postulaciones': postulaciones}
    return render(request, 'MyWebApps/mis_postulaciones.html', context)


# ==================== PERFILES ====================

@login_required
def mi_perfil(request):
    """Ver/editar perfil de usuario"""
    if request.user.tipo_usuario == 'empleador':
        return redirect('perfil_empresa')
    elif request.user.tipo_usuario == 'postulante':
        return redirect('perfil_postulante')
    else:
        return redirect('admin:index')


@login_required
def perfil_empresa(request):
    """Ver/editar perfil de empresa"""
    if request.user.tipo_usuario != 'empleador':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    empresa = get_object_or_404(Empresa, usuario=request.user)

    if request.method == 'POST':
        empresa.nombre_empresa = request.POST.get('nombre_empresa')
        empresa.ruc = request.POST.get('ruc', '')
        empresa.descripcion = request.POST.get('descripcion', '')
        empresa.sector = request.POST.get('sector', '')
        empresa.ubicacion = request.POST.get('ubicacion', '')
        empresa.sitio_web = request.POST.get('sitio_web', '')
        empresa.tamaño_empresa = request.POST.get('tamaño_empresa', 'pyme')
        empresa.telefono_empresa = request.POST.get('telefono_empresa', '')
        empresa.save()

        messages.success(request, 'Perfil actualizado correctamente')
        return redirect('perfil_empresa')

    context = {'empresa': empresa}
    return render(request, 'MyWebApps/perfil_empresa.html', context)


@login_required
def perfil_postulante_view(request):
    """Ver/editar perfil de postulante"""
    if request.user.tipo_usuario != 'postulante':
        messages.error(request, 'No tienes permiso para acceder a esta página')
        return redirect('dashboard')

    perfil = get_object_or_404(PerfilPostulante, usuario=request.user)

    if request.method == 'POST':
        perfil.titulo_profesional = request.POST.get('titulo_profesional', '')
        perfil.resumen_profesional = request.POST.get('resumen_profesional', '')
        perfil.nivel_experiencia = request.POST.get('nivel_experiencia', 'sin_experiencia')
        perfil.años_experiencia = request.POST.get('años_experiencia', 0)
        perfil.habilidades = request.POST.get('habilidades', '')
        perfil.ubicacion = request.POST.get('ubicacion', '')
        perfil.salario_esperado = request.POST.get('salario_esperado') or None
        perfil.disponibilidad = request.POST.get('disponibilidad', 'negociable')
        perfil.save()

        messages.success(request, 'Perfil actualizado correctamente')
        return redirect('perfil_postulante')

    context = {'perfil': perfil}
    return render(request, 'MyWebApps/perfil_postulante.html', context)
