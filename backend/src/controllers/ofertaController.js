const { validationResult } = require('express-validator');
const Oferta = require('../models/Oferta');
const Empresa = require('../models/Empresa');
const Categoria = require('../models/Categoria');

// Crear nueva oferta
const createOferta = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    // Verificar que el usuario sea empleador
    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los empleadores pueden crear ofertas'
      });
    }

    // Verificar que tenga empresa creada
    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(400).json({
        error: 'Empresa requerida',
        message: 'Debes crear tu perfil de empresa primero'
      });
    }

    // Verificar que la categoría existe
    const categoria = await Categoria.findById(req.body.id_categoria);
    if (!categoria || !categoria.activa) {
      return res.status(400).json({
        error: 'Categoría inválida',
        message: 'La categoría seleccionada no existe o no está activa'
      });
    }

    const ofertaData = {
      id_empresa: empresa.id_empresa,
      ...req.body
    };

    const oferta = await Oferta.create(ofertaData);

    res.status(201).json({
      message: 'Oferta creada exitosamente',
      oferta
    });

  } catch (error) {
    console.error('Error creando oferta:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la oferta'
    });
  }
};

// Obtener ofertas con filtros avanzados (público)
const getOfertas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Construir filtros desde query parameters
    const filters = {
      search: req.query.search,
      categoria: req.query.categoria,
      ubicacion: req.query.ubicacion,
      modalidad: req.query.modalidad ? req.query.modalidad.split(',') : undefined,
      tipo_contrato: req.query.tipo_contrato ? req.query.tipo_contrato.split(',') : undefined,
      nivel_experiencia: req.query.nivel_experiencia ? req.query.nivel_experiencia.split(',') : undefined,
      salario_min: req.query.salario_min ? parseInt(req.query.salario_min) : undefined,
      salario_max: req.query.salario_max ? parseInt(req.query.salario_max) : undefined,
      dias_publicacion: req.query.dias ? parseInt(req.query.dias) : undefined,
      orden: req.query.orden || 'fecha_desc'
    };

    // Remover filtros vacíos
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '' || 
          (Array.isArray(filters[key]) && filters[key].length === 0)) {
        delete filters[key];
      }
    });

    const result = await Oferta.findWithFilters(filters, page, limit);

    res.json({
      ofertas: result.ofertas,
      pagination: result.pagination,
      filtros_aplicados: result.filters_applied
    });

  } catch (error) {
    console.error('Error obteniendo ofertas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener oferta específica por ID
const getOfertaById = async (req, res) => {
  try {
    const { id } = req.params;

    const oferta = await Oferta.findById(id);
    
    if (!oferta) {
      return res.status(404).json({
        error: 'Oferta no encontrada'
      });
    }

    // Solo mostrar ofertas activas y aprobadas al público
    if (oferta.estado !== 'activa' || !oferta.aprobada_admin) {
      // Permitir al dueño ver sus propias ofertas
      if (!req.user || req.user.tipo_usuario !== 'empleador') {
        return res.status(404).json({
          error: 'Oferta no disponible'
        });
      }

      const empresa = await Empresa.findByUserId(req.user.id_usuario);
      if (!empresa || empresa.id_empresa !== oferta.id_empresa) {
        return res.status(404).json({
          error: 'Oferta no disponible'
        });
      }
    }

    // Incrementar contador de vistas si no es el dueño
    if (!req.user || req.user.tipo_usuario !== 'empleador') {
      await Oferta.incrementViews(id);
    }

    res.json({
      oferta
    });

  } catch (error) {
    console.error('Error obteniendo oferta:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener mis ofertas (empleador)
const getMyOfertas = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(400).json({
        error: 'Empresa requerida'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Oferta.findByEmpresa(empresa.id_empresa, page, limit);

    res.json({
      ofertas: result.ofertas,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error obteniendo mis ofertas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar oferta
const updateOferta = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    const { id } = req.params;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // Verificar propiedad de la oferta
    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(400).json({
        error: 'Empresa requerida'
      });
    }

    const oferta = await Oferta.findById(id);
    if (!oferta || oferta.id_empresa !== empresa.id_empresa) {
      return res.status(404).json({
        error: 'Oferta no encontrada'
      });
    }

    // No permitir actualizar ciertos campos
    delete req.body.id_oferta;
    delete req.body.id_empresa;
    delete req.body.aprobada_admin;
    delete req.body.fecha_aprobacion;
    delete req.body.vistas;

    // Si se actualiza una oferta aprobada, cambiar estado a pendiente
    if (oferta.aprobada_admin && oferta.estado === 'activa') {
      req.body.estado = 'pendiente_aprobacion';
      req.body.aprobada_admin = false;
    }

    const updatedOferta = await Oferta.update(id, req.body);

    res.json({
      message: 'Oferta actualizada exitosamente',
      oferta: updatedOferta
    });

  } catch (error) {
    console.error('Error actualizando oferta:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Cambiar estado de oferta
const changeOfertaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    // Verificar propiedad
    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(400).json({
        error: 'Empresa requerida'
      });
    }

    const oferta = await Oferta.findById(id);
    if (!oferta || oferta.id_empresa !== empresa.id_empresa) {
      return res.status(404).json({
        error: 'Oferta no encontrada'
      });
    }

    const result = await Oferta.changeStatus(id, estado);

    res.json(result);

  } catch (error) {
    console.error('Error cambiando estado:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Aprobar/Rechazar oferta (solo admin)
const approveOferta = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (req.user.tipo_usuario !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los administradores pueden aprobar ofertas'
      });
    }

    const result = await Oferta.approve(id, approved);

    res.json(result);

  } catch (error) {
    console.error('Error aprobando oferta:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

// Obtener ofertas pendientes de aprobación (admin)
const getPendingOfertas = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filters = {
      estado: 'pendiente_aprobacion'
    };

    const result = await Oferta.findWithFilters(filters, page, limit);

    res.json({
      ofertas: result.ofertas,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error obteniendo ofertas pendientes:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas generales de ofertas
const getOfertasStats = async (req, res) => {
  try {
    const stats = await Oferta.getGeneralStats();

    res.json({
      estadisticas: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Verificar si usuario puede postular
const canApply = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los postulantes pueden postular a ofertas'
      });
    }

    const result = await Oferta.canUserApply(id, req.user.id_usuario);

    res.json(result);

  } catch (error) {
    console.error('Error verificando postulación:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
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
};