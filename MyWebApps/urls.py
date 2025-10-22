from django.urls import path
from . import views

urlpatterns = [
    # Páginas públicas
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
]
