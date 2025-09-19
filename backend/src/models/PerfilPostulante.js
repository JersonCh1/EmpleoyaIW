const { query } = require('../config/database');

class PerfilPostulante {
  constructor(perfilData) {
    this.id_perfil = perfilData.id_perfil;
    this.id_usuario = perfilData.id_usuario;
    this.titulo_profesional = perfilData.titulo_profesional;
    this.descripcion = perfilData.descripcion;
    this.ubicacion = perfilData.ubicacion;
    this.fecha_nacimiento = perfilData.fecha_nacimiento;
    this.nivel_experiencia = perfilData.nivel_experiencia;
    this.salario_esperado = perfilData.salario_esperado;
    this.cv_url = perfilData.cv_url;
    this.fecha_subida_cv = perfilData.fecha_subida_cv;
    this.disponibilidad_inmediata = perfilData.disponibilidad_inmediata;
    this.modalidad_preferida = perfilData.modalidad_preferida;
    this.fecha_creacion = perfilData.fecha_creacion;
    this.fecha_actualizacion = perfilData.fecha_actualizacion;
  }

  // Crear perfil de postulante
  static async create(perfilData) {
    try {
      const sql = `
        INSERT INTO perfil_postulante (
          id_usuario, titulo_profesional, descripcion, ubicacion, 
          fecha_nacimiento, nivel_experiencia, salario_esperado, 
          disponibilidad_inmediata, modalidad_preferida
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        perfilData.id_usuario,
        perfilData.titulo_profesional || null,
        perfilData.descripcion || null,
        perfilData.ubicacion || null,
        perfilData.fecha_nacimiento || null,
        perfilData.nivel_experiencia || 'sin_experiencia',
        perfilData.salario_esperado || null,
        perfilData.disponibilidad_inmediata !== false,
        perfilData.modalidad_preferida || 'hibrido'
      ];

      const result = await query(sql, params);
      return await PerfilPostulante.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando perfil: ${error.message}`);
    }
  }

  // Buscar perfil por ID
  static async findById(id) {
    try {
      const sql = `
        SELECT p.*, u.nombre, u.apellido, u.email, u.telefono
        FROM perfil_postulante p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_perfil = ?
      `;
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return results[0]; // Retornamos el objeto completo con datos del usuario
    } catch (error) {
      throw new Error(`Error buscando perfil por ID: ${error.message}`);
    }
  }

  // Buscar perfil por usuario
  static async findByUserId(userId) {
    try {
      const sql = `
        SELECT p.*, u.nombre, u.apellido, u.email, u.telefono
        FROM perfil_postulante p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario = ?
      `;
      const results = await query(sql, [userId]);
      
      if (results.length === 0) {
        return null;
      }
      
      return results[0];
    } catch (error) {
      throw new Error(`Error buscando perfil por usuario: ${error.message}`);
    }
  }

  // Actualizar perfil
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE perfil_postulante SET ${fields} WHERE id_perfil = ?`;
      await query(sql, values);
      
      return await PerfilPostulante.findById(id);
    } catch (error) {
      throw new Error(`Error actualizando perfil: ${error.message}`);
    }
  }

  // Actualizar CV
  static async updateCV(perfilId, cvUrl) {
    try {
      const sql = `
        UPDATE perfil_postulante 
        SET cv_url = ?, fecha_subida_cv = NOW() 
        WHERE id_perfil = ?
      `;
      await query(sql, [cvUrl, perfilId]);
      
      return { message: 'CV actualizado correctamente', cv_url: cvUrl };
    } catch (error) {
      throw new Error(`Error actualizando CV: ${error.message}`);
    }
  }

  // Buscar postulantes con filtros avanzados
  static async findWithFilters(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT 
          p.*,
          u.nombre,
          u.apellido,
          u.email,
          TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) as edad,
          COUNT(DISTINCT exp.id_experiencia) as total_experiencias,
          GROUP_CONCAT(DISTINCT h.nombre) as habilidades
        FROM perfil_postulante p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        LEFT JOIN experiencia_laboral exp ON p.id_perfil = exp.id_postulante
        LEFT JOIN postulante_habilidad ph ON p.id_perfil = ph.id_postulante
        LEFT JOIN habilidad h ON ph.id_habilidad = h.id_habilidad
        WHERE u.activo = true
      `;
      let params = [];

      // Filtros de búsqueda
      if (filters.ubicacion) {
        sql += ' AND p.ubicacion LIKE ?';
        params.push(`%${filters.ubicacion}%`);
      }

      if (filters.nivel_experiencia) {
        if (Array.isArray(filters.nivel_experiencia)) {
          sql += ` AND p.nivel_experiencia IN (${filters.nivel_experiencia.map(() => '?').join(',')})`;
          params.push(...filters.nivel_experiencia);
        } else {
          sql += ' AND p.nivel_experiencia = ?';
          params.push(filters.nivel_experiencia);
        }
      }

      if (filters.modalidad_preferida) {
        if (Array.isArray(filters.modalidad_preferida)) {
          sql += ` AND p.modalidad_preferida IN (${filters.modalidad_preferida.map(() => '?').join(',')})`;
          params.push(...filters.modalidad_preferida);
        } else {
          sql += ' AND p.modalidad_preferida = ?';
          params.push(filters.modalidad_preferida);
        }
      }

      if (filters.salario_min) {
        sql += ' AND p.salario_esperado >= ?';
        params.push(filters.salario_min);
      }

      if (filters.salario_max) {
        sql += ' AND p.salario_esperado <= ?';
        params.push(filters.salario_max);
      }

      if (filters.edad_min) {
        sql += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= ?';
        params.push(filters.edad_min);
      }

      if (filters.edad_max) {
        sql += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) <= ?';
        params.push(filters.edad_max);
      }

      if (filters.disponibilidad_inmediata !== undefined) {
        sql += ' AND p.disponibilidad_inmediata = ?';
        params.push(filters.disponibilidad_inmediata);
      }

      if (filters.search) {
        sql += ' AND (p.titulo_profesional LIKE ? OR p.descripcion LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.habilidades && filters.habilidades.length > 0) {
        sql += ` AND h.nombre IN (${filters.habilidades.map(() => '?').join(',')})`;
        params.push(...filters.habilidades);
      }

      sql += ' GROUP BY p.id_perfil';

      // Ordenamiento
      switch (filters.orden) {
        case 'experiencia_desc':
          sql += ' ORDER BY p.nivel_experiencia DESC';
          break;
        case 'salario_desc':
          sql += ' ORDER BY p.salario_esperado DESC';
          break;
        case 'salario_asc':
          sql += ' ORDER BY p.salario_esperado ASC';
          break;
        case 'edad_desc':
          sql += ' ORDER BY edad DESC';
          break;
        case 'edad_asc':
          sql += ' ORDER BY edad ASC';
          break;
        case 'nombre':
          sql += ' ORDER BY u.nombre ASC, u.apellido ASC';
          break;
        default:
          sql += ' ORDER BY p.fecha_actualizacion DESC';
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      
      // Contar total para paginación
      let countSql = `
        SELECT COUNT(DISTINCT p.id_perfil) as total
        FROM perfil_postulante p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        LEFT JOIN postulante_habilidad ph ON p.id_perfil = ph.id_postulante
        LEFT JOIN habilidad h ON ph.id_habilidad = h.id_habilidad
        WHERE u.activo = true
      `;
      let countParams = [];

      // Aplicar los mismos filtros para el conteo (sin GROUP BY)
      if (filters.ubicacion) {
        countSql += ' AND p.ubicacion LIKE ?';
        countParams.push(`%${filters.ubicacion}%`);
      }

      if (filters.nivel_experiencia) {
        if (Array.isArray(filters.nivel_experiencia)) {
          countSql += ` AND p.nivel_experiencia IN (${filters.nivel_experiencia.map(() => '?').join(',')})`;
          countParams.push(...filters.nivel_experiencia);
        } else {
          countSql += ' AND p.nivel_experiencia = ?';
          countParams.push(filters.nivel_experiencia);
        }
      }

      if (filters.modalidad_preferida) {
        if (Array.isArray(filters.modalidad_preferida)) {
          countSql += ` AND p.modalidad_preferida IN (${filters.modalidad_preferida.map(() => '?').join(',')})`;
          countParams.push(...filters.modalidad_preferida);
        } else {
          countSql += ' AND p.modalidad_preferida = ?';
          countParams.push(filters.modalidad_preferida);
        }
      }

      if (filters.salario_min) {
        countSql += ' AND p.salario_esperado >= ?';
        countParams.push(filters.salario_min);
      }

      if (filters.salario_max) {
        countSql += ' AND p.salario_esperado <= ?';
        countParams.push(filters.salario_max);
      }

      if (filters.edad_min) {
        countSql += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) >= ?';
        countParams.push(filters.edad_min);
      }

      if (filters.edad_max) {
        countSql += ' AND TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) <= ?';
        countParams.push(filters.edad_max);
      }

      if (filters.disponibilidad_inmediata !== undefined) {
        countSql += ' AND p.disponibilidad_inmediata = ?';
        countParams.push(filters.disponibilidad_inmediata);
      }

      if (filters.search) {
        countSql += ' AND (p.titulo_profesional LIKE ? OR p.descripcion LIKE ? OR u.nombre LIKE ? OR u.apellido LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.habilidades && filters.habilidades.length > 0) {
        countSql += ` AND h.nombre IN (${filters.habilidades.map(() => '?').join(',')})`;
        countParams.push(...filters.habilidades);
      }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      return {
        postulantes: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        },
        filtros_aplicados: filters
      };
    } catch (error) {
      throw new Error(`Error buscando postulantes: ${error.message}`);
    }
  }

  // Obtener estadísticas del postulante
  static async getStats(perfilId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones,
          COUNT(DISTINCT CASE WHEN p.estado = 'pendiente' THEN p.id_postulacion END) as postulaciones_pendientes,
          COUNT(DISTINCT CASE WHEN p.estado = 'en_revision' THEN p.id_postulacion END) as en_revision,
          COUNT(DISTINCT CASE WHEN p.estado = 'preseleccionado' THEN p.id_postulacion END) as preseleccionados,
          COUNT(DISTINCT CASE WHEN p.estado = 'entrevista' THEN p.id_postulacion END) as entrevistas,
          COUNT(DISTINCT CASE WHEN p.estado = 'aceptado' THEN p.id_postulacion END) as aceptados,
          COUNT(DISTINCT CASE WHEN p.estado = 'rechazado' THEN p.id_postulacion END) as rechazados,
          AVG(p.puntuacion_match) as puntuacion_promedio
        FROM perfil_postulante pp
        LEFT JOIN postulacion p ON pp.id_perfil = p.id_postulante
        WHERE pp.id_perfil = ?
      `;
      
      const results = await query(sql, [perfilId]);
      return results[0];
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }

  // Verificar si el perfil está completo
  static async isComplete(perfilId) {
    try {
      const perfil = await PerfilPostulante.findById(perfilId);
      if (!perfil) return false;

      const requiredFields = [
        'titulo_profesional',
        'descripcion',
        'ubicacion',
        'nivel_experiencia'
      ];

      const isComplete = requiredFields.every(field => 
        perfil[field] && perfil[field].toString().trim() !== ''
      );

      return {
        completo: isComplete,
        campos_faltantes: requiredFields.filter(field => 
          !perfil[field] || perfil[field].toString().trim() === ''
        )
      };
    } catch (error) {
      throw new Error(`Error verificando completitud del perfil: ${error.message}`);
    }
  }
}

module.exports = PerfilPostulante;