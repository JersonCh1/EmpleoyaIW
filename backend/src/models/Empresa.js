const { query } = require('../config/database');

class Empresa {
  constructor(empresaData) {
    this.id_empresa = empresaData.id_empresa;
    this.id_usuario = empresaData.id_usuario;
    this.nombre_empresa = empresaData.nombre_empresa;
    this.ruc = empresaData.ruc;
    this.descripcion = empresaData.descripcion;
    this.sector = empresaData.sector;
    this.ubicacion = empresaData.ubicacion;
    this.sitio_web = empresaData.sitio_web;
    this.logo_url = empresaData.logo_url;
    this.tamaño_empresa = empresaData.tamaño_empresa;
    this.telefono_empresa = empresaData.telefono_empresa;
    this.fecha_creacion = empresaData.fecha_creacion;
    this.fecha_actualizacion = empresaData.fecha_actualizacion;
    this.verificada = empresaData.verificada;
  }

  // Crear nueva empresa
  static async create(empresaData) {
    try {
      const sql = `
        INSERT INTO empresa (
          id_usuario, nombre_empresa, ruc, descripcion, sector, 
          ubicacion, sitio_web, tamaño_empresa, telefono_empresa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        empresaData.id_usuario,
        empresaData.nombre_empresa,
        empresaData.ruc || null,
        empresaData.descripcion || null,
        empresaData.sector || null,
        empresaData.ubicacion || null,
        empresaData.sitio_web || null,
        empresaData.tamaño_empresa || 'pyme',
        empresaData.telefono_empresa || null
      ];

      const result = await query(sql, params);
      return await Empresa.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando empresa: ${error.message}`);
    }
  }

  // Buscar empresa por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM empresa WHERE id_empresa = ?';
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Empresa(results[0]);
    } catch (error) {
      throw new Error(`Error buscando empresa por ID: ${error.message}`);
    }
  }

  // Buscar empresa por usuario
  static async findByUserId(userId) {
    try {
      const sql = 'SELECT * FROM empresa WHERE id_usuario = ?';
      const results = await query(sql, [userId]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Empresa(results[0]);
    } catch (error) {
      throw new Error(`Error buscando empresa por usuario: ${error.message}`);
    }
  }

  // Actualizar empresa
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE empresa SET ${fields} WHERE id_empresa = ?`;
      await query(sql, values);
      
      return await Empresa.findById(id);
    } catch (error) {
      throw new Error(`Error actualizando empresa: ${error.message}`);
    }
  }

  // Obtener todas las empresas con filtros
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      
      let sql = `
        SELECT e.*, u.nombre, u.apellido, u.email 
        FROM empresa e 
        JOIN usuario u ON e.id_usuario = u.id_usuario 
        WHERE u.activo = true
      `;
      let params = [];

      // Aplicar filtros
      if (filters.sector) {
        sql += ' AND e.sector = ?';
        params.push(filters.sector);
      }

      if (filters.ubicacion) {
        sql += ' AND e.ubicacion LIKE ?';
        params.push(`%${filters.ubicacion}%`);
      }

      if (filters.tamaño_empresa) {
        sql += ' AND e.tamaño_empresa = ?';
        params.push(filters.tamaño_empresa);
      }

      if (filters.verificada !== undefined) {
        sql += ' AND e.verificada = ?';
        params.push(filters.verificada);
      }

      if (filters.search) {
        sql += ' AND (e.nombre_empresa LIKE ? OR e.descripcion LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      sql += ' ORDER BY e.fecha_creacion DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      
      // Contar total
      let countSql = `
        SELECT COUNT(*) as total 
        FROM empresa e 
        JOIN usuario u ON e.id_usuario = u.id_usuario 
        WHERE u.activo = true
      `;
      let countParams = [];

      if (filters.sector) {
        countSql += ' AND e.sector = ?';
        countParams.push(filters.sector);
      }

      if (filters.ubicacion) {
        countSql += ' AND e.ubicacion LIKE ?';
        countParams.push(`%${filters.ubicacion}%`);
      }

      if (filters.tamaño_empresa) {
        countSql += ' AND e.tamaño_empresa = ?';
        countParams.push(filters.tamaño_empresa);
      }

      if (filters.verificada !== undefined) {
        countSql += ' AND e.verificada = ?';
        countParams.push(filters.verificada);
      }

      if (filters.search) {
        countSql += ' AND (e.nombre_empresa LIKE ? OR e.descripcion LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      return {
        empresas: results,
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo empresas: ${error.message}`);
    }
  }

  // Verificar si RUC ya existe
  static async rucExists(ruc, excludeId = null) {
    try {
      if (!ruc) return false;
      
      let sql = 'SELECT COUNT(*) as count FROM empresa WHERE ruc = ?';
      let params = [ruc];

      if (excludeId) {
        sql += ' AND id_empresa != ?';
        params.push(excludeId);
      }

      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      throw new Error(`Error verificando RUC: ${error.message}`);
    }
  }

  // Obtener estadísticas de la empresa
  static async getStats(empresaId) {
    try {
      const sql = `
        SELECT 
          COUNT(DISTINCT o.id_oferta) as total_ofertas,
          COUNT(DISTINCT CASE WHEN o.estado = 'activa' THEN o.id_oferta END) as ofertas_activas,
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones,
          COUNT(DISTINCT CASE WHEN p.estado = 'pendiente' THEN p.id_postulacion END) as postulaciones_pendientes
        FROM empresa e
        LEFT JOIN oferta_trabajo o ON e.id_empresa = o.id_empresa
        LEFT JOIN postulacion p ON o.id_oferta = p.id_oferta
        WHERE e.id_empresa = ?
      `;
      
      const results = await query(sql, [empresaId]);
      return results[0];
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error.message}`);
    }
  }
}

module.exports = Empresa;