from rest_framework import serializers
from .models import (
    Usuario, Categoria, Empresa, PerfilPostulante,
    OfertaTrabajo, Postulacion, Favorito, Notificacion
)


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para Usuario"""

    nombre_completo = serializers.ReadOnlyField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre', 'apellido', 'nombre_completo',
            'telefono', 'tipo_usuario', 'estado', 'email_verificado',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class UsuarioRegistroSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuarios"""

    password = serializers.CharField(write_only=True, min_length=4)
    password2 = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'password2', 'nombre', 'apellido', 'telefono', 'tipo_usuario']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data, password=password)
        user.is_staff = True
        user.save()

        # Crear perfil según tipo
        if user.tipo_usuario == 'postulante':
            PerfilPostulante.objects.create(usuario=user)
        elif user.tipo_usuario == 'empleador':
            Empresa.objects.create(
                usuario=user,
                nombre_empresa=f'Empresa de {user.nombre}'
            )

        return user


class CategoriaSerializer(serializers.ModelSerializer):
    """Serializer para Categoria"""

    num_ofertas = serializers.IntegerField(read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'icono', 'activa', 'fecha_creacion', 'num_ofertas']
        read_only_fields = ['id', 'fecha_creacion']


class EmpresaSerializer(serializers.ModelSerializer):
    """Serializer para Empresa"""

    usuario = UsuarioSerializer(read_only=True)
    total_ofertas = serializers.SerializerMethodField()

    class Meta:
        model = Empresa
        fields = [
            'id', 'usuario', 'nombre_empresa', 'ruc', 'descripcion',
            'sector', 'ubicacion', 'sitio_web', 'logo_url',
            'tamaño_empresa', 'telefono_empresa', 'verificada',
            'fecha_creacion', 'fecha_actualizacion', 'total_ofertas'
        ]
        read_only_fields = ['id', 'usuario', 'fecha_creacion', 'fecha_actualizacion', 'verificada']

    def get_total_ofertas(self, obj):
        return obj.ofertas.count()


class PerfilPostulanteSerializer(serializers.ModelSerializer):
    """Serializer para PerfilPostulante"""

    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = PerfilPostulante
        fields = [
            'id', 'usuario', 'titulo_profesional', 'resumen_profesional',
            'nivel_experiencia', 'años_experiencia', 'habilidades',
            'educacion', 'experiencia_laboral', 'certificaciones', 'idiomas',
            'cv_url', 'foto_perfil_url', 'ubicacion', 'salario_esperado',
            'moneda_salario', 'disponibilidad', 'portafolio_url',
            'linkedin_url', 'github_url', 'completado',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['id', 'usuario', 'fecha_creacion', 'fecha_actualizacion']


class OfertaTrabajoListSerializer(serializers.ModelSerializer):
    """Serializer para lista de ofertas (menos campos)"""

    empresa_nombre = serializers.CharField(source='empresa.nombre_empresa', read_only=True)
    empresa_logo = serializers.CharField(source='empresa.logo_url', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = OfertaTrabajo
        fields = [
            'id', 'titulo', 'empresa_nombre', 'empresa_logo', 'categoria_nombre',
            'ubicacion', 'modalidad', 'tipo_contrato', 'nivel_experiencia',
            'salario_min', 'salario_max', 'moneda', 'fecha_publicacion',
            'vistas', 'vacantes_disponibles'
        ]


class OfertaTrabajoDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de oferta (todos los campos)"""

    empresa = EmpresaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    total_postulaciones = serializers.SerializerMethodField()

    class Meta:
        model = OfertaTrabajo
        fields = '__all__'
        read_only_fields = [
            'id', 'empresa', 'fecha_publicacion', 'aprobada_admin',
            'fecha_aprobacion', 'vistas', 'fecha_creacion', 'fecha_actualizacion'
        ]

    def get_total_postulaciones(self, obj):
        return obj.postulaciones.count()


class OfertaTrabajoCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear ofertas"""

    class Meta:
        model = OfertaTrabajo
        fields = [
            'categoria', 'titulo', 'descripcion', 'requisitos',
            'responsabilidades', 'beneficios', 'salario_min', 'salario_max',
            'moneda', 'ubicacion', 'modalidad', 'tipo_contrato',
            'nivel_experiencia', 'vacantes_disponibles', 'fecha_expiracion',
            'fecha_inicio_deseada'
        ]


class PostulacionListSerializer(serializers.ModelSerializer):
    """Serializer para lista de postulaciones"""

    oferta_titulo = serializers.CharField(source='oferta.titulo', read_only=True)
    empresa_nombre = serializers.CharField(source='oferta.empresa.nombre_empresa', read_only=True)
    postulante_nombre = serializers.CharField(source='postulante.usuario.nombre_completo', read_only=True)
    postulante_email = serializers.EmailField(source='postulante.usuario.email', read_only=True)

    class Meta:
        model = Postulacion
        fields = [
            'id', 'oferta', 'oferta_titulo', 'empresa_nombre',
            'postulante', 'postulante_nombre', 'postulante_email',
            'fecha_postulacion', 'estado', 'puntuacion_match'
        ]


class PostulacionDetailSerializer(serializers.ModelSerializer):
    """Serializer para detalle de postulación"""

    oferta = OfertaTrabajoDetailSerializer(read_only=True)
    postulante = PerfilPostulanteSerializer(read_only=True)

    class Meta:
        model = Postulacion
        fields = '__all__'
        read_only_fields = [
            'id', 'oferta', 'postulante', 'fecha_postulacion',
            'fecha_cambio_estado'
        ]


class PostulacionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear postulación"""

    class Meta:
        model = Postulacion
        fields = ['oferta', 'carta_presentacion', 'cv_url_postulacion']

    def validate_oferta(self, value):
        # Verificar que la oferta esté activa
        if value.estado != 'activa':
            raise serializers.ValidationError("Esta oferta no está activa")
        return value

    def create(self, validated_data):
        # El postulante se asigna automáticamente desde el usuario autenticado
        request = self.context.get('request')
        if hasattr(request.user, 'perfil_postulante'):
            validated_data['postulante'] = request.user.perfil_postulante

            # Verificar si ya postuló
            if Postulacion.objects.filter(
                oferta=validated_data['oferta'],
                postulante=validated_data['postulante']
            ).exists():
                raise serializers.ValidationError("Ya has postulado a esta oferta")

            return super().create(validated_data)
        else:
            raise serializers.ValidationError("Debes tener un perfil de postulante")


class FavoritoSerializer(serializers.ModelSerializer):
    """Serializer para Favorito"""

    oferta = OfertaTrabajoListSerializer(read_only=True)
    oferta_id = serializers.PrimaryKeyRelatedField(
        queryset=OfertaTrabajo.objects.all(),
        source='oferta',
        write_only=True
    )

    class Meta:
        model = Favorito
        fields = ['id', 'oferta', 'oferta_id', 'fecha_agregado']
        read_only_fields = ['id', 'fecha_agregado']


class NotificacionSerializer(serializers.ModelSerializer):
    """Serializer para Notificacion"""

    class Meta:
        model = Notificacion
        fields = '__all__'
        read_only_fields = ['id', 'usuario', 'fecha_creacion', 'fecha_leida']


# Serializer para cambiar contraseña
class CambiarPasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=4)
    new_password2 = serializers.CharField(required=True, min_length=4)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("Las contraseñas nuevas no coinciden")
        return data


# Serializer para estadísticas
class EstadisticasEmpleadorSerializer(serializers.Serializer):
    """Serializer para estadísticas del empleador"""

    total_ofertas = serializers.IntegerField()
    ofertas_activas = serializers.IntegerField()
    total_postulaciones = serializers.IntegerField()
    postulaciones_pendientes = serializers.IntegerField()
    postulaciones_este_mes = serializers.IntegerField()


class EstadisticasPostulanteSerializer(serializers.Serializer):
    """Serializer para estadísticas del postulante"""

    total_postulaciones = serializers.IntegerField()
    en_proceso = serializers.IntegerField()
    aceptadas = serializers.IntegerField()
    rechazadas = serializers.IntegerField()
    postulaciones_este_mes = serializers.IntegerField()


class EstadisticasGeneralesSerializer(serializers.Serializer):
    """Serializer para estadísticas generales"""

    total_ofertas = serializers.IntegerField()
    total_empresas = serializers.IntegerField()
    total_postulantes = serializers.IntegerField()
    total_categorias = serializers.IntegerField()
    ofertas_esta_semana = serializers.IntegerField()
