const { validationResult } = require('express-validator');
const PerfilPostulante = require('../models/PerfilPostulante');

// Crear perfil de postulante
const createPerfil = async (req, res) => {
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
        message: 'Solo los postulantes pueden crear este perfil'
      });
    }

    // Verificar si ya tiene perfil
    const existingPerfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    if (existingPerfil) {
      return res.status(409).json({
        error: 'Perfil ya existe',
        message: 'Ya tienes un perfil de postulante creado'
      });
    }

    const perfilData = {
      id_usuario: req.user.id_usuario,
      ...req.body
    };

    const perfil = await PerfilPostulante.create(perfilData);

    res.status(201).json({
      message: 'Perfil creado exitosamente',
      perfil
    });

  } catch (error) {
    console.error('Error creando perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el perfil'
    });
  }
};

// Obtener mi perfil (postulante)
const getMyPerfil = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const perfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'No tienes un perfil de postulante creado'
      });
    }

    // Obtener estadísticas
    const stats = await PerfilPostulante.getStats(perfil.id_perfil);
    
    // Verificar completitud del perfil
    const completitud = await PerfilPostulante.isComplete(perfil.id_perfil);

    res.json({
      perfil,
      estadisticas: stats,
      completitud
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener perfil por ID (público para empleadores)
const getPerfilById = async (req, res) => {
  try {
    const { id } = req.params;

    const perfil = await PerfilPostulante.findById(id);
    
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado'
      });
    }

    // Información pública del postulante
    const perfilPublico = {
      id_perfil: perfil.id_perfil,
      titulo_profesional: perfil.titulo_profesional,
      descripcion: perfil.descripcion,
      ubicacion: perfil.ubicacion,
      nivel_experiencia: perfil.nivel_experiencia,
      modalidad_preferida: perfil.modalidad_preferida,
      disponibilidad_inmediata: perfil.disponibilidad_inmediata,
      // Solo mostrar rango salarial general si lo autoriza
      rango_salarial: perfil.salario_esperado ? `${Math.floor(perfil.salario_esperado / 1000)}k+` : null,
      nombre: perfil.nombre,
      apellido: perfil.apellido
    };

    res.json({
      perfil: perfilPublico
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar mi perfil
const updatePerfil = async (req, res) => {
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
        error: 'Acceso denegado'
      });
    }

    const perfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado',
        message: 'Debes crear tu perfil primero'
      });
    }

    // No permitir actualizar ciertos campos
    delete req.body.id_perfil;
    delete req.body.id_usuario;
    delete req.body.cv_url; // Se actualiza por separado
    delete req.body.fecha_subida_cv;

    const updatedPerfil = await PerfilPostulante.update(perfil.id_perfil, req.body);

    res.json({
      message: 'Perfil actualizado exitosamente',
      perfil: updatedPerfil
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Buscar postulantes con filtros (empleadores)
// Buscar postulantes con filtros (empleadores)
const searchPostulantes = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'empleador' && req.user.tipo_usuario !== 'administrador') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo empleadores y administradores pueden buscar postulantes'
      });
    }

    // Importar la conexión de base de datos
    const db = require('../config/database');
    
    const { search, ubicacion, nivel_experiencia, modalidad_preferida } = req.query;
    
    // Query base simplificada
    let sql = `
      SELECT 
        p.id_perfil,
        p.titulo_profesional,
        p.descripcion,
        p.ubicacion,
        p.nivel_experiencia,
        p.modalidad_preferida,
        p.salario_esperado,
        p.disponibilidad_inmediata,
        u.nombre,
        u.apellido,
        u.email,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad
      FROM perfil_postulante p
      JOIN usuario u ON p.id_usuario = u.id_usuario
      WHERE u.activo = true AND u.tipo_usuario = 'postulante'
    `;
    
    const params = [];
    
    // Filtro de búsqueda de texto
    if (search && search.trim() !== '') {
      sql += ` AND (
        p.titulo_profesional LIKE ? OR 
        p.descripcion LIKE ? OR 
        u.nombre LIKE ? OR 
        u.apellido LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Filtro de ubicación
    if (ubicacion && ubicacion.trim() !== '') {
      sql += ` AND p.ubicacion LIKE ?`;
      params.push(`%${ubicacion.trim()}%`);
    }
    
    // Filtro de nivel de experiencia
    if (nivel_experiencia && nivel_experiencia.trim() !== '') {
      sql += ` AND p.nivel_experiencia = ?`;
      params.push(nivel_experiencia.trim());
    }
    
    // Filtro de modalidad preferida
    if (modalidad_preferida && modalidad_preferida.trim() !== '') {
      sql += ` AND p.modalidad_preferida = ?`;
      params.push(modalidad_preferida.trim());
    }
    
    // Ordenar por relevancia
    sql += ` ORDER BY p.fecha_actualizacion DESC LIMIT 50`;
    
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    // Ejecutar la consulta
    const results = await db.query(sql, params);
    
    // Filtrar información sensible para la búsqueda
    const postulantesPublicos = results.map(postulante => ({
      id_perfil: postulante.id_perfil,
      titulo_profesional: postulante.titulo_profesional,
      descripcion: postulante.descripcion,
      ubicacion: postulante.ubicacion,
      nivel_experiencia: postulante.nivel_experiencia,
      modalidad_preferida: postulante.modalidad_preferida,
      disponibilidad_inmediata: postulante.disponibilidad_inmediata,
      rango_salarial: postulante.salario_esperado ? `${Math.floor(postulante.salario_esperado / 1000)}k+` : null,
      edad: postulante.edad,
      nombre: postulante.nombre,
      apellido: postulante.apellido,
      total_experiencias: 0, // Por ahora
      habilidades: [] // Por ahora
    }));

    res.json({
      success: true,
      message: `Se encontraron ${postulantesPublicos.length} postulantes`,
      postulantes: postulantesPublicos,
      pagination: {
        page: 1,
        limit: 50,
        total: postulantesPublicos.length,
        totalPages: 1
      },
      filtros_aplicados: {
        search: search || null,
        ubicacion: ubicacion || null,
        nivel_experiencia: nivel_experiencia || null,
        modalidad_preferida: modalidad_preferida || null
      }
    });

  } catch (error) {
    console.error('Error buscando postulantes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error buscando postulantes',
      message: error.message
    });
  }
};

// Subir/actualizar CV
const updateCV = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const perfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado'
      });
    }

    const { cv_url } = req.body;

    if (!cv_url) {
      return res.status(400).json({
        error: 'URL del CV requerida'
      });
    }

    const result = await PerfilPostulante.updateCV(perfil.id_perfil, cv_url);

    res.json(result);

  } catch (error) {
    console.error('Error actualizando CV:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de mi perfil
const getMyStats = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const perfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado'
      });
    }

    const stats = await PerfilPostulante.getStats(perfil.id_perfil);
    const completitud = await PerfilPostulante.isComplete(perfil.id_perfil);

    res.json({
      estadisticas: stats,
      completitud,
      perfil_id: perfil.id_perfil
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

// Verificar completitud del perfil
const checkCompletitud = async (req, res) => {
  try {
    if (req.user.tipo_usuario !== 'postulante') {
      return res.status(403).json({
        error: 'Acceso denegado'
      });
    }

    const perfil = await PerfilPostulante.findByUserId(req.user.id_usuario);
    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil no encontrado'
      });
    }

    const completitud = await PerfilPostulante.isComplete(perfil.id_perfil);

    res.json(completitud);

  } catch (error) {
    console.error('Error verificando completitud:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  createPerfil,
  getMyPerfil,
  getPerfilById,
  updatePerfil,
  searchPostulantes,
  updateCV,
  getMyStats,
  checkCompletitud
};