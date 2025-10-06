from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views, views

# Router para viewsets (API)
router = DefaultRouter()
router.register(r'categorias', api_views.CategoriaViewSet, basename='categoria')
router.register(r'ofertas', api_views.OfertaTrabajoViewSet, basename='oferta')
router.register(r'postulaciones', api_views.PostulacionViewSet, basename='postulacion')
router.register(r'empresas', api_views.EmpresaViewSet, basename='empresa')
router.register(r'perfiles', api_views.PerfilPostulanteViewSet, basename='perfil')
router.register(r'favoritos', api_views.FavoritoViewSet, basename='favorito')
router.register(r'notificaciones', api_views.NotificacionViewSet, basename='notificacion')

urlpatterns = [
    # ==================== VISTAS WEB ====================
    # Públicas
    path('', views.home, name='home'),
    path('ofertas/', views.ofertas_lista, name='ofertas_lista'),
    path('ofertas/<int:oferta_id>/', views.oferta_detalle, name='oferta_detalle'),

    # Autenticación
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/empleador/', views.dashboard_empleador, name='dashboard_empleador'),
    path('dashboard/postulante/', views.dashboard_postulante, name='dashboard_postulante'),

    # Ofertas (Empleador)
    path('mis-ofertas/', views.mis_ofertas, name='mis_ofertas'),
    path('crear-oferta/', views.crear_oferta, name='crear_oferta'),
    path('ofertas/<int:oferta_id>/postulaciones/', views.postulaciones_oferta, name='postulaciones_oferta'),

    # Postulaciones (Postulante)
    path('postular/<int:oferta_id>/', views.postular_oferta, name='postular_oferta'),
    path('mis-postulaciones/', views.mis_postulaciones, name='mis_postulaciones'),

    # Perfiles
    path('perfil/', views.mi_perfil, name='mi_perfil'),
    path('perfil/empresa/', views.perfil_empresa, name='perfil_empresa'),
    path('perfil/postulante/', views.perfil_postulante_view, name='perfil_postulante'),

    # ==================== API REST ====================
    path('api/auth/login/', api_views.login_api, name='api_login'),
    path('api/auth/register/', api_views.register_api, name='api_register'),
    path('api/auth/logout/', api_views.logout_api, name='api_logout'),
    path('api/auth/perfil/', api_views.perfil_actual, name='api_perfil_actual'),
    path('api/estadisticas/generales/', api_views.estadisticas_generales, name='api_estadisticas_generales'),
    path('api/estadisticas/mis-estadisticas/', api_views.mis_estadisticas, name='api_mis_estadisticas'),
    path('api/', include(router.urls)),
]
