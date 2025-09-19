const { validationResult } = require('express-validator');
const Empresa = require('../models/Empresa');

// Crear perfil de empresa
const createEmpresa = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    // Verificar que el usuario sea tipo empleador
    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los empleadores pueden crear empresas'
      });
    }

    // Verificar si ya tiene empresa
    const existingEmpresa = await Empresa.findByUserId(req.user.id_usuario);
    if (existingEmpresa) {
      return res.status(409).json({
        error: 'Empresa ya existe',
        message: 'Ya tienes un perfil de empresa creado'
      });
    }

    // Verificar RUC único si se proporciona
    if (req.body.ruc) {
      const rucExists = await Empresa.rucExists(req.body.ruc);
      if (rucExists) {
        return res.status(409).json({
          error: 'RUC ya registrado',
          message: 'Ya existe una empresa con este RUC'
        });
      }
    }

    const empresaData = {
      id_usuario: req.user.id_usuario,
      ...req.body
    };

    const empresa = await Empresa.create(empresaData);

    res.status(201).json({
      message: 'Empresa creada exitosamente',
      empresa
    });

  } catch (error) {
    console.error('Error creando empresa:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la empresa'
    });
  }
};

// Obtener empresa del usuario actual
const getMyEmpresa = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo los empleadores pueden acceder a esta información'
      });
    }

    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    
    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa no encontrada',
        message: 'No tienes un perfil de empresa creado'
      });
    }

    // Obtener estadísticas
    const stats = await Empresa.getStats(empresa.id_empresa);

    res.json({
      empresa,
      estadisticas: stats
    });

  } catch (error) {
    console.error('Error obteniendo empresa:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener empresa por ID (público)
const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = await Empresa.findById(id);
    
    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }

    // Información pública de la empresa
    const empresaPublica = {
      id_empresa: empresa.id_empresa,
      nombre_empresa: empresa.nombre_empresa,
      descripcion: empresa.descripcion,
      sector: empresa.sector,
      ubicacion: empresa.ubicacion,
      sitio_web: empresa.sitio_web,
      logo_url: empresa.logo_url,
      tamaño_empresa: empresa.tamaño_empresa,
      verificada: empresa.verificada
    };

    res.json({
      empresa: empresaPublica
    });

  } catch (error) {
    console.error('Error obteniendo empresa:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar empresa
const updateEmpresa = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errors.array()
      });
    }

    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }

    // Verificar RUC único si se está actualizando
    if (req.body.ruc && req.body.ruc !== empresa.ruc) {
      const rucExists = await Empresa.rucExists(req.body.ruc, empresa.id_empresa);
      if (rucExists) {
        return res.status(409).json({
          error: 'RUC ya registrado',
          message: 'Ya existe otra empresa con este RUC'
        });
      }
    }

    // No permitir actualizar ciertos campos
    delete req.body.id_empresa;
    delete req.body.id_usuario;
    delete req.body.verificada;

    const updatedEmpresa = await Empresa.update(empresa.id_empresa, req.body);

    res.json({
      message: 'Empresa actualizada exitosamente',
      empresa: updatedEmpresa
    });

  } catch (error) {
    console.error('Error actualizando empresa:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Listar empresas públicas con filtros
const listEmpresas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filters = {
      sector: req.query.sector,
      ubicacion: req.query.ubicacion,
      tamaño_empresa: req.query.tamaño,
      verificada: req.query.verificada === 'true',
      search: req.query.search
    };

    // Remover filtros vacíos
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const result = await Empresa.findAll(page, limit, filters);

    // Filtrar información sensible
    const empresasPublicas = result.empresas.map(empresa => ({
      id_empresa: empresa.id_empresa,
      nombre_empresa: empresa.nombre_empresa,
      descripcion: empresa.descripcion,
      sector: empresa.sector,
      ubicacion: empresa.ubicacion,
      sitio_web: empresa.sitio_web,
      logo_url: empresa.logo_url,
      tamaño_empresa: empresa.tamaño_empresa,
      verificada: empresa.verificada,
      fecha_creacion: empresa.fecha_creacion
    }));

    res.json({
      empresas: empresasPublicas,
      pagination: result.pagination,
      filtros_aplicados: filters
    });

  } catch (error) {
    console.error('Error listando empresas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de empresa (solo propietario)
const getEmpresaStats = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'empleador') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const empresa = await Empresa.findByUserId(req.user.id_usuario);
    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa no encontrada'
      });
    }

    const stats = await Empresa.getStats(empresa.id_empresa);

    res.json({
      estadisticas: stats,
      empresa_id: empresa.id_empresa,
      nombre_empresa: empresa.nombre_empresa
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createEmpresa,
  getMyEmpresa,
  getEmpresaById,
  updateEmpresa,
  listEmpresas,
  getEmpresaStats
};