from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from .models import (
    Usuario, Categoria, Empresa, PerfilPostulante,
    OfertaTrabajo, Postulacion, Favorito, Notificacion
)
from .serializers import (
    UsuarioSerializer, UsuarioRegistroSerializer,
    CategoriaSerializer, EmpresaSerializer, PerfilPostulanteSerializer,
    OfertaTrabajoListSerializer, OfertaTrabajoDetailSerializer, OfertaTrabajoCreateSerializer,
    PostulacionListSerializer, PostulacionDetailSerializer, PostulacionCreateSerializer,
    FavoritoSerializer, NotificacionSerializer,
    CambiarPasswordSerializer, EstadisticasEmpleadorSerializer,
    EstadisticasPostulanteSerializer, EstadisticasGeneralesSerializer
)


# ==================== AUTENTICACIÓN ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """Login y obtener token"""
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UsuarioSerializer(user).data
        })
    else:
        return Response(
            {'error': 'Credenciales incorrectas'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    """Registro de nuevo usuario"""
    serializer = UsuarioRegistroSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UsuarioSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """Logout y eliminar token"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Sesión cerrada correctamente'})
    except:
        return Response({'error': 'Error al cerrar sesión'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_actual(request):
    """Obtener perfil del usuario actual"""
    serializer = UsuarioSerializer(request.user)
    data = serializer.data

    # Agregar datos adicionales según tipo de usuario
    if request.user.tipo_usuario == 'empleador' and hasattr(request.user, 'empresa'):
        data['empresa'] = EmpresaSerializer(request.user.empresa).data
    elif request.user.tipo_usuario == 'postulante' and hasattr(request.user, 'perfil_postulante'):
        data['perfil_postulante'] = PerfilPostulanteSerializer(request.user.perfil_postulante).data

    return Response(data)


# ==================== CATEGORÍAS ====================

class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para Categorías (solo lectura)"""
    queryset = Categoria.objects.filter(activa=True).annotate(
        num_ofertas=Count('ofertas', filter=Q(ofertas__estado='activa'))
    )
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]


# ==================== OFERTAS ====================

class OfertaTrabajoViewSet(viewsets.ModelViewSet):
    """ViewSet para Ofertas de Trabajo"""
    queryset = OfertaTrabajo.objects.filter(estado='activa', aprobada_admin=True).select_related('empresa', 'categoria')
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'descripcion', 'empresa__nombre_empresa']
    ordering_fields = ['fecha_publicacion', 'vistas', 'salario_max']
    ordering = ['-fecha_publicacion']

    def get_serializer_class(self):
        if self.action == 'list':
            return OfertaTrabajoListSerializer
        elif self.action == 'create' or self.action == 'update':
            return OfertaTrabajoCreateSerializer
        return OfertaTrabajoDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filtros adicionales
        categoria = self.request.query_params.get('categoria')
        modalidad = self.request.query_params.get('modalidad')
        ubicacion = self.request.query_params.get('ubicacion')
        tipo_contrato = self.request.query_params.get('tipo_contrato')
        nivel_experiencia = self.request.query_params.get('nivel_experiencia')
        salario_min = self.request.query_params.get('salario_min')
        salario_max = self.request.query_params.get('salario_max')

        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        if modalidad:
            queryset = queryset.filter(modalidad=modalidad)
        if ubicacion:
            queryset = queryset.filter(ubicacion__icontains=ubicacion)
        if tipo_contrato:
            queryset = queryset.filter(tipo_contrato=tipo_contrato)
        if nivel_experiencia:
            queryset = queryset.filter(nivel_experiencia=nivel_experiencia)
        if salario_min:
            queryset = queryset.filter(salario_min__gte=salario_min)
        if salario_max:
            queryset = queryset.filter(salario_max__lte=salario_max)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        """Incrementar vistas al ver detalle"""
        instance = self.get_object()
        instance.vistas += 1
        instance.save(update_fields=['vistas'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def similares(self, request, pk=None):
        """Obtener ofertas similares"""
        oferta = self.get_object()
        similares = OfertaTrabajo.objects.filter(
            categoria=oferta.categoria,
            estado='activa',
            aprobada_admin=True
        ).exclude(id=oferta.id).select_related('empresa', 'categoria')[:6]

        serializer = OfertaTrabajoListSerializer(similares, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mis_ofertas(self, request):
        """Obtener ofertas del empleador actual"""
        if request.user.tipo_usuario != 'empleador':
            return Response(
                {'error': 'Solo empleadores pueden acceder a esto'},
                status=status.HTTP_403_FORBIDDEN
            )

        ofertas = OfertaTrabajo.objects.filter(
            empresa__usuario=request.user
        ).select_related('categoria')

        serializer = OfertaTrabajoListSerializer(ofertas, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Crear oferta para el empleador actual"""
        if self.request.user.tipo_usuario != 'empleador':
            raise serializers.ValidationError("Solo empleadores pueden crear ofertas")

        if not hasattr(self.request.user, 'empresa'):
            raise serializers.ValidationError("Debes completar tu perfil de empresa primero")

        serializer.save(
            empresa=self.request.user.empresa,
            estado='activa',
            fecha_publicacion=timezone.now()
        )


# ==================== POSTULACIONES ====================

class PostulacionViewSet(viewsets.ModelViewSet):
    """ViewSet para Postulaciones"""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PostulacionCreateSerializer
        elif self.action == 'list':
            return PostulacionListSerializer
        return PostulacionDetailSerializer

    def get_queryset(self):
        """Filtrar postulaciones según tipo de usuario"""
        user = self.request.user

        if user.tipo_usuario == 'postulante' and hasattr(user, 'perfil_postulante'):
            # Postulante ve solo sus postulaciones
            return Postulacion.objects.filter(
                postulante=user.perfil_postulante
            ).select_related('oferta__empresa', 'oferta__categoria')

        elif user.tipo_usuario == 'empleador' and hasattr(user, 'empresa'):
            # Empleador ve postulaciones a sus ofertas
            return Postulacion.objects.filter(
                oferta__empresa=user.empresa
            ).select_related('oferta', 'postulante__usuario')

        else:
            return Postulacion.objects.none()

    def perform_create(self, serializer):
        """Crear postulación"""
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cambiar_estado(self, request, pk=None):
        """Cambiar estado de postulación (solo empleadores)"""
        if request.user.tipo_usuario != 'empleador':
            return Response(
                {'error': 'Solo empleadores pueden cambiar el estado'},
                status=status.HTTP_403_FORBIDDEN
            )

        postulacion = self.get_object()
        nuevo_estado = request.data.get('estado')
        notas = request.data.get('notas_empleador', '')

        if nuevo_estado not in dict(Postulacion.ESTADO_CHOICES).keys():
            return Response(
                {'error': 'Estado inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        postulacion.estado = nuevo_estado
        postulacion.fecha_cambio_estado = timezone.now()
        if notas:
            postulacion.notas_empleador = notas
        postulacion.save()

        serializer = self.get_serializer(postulacion)
        return Response(serializer.data)


# ==================== EMPRESAS ====================

class EmpresaViewSet(viewsets.ModelViewSet):
    """ViewSet para Empresas"""
    queryset = Empresa.objects.all().select_related('usuario')
    serializer_class = EmpresaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def mi_empresa(self, request):
        """Obtener/actualizar empresa del usuario actual"""
        if request.user.tipo_usuario != 'empleador':
            return Response(
                {'error': 'Solo empleadores tienen empresa'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not hasattr(request.user, 'empresa'):
            return Response(
                {'error': 'No tienes una empresa creada'},
                status=status.HTTP_404_NOT_FOUND
            )

        empresa = request.user.empresa

        if request.method == 'GET':
            serializer = self.get_serializer(empresa)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(empresa, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== PERFILES DE POSTULANTE ====================

class PerfilPostulanteViewSet(viewsets.ModelViewSet):
    """ViewSet para Perfiles de Postulante"""
    queryset = PerfilPostulante.objects.all().select_related('usuario')
    serializer_class = PerfilPostulanteSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def mi_perfil(self, request):
        """Obtener/actualizar perfil del usuario actual"""
        if request.user.tipo_usuario != 'postulante':
            return Response(
                {'error': 'Solo postulantes tienen perfil'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not hasattr(request.user, 'perfil_postulante'):
            return Response(
                {'error': 'No tienes un perfil creado'},
                status=status.HTTP_404_NOT_FOUND
            )

        perfil = request.user.perfil_postulante

        if request.method == 'GET':
            serializer = self.get_serializer(perfil)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(perfil, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== FAVORITOS ====================

class FavoritoViewSet(viewsets.ModelViewSet):
    """ViewSet para Favoritos"""
    serializer_class = FavoritoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user).select_related('oferta__empresa')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


# ==================== NOTIFICACIONES ====================

class NotificacionViewSet(viewsets.ModelViewSet):
    """ViewSet para Notificaciones"""
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user).order_by('-fecha_creacion')

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """Marcar notificación como leída"""
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.fecha_leida = timezone.now()
        notificacion.save()

        serializer = self.get_serializer(notificacion)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """Marcar todas las notificaciones como leídas"""
        self.get_queryset().update(leida=True, fecha_leida=timezone.now())
        return Response({'message': 'Todas las notificaciones marcadas como leídas'})


# ==================== ESTADÍSTICAS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def estadisticas_generales(request):
    """Estadísticas generales del sistema"""
    una_semana_atras = timezone.now() - timedelta(days=7)

    stats = {
        'total_ofertas': OfertaTrabajo.objects.filter(estado='activa').count(),
        'total_empresas': Empresa.objects.count(),
        'total_postulantes': PerfilPostulante.objects.count(),
        'total_categorias': Categoria.objects.filter(activa=True).count(),
        'ofertas_esta_semana': OfertaTrabajo.objects.filter(
            fecha_publicacion__gte=una_semana_atras
        ).count(),
    }

    serializer = EstadisticasGeneralesSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_estadisticas(request):
    """Estadísticas del usuario actual"""
    user = request.user
    un_mes_atras = timezone.now() - timedelta(days=30)

    if user.tipo_usuario == 'empleador' and hasattr(user, 'empresa'):
        ofertas = OfertaTrabajo.objects.filter(empresa=user.empresa)
        stats = {
            'total_ofertas': ofertas.count(),
            'ofertas_activas': ofertas.filter(estado='activa').count(),
            'total_postulaciones': Postulacion.objects.filter(oferta__empresa=user.empresa).count(),
            'postulaciones_pendientes': Postulacion.objects.filter(
                oferta__empresa=user.empresa,
                estado='pendiente'
            ).count(),
            'postulaciones_este_mes': Postulacion.objects.filter(
                oferta__empresa=user.empresa,
                fecha_postulacion__gte=un_mes_atras
            ).count(),
        }
        serializer = EstadisticasEmpleadorSerializer(stats)

    elif user.tipo_usuario == 'postulante' and hasattr(user, 'perfil_postulante'):
        postulaciones = Postulacion.objects.filter(postulante=user.perfil_postulante)
        stats = {
            'total_postulaciones': postulaciones.count(),
            'en_proceso': postulaciones.filter(
                estado__in=['pendiente', 'en_revision', 'preseleccionado', 'entrevista']
            ).count(),
            'aceptadas': postulaciones.filter(estado='aceptado').count(),
            'rechazadas': postulaciones.filter(estado='rechazado').count(),
            'postulaciones_este_mes': postulaciones.filter(
                fecha_postulacion__gte=un_mes_atras
            ).count(),
        }
        serializer = EstadisticasPostulanteSerializer(stats)

    else:
        return Response({'error': 'Usuario sin perfil'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.data)
