const { query } = require('../config/database');

class Categoria {
  constructor(categoriaData) {
    this.id_categoria = categoriaData.id_categoria;
    this.nombre = categoriaData.nombre;
    this.descripcion = categoriaData.descripcion;
    this.icono = categoriaData.icono;
    this.activa = categoriaData.activa;
    this.orden_display = categoriaData.orden_display;
    this.fecha_creacion = categoriaData.fecha_creacion;
  }

  // Crear nueva categoría
  static async create(categoriaData) {
    try {
      const sql = `
        INSERT INTO categoria (nombre, descripcion, icono, orden_display)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        categoriaData.nombre,
        categoriaData.descripcion || null,
        categoriaData.icono || null,
        categoriaData.orden_display || 0
      ];

      const result = await query(sql, params);
      return await Categoria.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creando categoría: ${error.message}`);
    }
  }

  // Buscar categoría por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM categoria WHERE id_categoria = ?';
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Categoria(results[0]);
    } catch (error) {
      throw new Error(`Error buscando categoría por ID: ${error.message}`);
    }
  }

  // Buscar categoría por nombre
  static async findByName(nombre) {
    try {
      const sql = 'SELECT * FROM categoria WHERE nombre = ?';
      const results = await query(sql, [nombre]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new Categoria(results[0]);
    } catch (error) {
      throw new Error(`Error buscando categoría por nombre: ${error.message}`);
    }
  }

  // Obtener todas las categorías activas
  static async findAll(includeInactive = false) {
    try {
      let sql = 'SELECT * FROM categoria';
      
      if (!includeInactive) {
        sql += ' WHERE activa = true';
      }
      
      sql += ' ORDER BY orden_display ASC, nombre ASC';
      
      const results = await query(sql);
      return results.map(categoria => new Categoria(categoria));
    } catch (error) {
      throw new Error(`Error obteniendo categorías: ${error.message}`);
    }
  }

  // Obtener categorías con conteo de ofertas
  static async findAllWithCounts() {
    try {
      const sql = `
        SELECT 
          c.*,
          COUNT(o.id_oferta) as total_ofertas,
          COUNT(CASE WHEN o.estado = 'activa' AND o.aprobada_admin = true THEN 1 END) as ofertas_activas
        FROM categoria c
        LEFT JOIN oferta_trabajo o ON c.id_categoria = o.id_categoria
        WHERE c.activa = true
        GROUP BY c.id_categoria
        ORDER BY c.orden_display ASC, c.nombre ASC
      `;
      
      const results = await query(sql);
      return results;
    } catch (error) {
      throw new Error(`Error obteniendo categorías con conteos: ${error.message}`);
    }
  }

  // Actualizar categoría
  static async update(id, updateData) {
    try {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE categoria SET ${fields} WHERE id_categoria = ?`;
      await query(sql, values);
      
      return await Categoria.findById(id);
    } catch (error) {
      throw new Error(`Error actualizando categoría: ${error.message}`);
    }
  }

  // Activar/Desactivar categoría
  static async toggleActive(id) {
    try {
      const categoria = await Categoria.findById(id);
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      const newStatus = !categoria.activa;
      await Categoria.update(id, { activa: newStatus });
      
      return { 
        message: `Categoría ${newStatus ? 'activada' : 'desactivada'} correctamente`,
        activa: newStatus
      };
    } catch (error) {
      throw new Error(`Error cambiando estado de categoría: ${error.message}`);
    }
  }

  // Eliminar categoría (solo si no tiene ofertas asociadas)
  static async delete(id) {
    try {
      // Verificar si tiene ofertas asociadas
      const countSql = 'SELECT COUNT(*) as count FROM oferta_trabajo WHERE id_categoria = ?';
      const countResult = await query(countSql, [id]);
      
      if (countResult[0].count > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene ofertas asociadas');
      }

      const sql = 'DELETE FROM categoria WHERE id_categoria = ?';
      await query(sql, [id]);
      
      return { message: 'Categoría eliminada correctamente' };
    } catch (error) {
      throw new Error(`Error eliminando categoría: ${error.message}`);
    }
  }

  // Verificar si el nombre ya existe
  static async nameExists(nombre, excludeId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM categoria WHERE nombre = ?';
      let params = [nombre];

      if (excludeId) {
        sql += ' AND id_categoria != ?';
        params.push(excludeId);
      }

      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      throw new Error(`Error verificando nombre de categoría: ${error.message}`);
    }
  }

  // Reordenar categorías
  static async reorder(categoriaIds) {
    try {
      const queries = categoriaIds.map((id, index) => ({
        sql: 'UPDATE categoria SET orden_display = ? WHERE id_categoria = ?',
        params: [index + 1, id]
      }));

      const { transaction } = require('../config/database');
      await transaction(queries);
      
      return { message: 'Categorías reordenadas correctamente' };
    } catch (error) {
      throw new Error(`Error reordenando categorías: ${error.message}`);
    }
  }

  // Obtener estadísticas de una categoría
  static async getStats(categoriaId) {
    try {
      const sql = `
        SELECT 
          COUNT(o.id_oferta) as total_ofertas,
          COUNT(CASE WHEN o.estado = 'activa' THEN 1 END) as ofertas_activas,
          COUNT(CASE WHEN o.estado = 'pausada' THEN 1 END) as ofertas_pausadas,
          COUNT(CASE WHEN o.estado = 'cerrada' THEN 1 END) as ofertas_cerradas,
          COUNT(DISTINCT p.id_postulacion) as total_postulaciones,
          AVG(o.salario_min) as salario_promedio_min,
          AVG(o.salario_max) as salario_promedio_max
        FROM categoria c
        LEFT JOIN oferta_trabajo o ON c.id_categoria = o.id_categoria
        LEFT JOIN postulacion p ON o.id_oferta = p.id_oferta
        WHERE c.id_categoria = ?
      `;
      
      const results = await query(sql, [categoriaId]);
      return results[0];
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas de categoría: ${error.message}`);
    }
  }

  // Inicializar categorías por defecto
  static async initializeDefault() {
    try {
      const defaultCategories = [
        { nombre: 'Tecnología', descripcion: 'Empleos en desarrollo de software, IT y tecnología', icono: 'code', orden: 1 },
        { nombre: 'Marketing', descripcion: 'Posiciones en marketing digital, publicidad y comunicaciones', icono: 'megaphone', orden: 2 },
        { nombre: 'Ventas', descripcion: 'Oportunidades en ventas, atención al cliente y comercio', icono: 'trending-up', orden: 3 },
        { nombre: 'Diseño', descripcion: 'Trabajos en diseño gráfico, UX/UI y creatividad', icono: 'palette', orden: 4 },
        { nombre: 'Finanzas', descripcion: 'Empleos en contabilidad, finanzas y administración', icono: 'dollar-sign', orden: 5 },
        { nombre: 'Recursos Humanos', descripcion: 'Posiciones en RRHH, reclutamiento y gestión de personal', icono: 'users', orden: 6 },
        { nombre: 'Educación', descripcion: 'Oportunidades en enseñanza, capacitación y educación', icono: 'book', orden: 7 },
        { nombre: 'Salud', descripcion: 'Empleos en medicina, enfermería y ciencias de la salud', icono: 'heart', orden: 8 },
        { nombre: 'Ingeniería', descripcion: 'Trabajos en ingeniería civil, industrial y otras especialidades', icono: 'settings', orden: 9 },
        { nombre: 'Logística', descripcion: 'Posiciones en supply chain, logística y operaciones', icono: 'truck', orden: 10 }
      ];

      for (const cat of defaultCategories) {
        const exists = await Categoria.nameExists(cat.nombre);
        if (!exists) {
          await Categoria.create({
            nombre: cat.nombre,
            descripcion: cat.descripcion,
            icono: cat.icono,
            orden_display: cat.orden
          });
        }
      }

      return { message: 'Categorías por defecto inicializadas correctamente' };
    } catch (error) {
      throw new Error(`Error inicializando categorías por defecto: ${error.message}`);
    }
  }
}

module.exports = Categoria;