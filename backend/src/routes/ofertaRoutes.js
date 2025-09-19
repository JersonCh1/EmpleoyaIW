const express = require('express');
const {
  createOferta,
  getOfertas,
  getOfertaById,
  getMyOfertas,
  updateOferta,
  changeOfertaStatus,
  approveOferta,
  getPendingOfertas,
  getOfertasStats,
  canApply
} = require('../controllers/ofertaController');

const { verifyToken, requireRole } = require('../controllers/authController');
const { validateCreateOferta, validateUpdateOferta } = require('../middleware/validators');

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS
// =============================================

// Listar ofertas con filtros
router.get('/', getOfertas);

// Obtener oferta específica
router.get('/:id', getOfertaById);

// Estadísticas generales
router.get('/stats/general', getOfertasStats);

// =============================================
// RUTAS PROTEGIDAS - POSTULANTES
// =============================================

// Verificar si puede postular a una oferta
router.get('/:id/can-apply', verifyToken, requireRole('postulante'), canApply);

// =============================================
// RUTAS PROTEGIDAS - EMPLEADORES
// =============================================

// Crear oferta
router.post('/', verifyToken, requireRole('empleador'), validateCreateOferta, createOferta);

// Obtener mis ofertas
router.get('/my/ofertas', verifyToken, requireRole('empleador'), getMyOfertas);

// Actualizar oferta
router.put('/:id', verifyToken, requireRole('empleador'), validateUpdateOferta, updateOferta);

// Cambiar estado de oferta
router.patch('/:id/status', verifyToken, requireRole('empleador'), changeOfertaStatus);

// =============================================
// RUTAS PROTEGIDAS - ADMINISTRADORES
// =============================================

// Obtener ofertas pendientes de aprobación
router.get('/admin/pending', verifyToken, requireRole('administrador'), getPendingOfertas);

// Aprobar/Rechazar oferta
router.patch('/:id/approve', verifyToken, requireRole('administrador'), approveOferta);

module.exports = router;