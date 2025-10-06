from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""

    def create_user(self, email, password=None, **extra_fields):
        """Crear y guardar un usuario regular"""
        if not email:
            raise ValueError('El email es obligatorio')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crear y guardar un superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('tipo_usuario', 'admin')

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo de Usuario para EMPLEOYA"""

    TIPO_USUARIO_CHOICES = [
        ('postulante', 'Postulante'),
        ('empleador', 'Empleador'),
        ('admin', 'Administrador'),
    ]

    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
    ]

    email = models.EmailField(unique=True, verbose_name='Correo Electrónico')
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    apellido = models.CharField(max_length=100, blank=True, verbose_name='Apellido')
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    tipo_usuario = models.CharField(
        max_length=20,
        choices=TIPO_USUARIO_CHOICES,
        default='postulante',
        verbose_name='Tipo de Usuario'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='activo',
        verbose_name='Estado'
    )
    email_verificado = models.BooleanField(default=False, verbose_name='Email Verificado')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')

    # Campos requeridos por Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        db_table = 'usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"

    @property
    def nombre_completo(self):
        return f"{self.nombre} {self.apellido}".strip()


class Categoria(models.Model):
    """Categorías de ofertas de trabajo"""

    nombre = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción')
    icono = models.CharField(max_length=50, blank=True, null=True, verbose_name='Icono')
    activa = models.BooleanField(default=True, verbose_name='Activa')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    class Meta:
        db_table = 'categoria'
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Empresa(models.Model):
    """Perfil de empresa/empleador"""

    TAMANO_EMPRESA_CHOICES = [
        ('startup', 'Startup (1-10)'),
        ('pyme', 'PYME (11-50)'),
        ('mediana', 'Mediana (51-200)'),
        ('grande', 'Grande (201-1000)'),
        ('corporacion', 'Corporación (1000+)'),
    ]

    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='empresa',
        verbose_name='Usuario'
    )
    nombre_empresa = models.CharField(max_length=200, verbose_name='Nombre de la Empresa')
    ruc = models.CharField(max_length=20, unique=True, null=True, blank=True, verbose_name='RUC')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción')
    sector = models.CharField(max_length=100, blank=True, null=True, verbose_name='Sector')
    ubicacion = models.CharField(max_length=200, blank=True, null=True, verbose_name='Ubicación')
    sitio_web = models.URLField(blank=True, null=True, verbose_name='Sitio Web')
    logo_url = models.CharField(max_length=500, blank=True, null=True, verbose_name='URL del Logo')
    tamaño_empresa = models.CharField(
        max_length=20,
        choices=TAMANO_EMPRESA_CHOICES,
        default='pyme',
        verbose_name='Tamaño de Empresa'
    )
    telefono_empresa = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    verificada = models.BooleanField(default=False, verbose_name='Verificada')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')

    class Meta:
        db_table = 'empresa'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return self.nombre_empresa


class PerfilPostulante(models.Model):
    """Perfil del postulante"""

    NIVEL_EXPERIENCIA_CHOICES = [
        ('sin_experiencia', 'Sin Experiencia'),
        ('junior', 'Junior (1-2 años)'),
        ('semi_senior', 'Semi Senior (3-5 años)'),
        ('senior', 'Senior (6-10 años)'),
        ('lead', 'Lead/Experto (10+ años)'),
    ]

    DISPONIBILIDAD_CHOICES = [
        ('inmediata', 'Inmediata'),
        ('2_semanas', '2 Semanas'),
        ('1_mes', '1 Mes'),
        ('negociable', 'Negociable'),
    ]

    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil_postulante',
        verbose_name='Usuario'
    )
    titulo_profesional = models.CharField(max_length=200, blank=True, null=True, verbose_name='Título Profesional')
    resumen_profesional = models.TextField(blank=True, null=True, verbose_name='Resumen Profesional')
    nivel_experiencia = models.CharField(
        max_length=20,
        choices=NIVEL_EXPERIENCIA_CHOICES,
        default='sin_experiencia',
        verbose_name='Nivel de Experiencia'
    )
    años_experiencia = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(50)],
        verbose_name='Años de Experiencia'
    )
    habilidades = models.TextField(blank=True, null=True, verbose_name='Habilidades')
    educacion = models.TextField(blank=True, null=True, verbose_name='Educación')
    experiencia_laboral = models.TextField(blank=True, null=True, verbose_name='Experiencia Laboral')
    certificaciones = models.TextField(blank=True, null=True, verbose_name='Certificaciones')
    idiomas = models.TextField(blank=True, null=True, verbose_name='Idiomas')
    cv_url = models.CharField(max_length=500, blank=True, null=True, verbose_name='URL del CV')
    foto_perfil_url = models.CharField(max_length=500, blank=True, null=True, verbose_name='URL Foto de Perfil')
    ubicacion = models.CharField(max_length=200, blank=True, null=True, verbose_name='Ubicación')
    salario_esperado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Salario Esperado'
    )
    moneda_salario = models.CharField(max_length=3, default='PEN', verbose_name='Moneda')
    disponibilidad = models.CharField(
        max_length=20,
        choices=DISPONIBILIDAD_CHOICES,
        default='negociable',
        verbose_name='Disponibilidad'
    )
    portafolio_url = models.URLField(blank=True, null=True, verbose_name='URL del Portafolio')
    linkedin_url = models.URLField(blank=True, null=True, verbose_name='URL de LinkedIn')
    github_url = models.URLField(blank=True, null=True, verbose_name='URL de GitHub')
    completado = models.BooleanField(default=False, verbose_name='Perfil Completado')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')

    class Meta:
        db_table = 'perfil_postulante'
        verbose_name = 'Perfil de Postulante'
        verbose_name_plural = 'Perfiles de Postulantes'
        ordering = ['-fecha_actualizacion']

    def __str__(self):
        return f"{self.usuario.nombre_completo} - {self.titulo_profesional or 'Sin título'}"


class OfertaTrabajo(models.Model):
    """Ofertas de trabajo publicadas por empresas"""

    MODALIDAD_CHOICES = [
        ('presencial', 'Presencial'),
        ('remoto', 'Remoto'),
        ('hibrido', 'Híbrido'),
    ]

    TIPO_CONTRATO_CHOICES = [
        ('tiempo_completo', 'Tiempo Completo'),
        ('medio_tiempo', 'Medio Tiempo'),
        ('por_proyecto', 'Por Proyecto'),
        ('freelance', 'Freelance'),
        ('practicas', 'Prácticas'),
        ('temporal', 'Temporal'),
    ]

    NIVEL_EXPERIENCIA_CHOICES = [
        ('sin_experiencia', 'Sin Experiencia'),
        ('junior', 'Junior'),
        ('semi_senior', 'Semi Senior'),
        ('senior', 'Senior'),
        ('lead', 'Lead/Experto'),
    ]

    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('pendiente_aprobacion', 'Pendiente de Aprobación'),
        ('activa', 'Activa'),
        ('pausada', 'Pausada'),
        ('expirada', 'Expirada'),
        ('cerrada', 'Cerrada'),
    ]

    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='ofertas',
        verbose_name='Empresa'
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ofertas',
        verbose_name='Categoría'
    )
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descripcion = models.TextField(verbose_name='Descripción')
    requisitos = models.TextField(blank=True, null=True, verbose_name='Requisitos')
    responsabilidades = models.TextField(blank=True, null=True, verbose_name='Responsabilidades')
    beneficios = models.TextField(blank=True, null=True, verbose_name='Beneficios')
    salario_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Salario Mínimo'
    )
    salario_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Salario Máximo'
    )
    moneda = models.CharField(max_length=3, default='PEN', verbose_name='Moneda')
    ubicacion = models.CharField(max_length=200, blank=True, null=True, verbose_name='Ubicación')
    modalidad = models.CharField(
        max_length=20,
        choices=MODALIDAD_CHOICES,
        verbose_name='Modalidad'
    )
    tipo_contrato = models.CharField(
        max_length=20,
        choices=TIPO_CONTRATO_CHOICES,
        verbose_name='Tipo de Contrato'
    )
    nivel_experiencia = models.CharField(
        max_length=20,
        choices=NIVEL_EXPERIENCIA_CHOICES,
        verbose_name='Nivel de Experiencia Requerido'
    )
    vacantes_disponibles = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Vacantes Disponibles'
    )
    fecha_publicacion = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Publicación')
    fecha_expiracion = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Expiración')
    fecha_inicio_deseada = models.DateField(blank=True, null=True, verbose_name='Fecha de Inicio Deseada')
    estado = models.CharField(
        max_length=30,
        choices=ESTADO_CHOICES,
        default='borrador',
        verbose_name='Estado'
    )
    aprobada_admin = models.BooleanField(default=False, verbose_name='Aprobada por Admin')
    fecha_aprobacion = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Aprobación')
    vistas = models.IntegerField(default=0, verbose_name='Número de Vistas')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Última Actualización')

    class Meta:
        db_table = 'oferta_trabajo'
        verbose_name = 'Oferta de Trabajo'
        verbose_name_plural = 'Ofertas de Trabajo'
        ordering = ['-fecha_publicacion', '-fecha_creacion']
        indexes = [
            models.Index(fields=['estado', 'fecha_publicacion']),
            models.Index(fields=['categoria', 'estado']),
            models.Index(fields=['modalidad', 'estado']),
        ]

    def __str__(self):
        return f"{self.titulo} - {self.empresa.nombre_empresa}"

    def save(self, *args, **kwargs):
        # Si la oferta se activa y no tiene fecha de publicación, asignarla
        if self.estado == 'activa' and not self.fecha_publicacion:
            self.fecha_publicacion = timezone.now()
        super().save(*args, **kwargs)


class Postulacion(models.Model):
    """Postulaciones de candidatos a ofertas de trabajo"""

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_revision', 'En Revisión'),
        ('preseleccionado', 'Preseleccionado'),
        ('entrevista', 'En Entrevista'),
        ('rechazado', 'Rechazado'),
        ('aceptado', 'Aceptado'),
    ]

    oferta = models.ForeignKey(
        OfertaTrabajo,
        on_delete=models.CASCADE,
        related_name='postulaciones',
        verbose_name='Oferta de Trabajo'
    )
    postulante = models.ForeignKey(
        PerfilPostulante,
        on_delete=models.CASCADE,
        related_name='postulaciones',
        verbose_name='Postulante'
    )
    fecha_postulacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Postulación')
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente',
        verbose_name='Estado'
    )
    carta_presentacion = models.TextField(blank=True, null=True, verbose_name='Carta de Presentación')
    cv_url_postulacion = models.CharField(max_length=500, blank=True, null=True, verbose_name='URL del CV')
    fecha_cambio_estado = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Cambio de Estado')
    notas_empleador = models.TextField(blank=True, null=True, verbose_name='Notas del Empleador')
    puntuacion_match = models.IntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Puntuación de Match (%)'
    )

    class Meta:
        db_table = 'postulacion'
        verbose_name = 'Postulación'
        verbose_name_plural = 'Postulaciones'
        ordering = ['-fecha_postulacion']
        unique_together = ['oferta', 'postulante']
        indexes = [
            models.Index(fields=['estado', 'fecha_postulacion']),
            models.Index(fields=['oferta', 'estado']),
            models.Index(fields=['postulante', 'estado']),
        ]

    def __str__(self):
        return f"{self.postulante.usuario.nombre_completo} -> {self.oferta.titulo}"

    def save(self, *args, **kwargs):
        # Actualizar fecha de cambio de estado si cambió el estado
        if self.pk:
            old_instance = Postulacion.objects.get(pk=self.pk)
            if old_instance.estado != self.estado:
                self.fecha_cambio_estado = timezone.now()
        super().save(*args, **kwargs)


class Favorito(models.Model):
    """Ofertas marcadas como favoritas por postulantes"""

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='favoritos',
        verbose_name='Usuario'
    )
    oferta = models.ForeignKey(
        OfertaTrabajo,
        on_delete=models.CASCADE,
        related_name='favoritos',
        verbose_name='Oferta'
    )
    fecha_agregado = models.DateTimeField(auto_now_add=True, verbose_name='Fecha Agregado')

    class Meta:
        db_table = 'favorito'
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'
        unique_together = ['usuario', 'oferta']
        ordering = ['-fecha_agregado']

    def __str__(self):
        return f"{self.usuario.nombre_completo} - {self.oferta.titulo}"


class Notificacion(models.Model):
    """Notificaciones para usuarios"""

    TIPO_CHOICES = [
        ('postulacion', 'Nueva Postulación'),
        ('estado_postulacion', 'Cambio Estado Postulación'),
        ('nueva_oferta', 'Nueva Oferta'),
        ('mensaje', 'Mensaje'),
        ('alerta', 'Alerta'),
        ('sistema', 'Sistema'),
    ]

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name='Usuario'
    )
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, verbose_name='Tipo')
    titulo = models.CharField(max_length=200, verbose_name='Título')
    mensaje = models.TextField(verbose_name='Mensaje')
    enlace = models.CharField(max_length=500, blank=True, null=True, verbose_name='Enlace')
    leida = models.BooleanField(default=False, verbose_name='Leída')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    fecha_leida = models.DateTimeField(blank=True, null=True, verbose_name='Fecha de Lectura')

    class Meta:
        db_table = 'notificacion'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['usuario', 'leida', '-fecha_creacion']),
        ]

    def __str__(self):
        return f"{self.tipo} - {self.usuario.email} - {self.titulo}"
