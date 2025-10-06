from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Usuario, Categoria, Empresa, PerfilPostulante,
    OfertaTrabajo, Postulacion, Favorito, Notificacion
)


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """Admin para el modelo Usuario"""

    list_display = ['email', 'nombre', 'apellido', 'tipo_usuario', 'estado', 'email_verificado', 'fecha_creacion']
    list_filter = ['tipo_usuario', 'estado', 'email_verificado', 'is_staff', 'is_superuser']
    search_fields = ['email', 'nombre', 'apellido']
    ordering = ['-fecha_creacion']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('nombre', 'apellido', 'telefono')}),
        ('Permisos', {'fields': ('tipo_usuario', 'estado', 'email_verificado', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'fecha_creacion', 'fecha_actualizacion')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellido', 'tipo_usuario', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['fecha_creacion', 'fecha_actualizacion', 'last_login']


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    """Admin para el modelo Categoria"""

    list_display = ['nombre', 'icono', 'activa', 'fecha_creacion']
    list_filter = ['activa']
    search_fields = ['nombre', 'descripcion']
    ordering = ['nombre']


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    """Admin para el modelo Empresa"""

    list_display = ['nombre_empresa', 'ruc', 'sector', 'tamaño_empresa', 'verificada', 'fecha_creacion']
    list_filter = ['tamaño_empresa', 'verificada', 'sector']
    search_fields = ['nombre_empresa', 'ruc', 'descripcion']
    ordering = ['-fecha_creacion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


@admin.register(PerfilPostulante)
class PerfilPostulanteAdmin(admin.ModelAdmin):
    """Admin para el modelo PerfilPostulante"""

    list_display = ['usuario', 'titulo_profesional', 'nivel_experiencia', 'años_experiencia', 'completado', 'fecha_actualizacion']
    list_filter = ['nivel_experiencia', 'completado', 'disponibilidad']
    search_fields = ['usuario__email', 'usuario__nombre', 'titulo_profesional', 'habilidades']
    ordering = ['-fecha_actualizacion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']


@admin.register(OfertaTrabajo)
class OfertaTrabajoAdmin(admin.ModelAdmin):
    """Admin para el modelo OfertaTrabajo"""

    list_display = ['titulo', 'empresa', 'categoria', 'modalidad', 'tipo_contrato', 'estado', 'aprobada_admin', 'fecha_publicacion']
    list_filter = ['estado', 'modalidad', 'tipo_contrato', 'nivel_experiencia', 'aprobada_admin', 'categoria']
    search_fields = ['titulo', 'descripcion', 'empresa__nombre_empresa']
    ordering = ['-fecha_publicacion', '-fecha_creacion']
    readonly_fields = ['vistas', 'fecha_creacion', 'fecha_actualizacion', 'fecha_aprobacion']

    fieldsets = (
        ('Información Básica', {
            'fields': ('empresa', 'categoria', 'titulo', 'descripcion')
        }),
        ('Detalles del Puesto', {
            'fields': ('requisitos', 'responsabilidades', 'beneficios', 'ubicacion')
        }),
        ('Condiciones Laborales', {
            'fields': ('modalidad', 'tipo_contrato', 'nivel_experiencia', 'vacantes_disponibles')
        }),
        ('Salario', {
            'fields': ('salario_min', 'salario_max', 'moneda')
        }),
        ('Fechas', {
            'fields': ('fecha_publicacion', 'fecha_expiracion', 'fecha_inicio_deseada')
        }),
        ('Estado y Aprobación', {
            'fields': ('estado', 'aprobada_admin', 'fecha_aprobacion')
        }),
        ('Estadísticas', {
            'fields': ('vistas', 'fecha_creacion', 'fecha_actualizacion')
        }),
    )


@admin.register(Postulacion)
class PostulacionAdmin(admin.ModelAdmin):
    """Admin para el modelo Postulacion"""

    list_display = ['postulante', 'oferta', 'estado', 'puntuacion_match', 'fecha_postulacion', 'fecha_cambio_estado']
    list_filter = ['estado', 'fecha_postulacion']
    search_fields = ['postulante__usuario__email', 'postulante__usuario__nombre', 'oferta__titulo']
    ordering = ['-fecha_postulacion']
    readonly_fields = ['fecha_postulacion', 'fecha_cambio_estado']

    fieldsets = (
        ('Información de la Postulación', {
            'fields': ('oferta', 'postulante', 'estado', 'puntuacion_match')
        }),
        ('Documentos', {
            'fields': ('carta_presentacion', 'cv_url_postulacion')
        }),
        ('Notas del Empleador', {
            'fields': ('notas_empleador',)
        }),
        ('Fechas', {
            'fields': ('fecha_postulacion', 'fecha_cambio_estado')
        }),
    )


@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    """Admin para el modelo Favorito"""

    list_display = ['usuario', 'oferta', 'fecha_agregado']
    list_filter = ['fecha_agregado']
    search_fields = ['usuario__email', 'oferta__titulo']
    ordering = ['-fecha_agregado']
    readonly_fields = ['fecha_agregado']


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    """Admin para el modelo Notificacion"""

    list_display = ['usuario', 'tipo', 'titulo', 'leida', 'fecha_creacion']
    list_filter = ['tipo', 'leida', 'fecha_creacion']
    search_fields = ['usuario__email', 'titulo', 'mensaje']
    ordering = ['-fecha_creacion']
    readonly_fields = ['fecha_creacion', 'fecha_leida']

    fieldsets = (
        ('Información de la Notificación', {
            'fields': ('usuario', 'tipo', 'titulo', 'mensaje', 'enlace')
        }),
        ('Estado', {
            'fields': ('leida', 'fecha_creacion', 'fecha_leida')
        }),
    )
