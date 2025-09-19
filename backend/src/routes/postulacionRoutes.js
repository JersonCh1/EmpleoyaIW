const express = require('express');
const {
  createPostulacion,
  getMyPostulaciones,
  getPostulacionesByOferta,
  getPostulacionById,
  changePostulacionStatus,
  updatePostulacionNotes,
  withdrawPostulacion,
  getPostulacionesStats,
  getGeneralStats
} = require('../controllers/postulacionController');

const { verifyToken, requireRole } = require('../controllers/authController');
const { validateCreatePostulacion, validateChangeStatus } = require('../middleware/validators');

const router = express.Router();

// =============================================
// RUTAS PROTEGIDAS - POSTULANTES
// =============================================

// Crear postulación
router.post('/', verifyToken, requireRole('postulante'), validateCreatePostulacion, createPostulacion);

// Obtener mis postulaciones
router.get('/my/postulaciones', verifyToken, requireRole('postulante'), getMyPostulaciones);

// Retirar postulación
router.delete('/:id/withdraw', verifyToken, requireRole('postulante'), withdrawPostulacion);

// =============================================
// RUTAS PROTEGIDAS - EMPLEADORES
// =============================================

// Obtener postulaciones de una oferta
router.get('/oferta/:id_oferta', verifyToken, requireRole('empleador'), getPostulacionesByOferta);

// Cambiar estado de postulación
router.patch('/:id/status', verifyToken, requireRole('empleador'), validateChangeStatus, changePostulacionStatus);

// Actualizar notas de postulación
router.patch('/:id/notes', verifyToken, requireRole('empleador'), updatePostulacionNotes);

// Obtener estadísticas de postulaciones por oferta
router.get('/oferta/:id_oferta/stats', verifyToken, requireRole('empleador'), getPostulacionesStats);

// =============================================
// RUTAS PROTEGIDAS - COMPARTIDAS
// =============================================

// Obtener postulación específica (postulante, empleador o admin)
router.get('/:id', verifyToken, getPostulacionById);

// =============================================
// RUTAS PROTEGIDAS - ADMINISTRADORES
// =============================================

// Obtener estadísticas generales
router.get('/admin/stats', verifyToken, requireRole('administrador'), getGeneralStats);

module.exports = router;