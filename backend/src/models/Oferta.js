const { query } = require('../config/database');

class Oferta {
  constructor(ofertaData) {
    this.id_oferta = ofertaData.id_oferta;
    this.id_empresa = ofertaData.id_empresa;
    this.id_categoria = ofertaData.id_categoria;
    this.titulo = ofertaData.titulo;
    this.descripcion = ofertaData.descripcion;
    this.requisitos = ofertaData.requisitos;
    this.responsabilidades = ofertaData.responsabilidades;
    this.beneficios = ofertaData.beneficios;
    this.salario_min = ofertaData.salario_min;
    this.salario_max = ofertaData.salario_max;
    this.moneda = ofertaData.moneda;
    this.ubicacion = ofertaData.ubicacion;
    this.modalidad = ofertaData.modalidad;
    this.tipo_contrato = ofertaData.tipo_contrato;
    this.nivel_experiencia = ofertaData.nivel_experiencia;
    this.vacantes_disponibles = ofertaData.vacantes_disponibles;
    this.fecha_publicacion = ofertaData.fecha_publicacion;
    this.fecha_expiracion = ofertaData.fecha_expiracion;
    this.fecha_inicio_deseada = ofertaData.fecha_inicio_deseada;
    this.estado = ofertaData.estado;
    this.aprobada_admin = ofertaData.aprobada_admin;
    this.fecha_aprobacion = ofertaData.fecha_aprobacion;
    this.vistas = ofertaData.vistas;
    this.fecha_creacion = ofertaData.fecha_creacion;
    this.fecha_actualizacion = ofertaData.fecha_actualizacion;
  }

  // Crear nueva oferta
  static async create(ofertaData) {
    try {
      const sql = `
        INSERT INTO oferta_trabajo (
          id_empresa, id_categoria, titulo, descripcion, requisitos, 
          responsabilidades, beneficios, salario_min, salario_max, moneda,
          ubicacion, modalidad, tipo_contrato, nivel_experiencia, 
          vacantes_disponibles, fecha_expiracion, fecha_inicio_deseada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        ofertaData.id_empresa,
        ofertaData.id_categoria,
        ofertaData.titulo,
        ofertaData.descripcion,
        ofertaData.requisitos || null,
        ofertaData.responsabilidades || null,
        ofertaData.beneficios || null,
        ofertaData.salario_min || null,
        ofertaData.salario_max || null,
        ofertaData.moneda || 'PEN',
        ofertaData.ubicacion || null,
        ofertaData.modalidad,
        ofertaData.tipo_contrato,
        ofertaData.nivel_experiencia,
        ofertaData.vacantes_disponibles || 1,
        ofertaData.fecha_expiracion || null,
        ofertaData.fecha_inicio_deseada || null
      ];

      const result = await query(sql, params);
      return await Oferta.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando oferta: ${error.message}`);
    }
  }

  // Buscar oferta por ID con información completa
  static async findById(id) {
    try {
      const sql = `
        SELECT 
          o.*,
          e.nombre_empresa,
          e.logo_url,
          e.ubicacion as ubicacion_empresa,
          e.sitio_web,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones,
          COUNT(DISTINCT CASE WHEN p.estado = 'pendiente' THEN p.id_postulacion END) as postulaciones_pendientes
        FROM oferta_trabajo o
        JOIN empresa e ON o.id_empresa = e.id_empresa
        JOIN categoria c ON o.id_categoria = c.id_categoria
        LEFT JOIN postulacion p ON o.id_oferta = p.id_oferta
        WHERE o.id_oferta = ?
        GROUP BY o.id_oferta
      `;
      
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return results[0]; // Retornamos el objeto completo con joins
    } catch (error) {
      throw new Error(`Error buscando oferta por ID: ${error.message}`);
    }
  }

  // Buscar ofertas con filtros avanzados
  static async findWithFilters(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          o.*,
          e.nombre_empresa,
          e.logo_url,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones
        FROM oferta_trabajo o
        JOIN empresa e ON o.id_empresa = e.id_empresa
        JOIN categoria c ON o.id_categoria = c.id_categoria
        LEFT JOIN postulacion p ON o.id_oferta = p.id_oferta
        WHERE o.estado = 'activa' AND o.aprobada_admin = true
      `;
      let params = [];

      // Filtros de búsqueda
      if (filters.search) {
        sql += ' AND (o.titulo LIKE ? OR o.descripcion LIKE ? OR e.nombre_empresa LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.categoria) {
        sql += ' AND o.id_categoria = ?';
        params.push(filters.categoria);
      }

      if (filters.ubicacion) {
        sql += ' AND o.ubicacion LIKE ?';
        params.push(`%${filters.ubicacion}%`);
      }

      if (filters.modalidad) {
        if (Array.isArray(filters.modalidad)) {
          sql += ` AND o.modalidad IN (${filters.modalidad.map(() => '?').join(',')})`;
          params.push(...filters.modalidad);
        } else {
          sql += ' AND o.modalidad = ?';
          params.push(filters.modalidad);
        }
      }

      if (filters.tipo_contrato) {
        if (Array.isArray(filters.tipo_contrato)) {
          sql += ` AND o.tipo_contrato IN (${filters.tipo_contrato.map(() => '?').join(',')})`;
          params.push(...filters.tipo_contrato);
        } else {
          sql += ' AND o.tipo_contrato = ?';
          params.push(filters.tipo_contrato);
        }
      }

      if (filters.nivel_experiencia) {
        if (Array.isArray(filters.nivel_experiencia)) {
          sql += ` AND o.nivel_experiencia IN (${filters.nivel_experiencia.map(() => '?').join(',')})`;
          params.push(...filters.nivel_experiencia);
        } else {
          sql += ' AND o.nivel_experiencia = ?';
          params.push(filters.nivel_experiencia);
        }
      }

      // Filtros de salario
      if (filters.salario_min) {
        sql += ' AND (o.salario_min >= ? OR o.salario_min IS NULL)';
        params.push(filters.salario_min);
      }

      if (filters.salario_max) {
        sql += ' AND (o.salario_max <= ? OR o.salario_max IS NULL)';
        params.push(filters.salario_max);
      }

      // Filtro de fecha de publicación
      if (filters.dias_publicacion) {
        sql += ' AND o.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        params.push(filters.dias_publicacion);
      }

      // Filtro por empresa
      if (filters.empresa_id) {
        sql += ' AND o.id_empresa = ?';
        params.push(filters.empresa_id);
      }

      sql += ' GROUP BY o.id_oferta';

      // Ordenamiento
      if (filters.orden) {
        switch (filters.orden) {
          case 'fecha_desc':
            sql += ' ORDER BY o.fecha_publicacion DESC';
            break;
          case 'fecha_asc':
            sql += ' ORDER BY o.fecha_publicacion ASC';
            break;
          case 'salario_desc':
            sql += ' ORDER BY o.salario_max DESC, o.salario_min DESC';
            break;
          case 'salario_asc':
            sql += ' ORDER BY o.salario_min ASC, o.salario_max ASC';
            break;
          case 'relevancia':
            sql += ' ORDER BY o.vistas DESC, o.fecha_publicacion DESC';
            break;
          default:
            sql += ' ORDER BY o.fecha_publicacion DESC';
        }
      } else {
        sql += ' ORDER BY o.fecha_publicacion DESC';
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      
      // Contar total para paginación
      let countSql = `
        SELECT COUNT(DISTINCT o.id_oferta) as total
        FROM oferta_trabajo o
        JOIN empresa e ON o.id_empresa = e.id_empresa
        JOIN categoria c ON o.id_categoria = c.id_categoria
        WHERE o.estado = 'activa' AND o.aprobada_admin = true
      `;
      let countParams = [];

      // Aplicar los mismos filtros para el conteo
      if (filters.search) {
        countSql += ' AND (o.titulo LIKE ? OR o.descripcion LIKE ? OR e.nombre_empresa LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.categoria) {
        countSql += ' AND o.id_categoria = ?';
        countParams.push(filters.categoria);
      }

      if (filters.ubicacion) {
        countSql += ' AND o.ubicacion LIKE ?';
        countParams.push(`%${filters.ubicacion}%`);
      }

      if (filters.modalidad) {
        if (Array.isArray(filters.modalidad)) {
          countSql += ` AND o.modalidad IN (${filters.modalidad.map(() => '?').join(',')})`;
          countParams.push(...filters.modalidad);
        } else {
          countSql += ' AND o.modalidad = ?';
          countParams.push(filters.modalidad);
        }
      }

      if (filters.tipo_contrato) {
        if (Array.isArray(filters.tipo_contrato)) {
          countSql += ` AND o.tipo_contrato IN (${filters.tipo_contrato.map(() => '?').join(',')})`;
          countParams.push(...filters.tipo_contrato);
        } else {
          countSql += ' AND o.tipo_contrato = ?';
          countParams.push(filters.tipo_contrato);
        }
      }

      if (filters.nivel_experiencia) {
        if (Array.isArray(filters.nivel_experiencia)) {
          countSql += ` AND o.nivel_experiencia IN (${filters.nivel_experiencia.map(() => '?').join(',')})`;
          countParams.push(...filters.nivel_experiencia);
        } else {
          countSql += ' AND o.nivel_experiencia = ?';
          countParams.push(filters.nivel_experiencia);
        }
      }

      if (filters.salario_min) {
        countSql += ' AND (o.salario_min >= ? OR o.salario_min IS NULL)';
        countParams.push(filters.salario_min);
      }

      if (filters.salario_max) {
        countSql += ' AND (o.salario_max <= ? OR o.salario_max IS NULL)';
        countParams.push(filters.salario_max);
      }

      if (filters.dias_publicacion) {
        countSql += ' AND o.fecha_publicacion >= DATE_SUB(NOW(), INTERVAL ? DAY)';
        countParams.push(filters.dias_publicacion);
      }

      if (filters.empresa_id) {
        countSql += ' AND o.id_empresa = ?';
        countParams.push(filters.empresa_id);
      }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      return {
        ofertas: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        },
        filters_applied: filters
      };
    } catch (error) {
      throw new Error(`Error buscando ofertas: ${error.message}`);
    }
  }

  // Obtener ofertas de una empresa específica
  static async findByEmpresa(empresaId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const sql = `
        SELECT 
          o.*,
          c.nombre as categoria_nombre,
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones,
          COUNT(DISTINCT CASE WHEN p.estado = 'pendiente' THEN p.id_postulacion END) as postulaciones_pendientes
        FROM oferta_trabajo o
        JOIN categoria c ON o.id_categoria = c.id_categoria
        LEFT JOIN postulacion p ON o.id_oferta = p.id_oferta
        WHERE o.id_empresa = ?
        GROUP BY o.id_oferta
        ORDER BY o.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;
      
      const results = await query(sql, [empresaId, limit, offset]);
      
      // Contar total
      const countSql = 'SELECT COUNT(*) as total FROM oferta_trabajo WHERE id_empresa = ?';
      const countResult = await query(countSql, [empresaId]);
      const total = countResult[0].total;

      return {
        ofertas: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo ofertas de empresa: ${error.message}`);
    }
  }

  // Actualizar oferta
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE oferta_trabajo SET ${fields} WHERE id_oferta = ?`;
      await query(sql, values);
      
      return await Oferta.findById(id);
    } catch (error) {
      throw new Error(`Error actualizando oferta: ${error.message}`);
    }
  }

  // Cambiar estado de oferta
  static async changeStatus(id, newStatus) {
    try {
      const validStatuses = ['borrador', 'pendiente_aprobacion', 'activa', 'pausada', 'expirada', 'cerrada'];
      
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado inválido');
      }

      await Oferta.update(id, { estado: newStatus });
      
      return { 
        message: `Oferta cambiada a estado: ${newStatus}`,
        estado: newStatus
      };
    } catch (error) {
      throw new Error(`Error cambiando estado de oferta: ${error.message}`);
    }
  }

  // Aprobar/Rechazar oferta (solo admin)
  static async approve(id, approved = true) {
    try {
      const updateData = {
        aprobada_admin: approved,
        fecha_aprobacion: approved ? new Date() : null
      };

      if (approved) {
        updateData.estado = 'activa';
        updateData.fecha_publicacion = new Date();
      }

      await Oferta.update(id, updateData);
      
      return { 
        message: `Oferta ${approved ? 'aprobada' : 'rechazada'} correctamente`,
        aprobada: approved
      };
    } catch (error) {
      throw new Error(`Error ${approved ? 'aprobando' : 'rechazando'} oferta: ${error.message}`);
    }
  }

  // Incrementar contador de vistas
  static async incrementViews(id) {
    try {
      const sql = 'UPDATE oferta_trabajo SET vistas = vistas + 1 WHERE id_oferta = ?';
      await query(sql, [id]);
    } catch (error) {
      throw new Error(`Error incrementando vistas: ${error.message}`);
    }
  }

  // Verificar si usuario puede postular
  static async canUserApply(ofertaId, userId) {
    try {
      // Verificar si ya postuló
      const existingSql = `
        SELECT COUNT(*) as count 
        FROM postulacion p
        JOIN perfil_postulante pp ON p.id_postulante = pp.id_perfil
        WHERE p.id_oferta = ? AND pp.id_usuario = ?
      `;
      const existingResult = await query(existingSql, [ofertaId, userId]);
      
      if (existingResult[0].count > 0) {
        return { canApply: false, reason: 'Ya has postulado a esta oferta' };
      }

      // Verificar si la oferta está activa
      const oferta = await Oferta.findById(ofertaId);
      if (!oferta) {
        return { canApply: false, reason: 'Oferta no encontrada' };
      }

      if (oferta.estado !== 'activa' || !oferta.aprobada_admin) {
        return { canApply: false, reason: 'Oferta no está disponible' };
      }

      // Verificar si no expiró
      if (oferta.fecha_expiracion && new Date(oferta.fecha_expiracion) < new Date()) {
        return { canApply: false, reason: 'Oferta expirada' };
      }

      return { canApply: true };
    } catch (error) {
      throw new Error(`Error verificando si puede postular: ${error.message}`);
    }
  }

  // Obtener estadísticas de ofertas
  static async getGeneralStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_ofertas,
          COUNT(CASE WHEN estado = 'activa' AND aprobada_admin = true THEN 1 END) as ofertas_activas,
          COUNT(CASE WHEN estado = 'pendiente_aprobacion' THEN 1 END) as ofertas_pendientes,
          COUNT(CASE WHEN fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as ofertas_esta_semana,
          AVG(salario_min) as salario_promedio_min,
          AVG(salario_max) as salario_promedio_max,
          COUNT(DISTINCT id_empresa) as empresas_con_ofertas
        FROM oferta_trabajo
      `;
      
      const results = await query(sql);
      return results[0];
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas generales: ${error.message}`);
    }
  }
}

module.exports = Oferta;