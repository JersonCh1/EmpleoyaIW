const express = require('express');
const {
  register,
  login,
  verifyToken,
  getProfile,
  updateProfile,
  requireRole
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} = require('../middleware/validators');

const router = express.Router();

// =============================================
// RUTAS PÚBLICAS (sin autenticación)
// =============================================

// Registro de usuario
router.post('/register', validateRegister, register);

// Login de usuario
router.post('/login', validateLogin, login);

// =============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================

// Obtener perfil del usuario actual
router.get('/profile', verifyToken, getProfile);

// Actualizar perfil del usuario actual
router.put('/profile', verifyToken, validateUpdateProfile, updateProfile);

// =============================================
// RUTAS DE PRUEBA POR ROL
// =============================================

// Ruta solo para postulantes
router.get('/test/postulante', verifyToken, requireRole('postulante'), (req, res) => {
  res.json({
    message: 'Acceso autorizado para postulante',
    user: req.user.nombre,
    role: req.user.tipo_usuario
  });
});

// Ruta solo para empleadores
router.get('/test/empleador', verifyToken, requireRole('empleador'), (req, res) => {
  res.json({
    message: 'Acceso autorizado para empleador',
    user: req.user.nombre,
    role: req.user.tipo_usuario
  });
});

// Ruta solo para administradores
router.get('/test/admin', verifyToken, requireRole('administrador'), (req, res) => {
  res.json({
    message: 'Acceso autorizado para administrador',
    user: req.user.nombre,
    role: req.user.tipo_usuario
  });
});

// Ruta para múltiples roles
router.get('/test/empleador-admin', verifyToken, requireRole('empleador', 'administrador'), (req, res) => {
  res.json({
    message: 'Acceso autorizado para empleador o administrador',
    user: req.user.nombre,
    role: req.user.tipo_usuario
  });
});

module.exports = router;