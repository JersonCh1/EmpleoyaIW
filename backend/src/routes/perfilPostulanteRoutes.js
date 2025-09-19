const express = require('express');
const {
  createPerfil,
  getMyPerfil,
  getPerfilById,
  updatePerfil,
  searchPostulantes,
  updateCV,
  getMyStats,
  checkCompletitud
} = require('../controllers/perfilPostulanteController');

const { verifyToken, requireRole } = require('../controllers/authController');
const { validateCreatePerfilPostulante, validateUpdatePerfilPostulante } = require('../middleware/validators');

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS PARA EMPLEADORES
// =============================================

// Buscar postulantes con filtros (empleadores/admins)
router.get('/search', verifyToken, requireRole('empleador', 'administrador'), searchPostulantes);

// Ver perfil específico de postulante (empleadores/admins)
router.get('/:id', verifyToken, requireRole('empleador', 'administrador'), getPerfilById);

// =============================================
// RUTAS PROTEGIDAS - POSTULANTES
// =============================================

// Crear mi perfil
router.post('/', verifyToken, requireRole('postulante'), validateCreatePerfilPostulante, createPerfil);

// Obtener mi perfil
router.get('/my/profile', verifyToken, requireRole('postulante'), getMyPerfil);

// Actualizar mi perfil
router.put('/my/profile', verifyToken, requireRole('postulante'), validateUpdatePerfilPostulante, updatePerfil);

// Actualizar mi CV
router.patch('/my/cv', verifyToken, requireRole('postulante'), updateCV);

// Obtener mis estadísticas
router.get('/my/stats', verifyToken, requireRole('postulante'), getMyStats);

// Verificar completitud de mi perfil
router.get('/my/completitud', verifyToken, requireRole('postulante'), checkCompletitud);

module.exports = router;