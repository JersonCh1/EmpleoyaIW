const { validationResult } = require('express-validator');
const Postulacion = require('../models/Postulacion');
const Oferta = require('../models/Oferta');
const { query } = require('../config/database');

// Crear nueva postulación
const createPostulacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los postulantes pueden postular a ofertas'
      });
    }

    const { id_oferta } = req.body;

    // Obtener perfil del postulante
    const perfilSql = 'SELECT * FROM perfil_postulante WHERE id_usuario = ?';
    const perfilResult = await query(perfilSql, [req.user.id_usuario]);
    
    if (perfilResult.length === 0) {
      return res.status(400).json({
        error: 'Perfil requerido',
        message: 'Debes completar tu perfil de postulante primero'
      });
    }

    const perfil = perfilResult[0];

    // Verificar si puede postular
    const canApply = await Oferta.canUserApply(id_oferta, req.user.id_usuario);
    if (!canApply.canApply) {
      return res.status(400).json({
        error: 'No se puede postular',
        message: canApply.reason
      });
    }

    const postulacionData = {
      id_oferta,
      id_postulante: perfil.id_perfil,
      carta_presentacion: req.body.carta_presentacion,
      cv_url_postulacion: req.body.cv_url_postulacion || perfil.cv_url
    };

    const postulacion = await Postulacion.create(postulacionData);

    // Calcular puntuación de match automáticamente
    await Postulacion.calculateMatchScore(postulacion.id_postulacion);

    const postulacionCompleta = await Postulacion.findById(postulacion.id_postulacion);

    res.status(201).json({
      message: 'Postulación enviada exitosamente',
      postulacion: postulacionCompleta
    });

  } catch (error) {
    console.error('Error creando postulación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener mis postulaciones (postulante)
const getMyPostulaciones = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // Obtener perfil del postulante
    const perfilSql = 'SELECT * FROM perfil_postulante WHERE id_usuario = ?';
    const perfilResult = await query(perfilSql, [req.user.id_usuario]);
    
    if (perfilResult.length === 0) {
      return res.status(400).json({
        error: 'Perfil no encontrado'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Postulacion.findByPostulante(perfilResult[0].id_perfil, page, limit);

    res.json({
      postulaciones: result.postulaciones,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error obteniendo postulaciones:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener postulaciones de una oferta (empleador)
const getPostulacionesByOferta = async (req, res) => {
  try {
    const { id_oferta } = req.params;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // Verificar que la oferta pertenezca al empleador
    const oferta = await Oferta.findById(id_oferta);
    if (!oferta) {
      return res.status(404).json({
        error: 'Oferta no encontrada'
      });
    }

    // Verificar propiedad a través de la empresa
    const empresaSql = 'SELECT * FROM empresa WHERE id_usuario = ?';
    const empresaResult = await query(empresaSql, [req.user.id_usuario]);
    
    if (empresaResult.length === 0 || empresaResult[0].id_empresa !== oferta.id_empresa) {
      return res.status(403).json({
        error: 'No tienes acceso a esta oferta'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {
      estado: req.query.estado ? req.query.estado.split(',') : undefined,
      puntuacion_min: req.query.puntuacion_min ? parseInt(req.query.puntuacion_min) : undefined,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      orden: req.query.orden || 'fecha_desc'
    };

    // Remover filtros vacíos
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const result = await Postulacion.findByOferta(id_oferta, filters, page, limit);

    res.json({
      postulaciones: result.postulaciones,
      pagination: result.pagination,
      filtros_aplicados: filters
    });

  } catch (error) {
    console.error('Error obteniendo postulaciones de oferta:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener postulación específica
const getPostulacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const postulacion = await Postulacion.findById(id);
    if (!postulacion) {
      return res.status(404).json({
        error: 'Postulación no encontrada'
      });
    }

    // Verificar acceso según tipo de usuario
    if (req.user.tipo_usuario === 'postulante') {
      // Verificar que sea su postulación
      const perfilSql = 'SELECT * FROM perfil_postulante WHERE id_usuario = ?';
      const perfilResult = await query(perfilSql, [req.user.id_usuario]);
      
      if (perfilResult.length === 0 || perfilResult[0].id_perfil !== postulacion.id_postulante) {
        return res.status(403).json({
          error: 'Acceso denegado'
        });
      }
    } else if (req.user.tipo_usuario === 'empleador') {
      // Verificar que sea de su empresa
      const empresaSql = 'SELECT * FROM empresa WHERE id_usuario = ?';
      const empresaResult = await query(empresaSql, [req.user.id_usuario]);
      
      if (empresaResult.length === 0) {
        return res.status(403).json({
          error: 'Acceso denegado'
        });
      }

      const oferta = await Oferta.findById(postulacion.id_oferta);
      if (!oferta || oferta.id_empresa !== empresaResult[0].id_empresa) {
        return res.status(403).json({
          error: 'Acceso denegado'
        });
      }
    } else if (req.user.tipo_usuario !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    res.json({
      postulacion
    });

  } catch (error) {
    console.error('Error obteniendo postulación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Cambiar estado de postulación (empleador)
const changePostulacionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const postulacion = await Postulacion.findById(id);
    if (!postulacion) {
      return res.status(404).json({
        error: 'Postulación no encontrada'
      });
    }

    // Verificar propiedad
    const empresaSql = 'SELECT * FROM empresa WHERE id_usuario = ?';
    const empresaResult = await query(empresaSql, [req.user.id_usuario]);
    
    if (empresaResult.length === 0) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const oferta = await Oferta.findById(postulacion.id_oferta);
    if (!oferta || oferta.id_empresa !== empresaResult[0].id_empresa) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const result = await Postulacion.changeStatus(id, estado, notas);

    res.json(result);

  } catch (error) {
    console.error('Error cambiando estado de postulación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Actualizar notas del empleador
const updatePostulacionNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas } = req.body;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const postulacion = await Postulacion.findById(id);
    if (!postulacion) {
      return res.status(404).json({
        error: 'Postulación no encontrada'
      });
    }

    // Verificar propiedad
    const empresaSql = 'SELECT * FROM empresa WHERE id_usuario = ?';
    const empresaResult = await query(empresaSql, [req.user.id_usuario]);
    
    if (empresaResult.length === 0) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const oferta = await Oferta.findById(postulacion.id_oferta);
    if (!oferta || oferta.id_empresa !== empresaResult[0].id_empresa) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const result = await Postulacion.updateNotes(id, notas);

    res.json(result);

  } catch (error) {
    console.error('Error actualizando notas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Retirar postulación (postulante)
const withdrawPostulacion = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const postulacion = await Postulacion.findById(id);
    if (!postulacion) {
      return res.status(404).json({
        error: 'Postulación no encontrada'
      });
    }

    // Verificar propiedad
    const perfilSql = 'SELECT * FROM perfil_postulante WHERE id_usuario = ?';
    const perfilResult = await query(perfilSql, [req.user.id_usuario]);
    
    if (perfilResult.length === 0 || perfilResult[0].id_perfil !== postulacion.id_postulante) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // No permitir retirar si ya está en proceso avanzado
    if (['entrevista', 'aceptado'].includes(postulacion.estado)) {
      return res.status(400).json({
        error: 'No se puede retirar',
        message: 'La postulación está en un estado avanzado'
      });
    }

    const result = await Postulacion.withdraw(id);

    res.json(result);

  } catch (error) {
    console.error('Error retirando postulación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de postulaciones por oferta
const getPostulacionesStats = async (req, res) => {
  try {
    const { id_oferta } = req.params;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // Verificar propiedad
    const oferta = await Oferta.findById(id_oferta);
    if (!oferta) {
      return res.status(404).json({
        error: 'Oferta no encontrada'
      });
    }

    const empresaSql = 'SELECT * FROM empresa WHERE id_usuario = ?';
    const empresaResult = await query(empresaSql, [req.user.id_usuario]);
    
    if (empresaResult.length === 0 || empresaResult[0].id_empresa !== oferta.id_empresa) {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const stats = await Postulacion.getOfertaStats(id_oferta);

    res.json({
      estadisticas: stats,
      oferta_titulo: oferta.titulo
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas generales de postulaciones (admin)
const getGeneralStats = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const stats = await Postulacion.getGeneralStats();

    res.json({
      estadisticas: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createPostulacion,
  getMyPostulaciones,
  getPostulacionesByOferta,
  getPostulacionById,
  changePostulacionStatus,
  updatePostulacionNotes,
  withdrawPostulacion,
  getPostulacionesStats,
  getGeneralStats
};