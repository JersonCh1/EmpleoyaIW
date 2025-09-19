const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generar JWT Token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { 
      id: userId, 
      tipo_usuario: userType 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Registro de usuario
const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { email, password, nombre, apellido, telefono, tipo_usuario } = req.body;

    // Verificar si el email ya existe
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        error: 'Email ya registrado',
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Crear nuevo usuario
    const userData = {
      email,
      password,
      nombre,
      apellido,
      telefono,
      tipo_usuario: tipo_usuario || 'postulante'
    };

    const newUser = await User.create(userData);

    // Generar token
    const token = generateToken(newUser.id_usuario, newUser.tipo_usuario);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id_usuario,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        tipo_usuario: newUser.tipo_usuario,
        fecha_registro: newUser.fecha_registro
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return res.status(403).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta soporte.'
      });
    }

    // Generar token
    const token = generateToken(user.id_usuario, user.tipo_usuario);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario,
        verificado: user.verificado
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el login'
    });
  }
};

// Verificar token (middleware)
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token requerido',
        message: 'Se requiere token de autenticación'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario actual
      const user = await User.findById(decoded.id);
      if (!user || !user.activo) {
        return res.status(401).json({
          error: 'Usuario no válido',
          message: 'Token asociado a usuario inválido'
        });
      }

      // Agregar usuario a la request
      req.user = user;
      next();

    } catch (jwtError) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autenticación inválido o expirado'
      });
    }

  } catch (error) {
    console.error('Error verificando token:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario actual
const getProfile = async (req, res) => {
  try {
    const user = req.user; // Viene del middleware verifyToken

    res.json({
      user: {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        tipo_usuario: user.tipo_usuario,
        verificado: user.verificado,
        fecha_registro: user.fecha_registro
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const userId = req.user.id_usuario;
    const updateData = req.body;

    // No permitir actualizar campos críticos
    delete updateData.id_usuario;
    delete updateData.tipo_usuario;
    delete updateData.fecha_registro;
    delete updateData.activo;

    // Verificar email único si se está actualizando
    if (updateData.email) {
      const emailExists = await User.emailExists(updateData.email, userId);
      if (emailExists) {
        return res.status(409).json({
          error: 'Email ya registrado',
          message: 'Ya existe otra cuenta con este email'
        });
      }
    }

    const updatedUser = await User.update(userId, updateData);

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar roles
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Se requiere autenticación'
      });
    }

    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere rol: ${allowedRoles.join(' o ')}`
      });
    }

    next();
  };
};

module.exports = {
  register,
  login,
  verifyToken,
  getProfile,
  updateProfile,
  requireRole
};