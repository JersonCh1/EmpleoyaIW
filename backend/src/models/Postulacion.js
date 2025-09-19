const { query } = require('../config/database');

class Postulacion {
  constructor(postulacionData) {
    this.id_postulacion = postulacionData.id_postulacion;
    this.id_oferta = postulacionData.id_oferta;
    this.id_postulante = postulacionData.id_postulante;
    this.fecha_postulacion = postulacionData.fecha_postulacion;
    this.estado = postulacionData.estado;
    this.carta_presentacion = postulacionData.carta_presentacion;
    this.cv_url_postulacion = postulacionData.cv_url_postulacion;
    this.fecha_cambio_estado = postulacionData.fecha_cambio_estado;
    this.notas_empleador = postulacionData.notas_empleador;
    this.puntuacion_match = postulacionData.puntuacion_match;
  }

  // Crear nueva postulación
  static async create(postulacionData) {
    try {
      const sql = `
        INSERT INTO postulacion (
          id_oferta, id_postulante, carta_presentacion, cv_url_postulacion, puntuacion_match
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        postulacionData.id_oferta,
        postulacionData.id_postulante,
        postulacionData.carta_presentacion || null,
        postulacionData.cv_url_postulacion || null,
        postulacionData.puntuacion_match || null
      ];

      const result = await query(sql, params);
      return await Postulacion.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya has postulado a esta oferta');
      }
      throw new Error(`Error creando postulación: ${error.message}`);
    }
  }

  // Buscar postulación por ID con información completa
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          p.*,
          o.titulo as oferta_titulo,
          o.ubicacion as oferta_ubicacion,
          o.modalidad as oferta_modalidad,
          o.salario_min,
          o.salario_max,
          o.estado as oferta_estado,
          e.nombre_empresa,
          e.logo_url as empresa_logo,
          c.nombre as categoria_nombre,
          pp.titulo_profesional,
          u.nombre as postulante_nombre,
          u.apellido as postulante_apellido,
          u.email as postulante_email,
          u.telefono as postulante_telefono
        FROM postulacion p
        JOIN oferta_trabajo o ON p.id_oferta = o.id_oferta
        JOIN empresa e ON o.id_empresa = e.id_empresa
        JOIN categoria c ON o.id_categoria = c.id_categoria
        JOIN perfil_postulante pp ON p.id_postulante = pp.id_perfil
        JOIN usuario u ON pp.id_usuario = u.id_usuario
        WHERE p.id_postulacion = ?
      `;
      
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return results[0]; // Retornamos el objeto completo con joins
    } catch (error) {
      throw new Error(`Error buscando postulación por ID: ${error.message}`);
    }
  }

  // Obtener postulaciones de una oferta específica
  static async findByOferta(ofertaId, filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          p.*,
          pp.titulo_profesional,
          pp.nivel_experiencia,
          pp.salario_esperado,
          u.nombre as postulante_nombre,
          u.apellido as postulante_apellido,
          u.email as postulante_email,
          u.telefono as postulante_telefono
        FROM postulacion p
        JOIN perfil_postulante pp ON p.id_postulante = pp.id_perfil
        JOIN usuario u ON pp.id_usuario = u.id_usuario
        WHERE p.id_oferta = ?
      `;
      let params = [ofertaId];

      // Filtros por estado
      if (filters.estado) {
        if (Array.isArray(filters.estado)) {
          sql += ` AND p.estado IN (${filters.estado.map(() => '?').join(',')})`;
          params.push(...filters.estado);
        } else {
          sql += ' AND p.estado = ?';
          params.push(filters.estado);
        }
      }

      // Filtro por puntuación de match
      if (filters.puntuacion_min) {
        sql += ' AND p.puntuacion_match >= ?';
        params.push(filters.puntuacion_min);
      }

      // Filtro por fecha
      if (filters.fecha_desde) {
        sql += ' AND p.fecha_postulacion >= ?';
        params.push(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        sql += ' AND p.fecha_postulacion <= ?';
        params.push(filters.fecha_hasta);
      }

      // Ordenamiento
      switch (filters.orden) {
        case 'fecha_desc':
          sql += ' ORDER BY p.fecha_postulacion DESC';
          break;
        case 'fecha_asc':
          sql += ' ORDER BY p.fecha_postulacion ASC';
          break;
        case 'puntuacion_desc':
          sql += ' ORDER BY p.puntuacion_match DESC, p.fecha_postulacion DESC';
          break;
        case 'nombre':
          sql += ' ORDER BY u.nombre ASC, u.apellido ASC';
          break;
        default:
          sql += ' ORDER BY p.fecha_postulacion DESC';
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      
      // Contar total
      let countSql = `
        SELECT COUNT(*) as total
        FROM postulacion p
        JOIN perfil_postulante pp ON p.id_postulante = pp.id_perfil
        JOIN usuario u ON pp.id_usuario = u.id_usuario
        WHERE p.id_oferta = ?
      `;
      let countParams = [ofertaId];

      if (filters.estado) {
        if (Array.isArray(filters.estado)) {
          countSql += ` AND p.estado IN (${filters.estado.map(() => '?').join(',')})`;
          countParams.push(...filters.estado);
        } else {
          countSql += ' AND p.estado = ?';
          countParams.push(filters.estado);
        }
      }

      if (filters.puntuacion_min) {
        countSql += ' AND p.puntuacion_match >= ?';
        countParams.push(filters.puntuacion_min);
      }

      if (filters.fecha_desde) {
        countSql += ' AND p.fecha_postulacion >= ?';
        countParams.push(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        countSql += ' AND p.fecha_postulacion <= ?';
        countParams.push(filters.fecha_hasta);
      }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      return {
        postulaciones: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo postulaciones de oferta: ${error.message}`);
    }
  }

  // Obtener postulaciones de un postulante específico
  static async findByPostulante(postulanteId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const sql = `
        SELECT 
          p.*,
          o.titulo as oferta_titulo,
          o.ubicacion as oferta_ubicacion,
          o.modalidad as oferta_modalidad,
          o.salario_min,
          o.salario_max,
          o.estado as oferta_estado,
          e.nombre_empresa,
          e.logo_url as empresa_logo,
          c.nombre as categoria_nombre
        FROM postulacion p
        JOIN oferta_trabajo o ON p.id_oferta = o.id_oferta
        JOIN empresa e ON o.id_empresa = e.id_empresa
        JOIN categoria c ON o.id_categoria = c.id_categoria
        WHERE p.id_postulante = ?
        ORDER BY p.fecha_postulacion DESC
        LIMIT ? OFFSET ?
      `;
      
      const results = await query(sql, [postulanteId, limit, offset]);
      
      // Contar total
      const countSql = 'SELECT COUNT(*) as total FROM postulacion WHERE id_postulante = ?';
      const countResult = await query(countSql, [postulanteId]);
      const total = countResult[0].total;

      return {
        postulaciones: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo postulaciones de postulante: ${error.message}`);
    }
  }

  // Cambiar estado de postulación
  static async changeStatus(id, newStatus, notas = null) {
    try {
      const validStatuses = ['pendiente', 'en_revision', 'preseleccionado', 'entrevista', 'rechazado', 'aceptado'];
      
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado inválido');
      }

      const updateData = {
        estado: newStatus,
        fecha_cambio_estado: new Date()
      };

      if (notas) {
        updateData.notas_empleador = notas;
      }

      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE postulacion SET ${fields} WHERE id_postulacion = ?`;
      await query(sql, values);
      
      return { 
        message: `Postulación cambiada a estado: ${newStatus}`,
        estado: newStatus
      };
    } catch (error) {
      throw new Error(`Error cambiando estado de postulación: ${error.message}`);
    }
  }

  // Actualizar notas del empleador
  static async updateNotes(id, notas) {
    try {
      const sql = 'UPDATE postulacion SET notas_empleador = ? WHERE id_postulacion = ?';
      await query(sql, [notas, id]);
      
      return { message: 'Notas actualizadas correctamente' };
    } catch (error) {
      throw new Error(`Error actualizando notas: ${error.message}`);
    }
  }

  // Calcular y actualizar puntuación de match
  static async calculateMatchScore(postulacionId, factores = {}) {
    try {
      // Obtener información completa de la postulación
      const postulacion = await Postulacion.findById(postulacionId);
      if (!postulacion) {
        throw new Error('Postulación no encontrada');
      }

      let score = 0;
      let maxScore = 100;

      // Factor experiencia (30%)
      const expRequerida = postulacion.nivel_experiencia || 'junior';
      const expPostulante = postulacion.nivel_experiencia || 'sin_experiencia';
      
      const experiencePoints = {
        'sin_experiencia': 0,
        'junior': 25,
        'semi_senior': 50,
        'senior': 75,
        'lead': 100
      };

      const requiredExp = experiencePoints[expRequerida] || 25;
      const candidateExp = experiencePoints[expPostulante] || 0;
      
      if (candidateExp >= requiredExp) {
        score += 30;
      } else {
        score += (candidateExp / requiredExp) * 30;
      }

      // Factor salario (20%)
      if (postulacion.salario_esperado && postulacion.salario_max) {
        if (postulacion.salario_esperado <= postulacion.salario_max) {
          score += 20;
        } else {
          score += Math.max(0, 20 - ((postulacion.salario_esperado - postulacion.salario_max) / postulacion.salario_max * 100));
        }
      } else {
        score += 10; // Puntuación parcial si no hay datos completos
      }

      // Factor ubicación/modalidad (15%)
      if (postulacion.oferta_modalidad === 'remoto') {
        score += 15; // Remoto siempre coincide
      } else {
        score += 10; // Asumimos compatibilidad parcial
      }

      // Factores adicionales del CV y perfil (35%)
      score += 25; // Placeholder - aquí se analizaría el CV y perfil completo

      // Asegurar que el score esté entre 0 y 100
      score = Math.min(100, Math.max(0, Math.round(score)));

      // Actualizar en la base de datos
      const sql = 'UPDATE postulacion SET puntuacion_match = ? WHERE id_postulacion = ?';
      await query(sql, [score, postulacionId]);

      return { puntuacion: score, message: 'Puntuación de match calculada' };
    } catch (error) {
      throw new Error(`Error calculando puntuación de match: ${error.message}`);
    }
  }

  // Obtener estadísticas de postulaciones por oferta
  static async getOfertaStats(ofertaId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_postulaciones,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
          COUNT(CASE WHEN estado = 'preseleccionado' THEN 1 END) as preseleccionados,
          COUNT(CASE WHEN estado = 'entrevista' THEN 1 END) as en_entrevista,
          COUNT(CASE WHEN estado = 'aceptado' THEN 1 END) as aceptados,
          COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) as rechazados,
          AVG(puntuacion_match) as puntuacion_promedio,
          MAX(puntuacion_match) as mejor_puntuacion
        FROM postulacion
        WHERE id_oferta = ?
      `;
      
      const results = await query(sql, [ofertaId]);
      return results[0];
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas de oferta: ${error.message}`);
    }
  }

  // Obtener estadísticas generales de postulaciones
  static async getGeneralStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_postulaciones,
          COUNT(CASE WHEN estado = 'aceptado' THEN 1 END) as contrataciones_exitosas,
          COUNT(CASE WHEN fecha_postulacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as postulaciones_esta_semana,
          COUNT(CASE WHEN fecha_postulacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as postulaciones_este_mes,
          AVG(puntuacion_match) as puntuacion_promedio_general,
          COUNT(DISTINCT id_postulante) as postulantes_activos,
          COUNT(DISTINCT id_oferta) as ofertas_con_postulaciones
        FROM postulacion
      `;
      
      const results = await query(sql);
      
      // Calcular tasa de conversión
      const stats = results[0];
      stats.tasa_conversion = stats.total_postulaciones > 0 
        ? (stats.contrataciones_exitosas / stats.total_postulaciones * 100).toFixed(2)
        : 0;

      return stats;
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas generales: ${error.message}`);
    }
  }

  // Verificar si ya existe postulación
  static async exists(ofertaId, postulanteId) {
    try {
      const sql = 'SELECT COUNT(*) as count FROM postulacion WHERE id_oferta = ? AND id_postulante = ?';
      const result = await query(sql, [ofertaId, postulanteId]);
      return result[0].count > 0;
    } catch (error) {
      throw new Error(`Error verificando existencia de postulación: ${error.message}`);
    }
  }

  // Eliminar postulación (soft delete cambiando estado)
  static async withdraw(id) {
    try {
      await Postulacion.changeStatus(id, 'rechazado', 'Postulación retirada por el candidato');
      return { message: 'Postulación retirada correctamente' };
    } catch (error) {
      throw new Error(`Error retirando postulación: ${error.message}`);
    }
  }
}

module.exports = Postulacion;