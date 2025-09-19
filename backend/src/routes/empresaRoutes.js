const express = require('express');
const {
  createEmpresa,
  getMyEmpresa,
  getEmpresaById,
  updateEmpresa,
  listEmpresas,
  getEmpresaStats
} = require('../controllers/empresaController');

const { verifyToken, requireRole } = require('../controllers/authController');
const { validateCreateEmpresa, validateUpdateEmpresa } = require('../middleware/validators');

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS
// =============================================

// Listar empresas (público)
router.get('/', listEmpresas);

// Obtener empresa por ID (público)
router.get('/:id', getEmpresaById);

// =============================================
// RUTAS PROTEGIDAS - EMPLEADORES
// =============================================

// Crear empresa (solo empleadores)
router.post('/', verifyToken, requireRole('empleador'), validateCreateEmpresa, createEmpresa);

// Obtener mi empresa
router.get('/my/profile', verifyToken, requireRole('empleador'), getMyEmpresa);

// Actualizar mi empresa
router.put('/my/profile', verifyToken, requireRole('empleador'), validateUpdateEmpresa, updateEmpresa);

// Obtener estadísticas de mi empresa
router.get('/my/stats', verifyToken, requireRole('empleador'), getEmpresaStats);

module.exports = router;