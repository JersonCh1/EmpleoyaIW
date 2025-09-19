const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id_usuario = userData.id_usuario;
    this.email = userData.email;
    this.password = userData.password;
    this.nombre = userData.nombre;
    this.apellido = userData.apellido;
    this.telefono = userData.telefono;
    this.tipo_usuario = userData.tipo_usuario;
    this.fecha_registro = userData.fecha_registro;
    this.fecha_actualizacion = userData.fecha_actualizacion;
    this.activo = userData.activo;
    this.verificado = userData.verificado;
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      // Encriptar contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const sql = `
        INSERT INTO usuario (email, password, nombre, apellido, telefono, tipo_usuario)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        userData.email,
        hashedPassword,
        userData.nombre,
        userData.apellido,
        userData.telefono || null,
        userData.tipo_usuario
      ];

      const result = await query(sql, params);
      
      // Retornar el usuario creado sin la contraseña
      const newUser = await User.findById(result.insertId);
      delete newUser.password;
      
      return newUser;
    } catch (error) {
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM usuario WHERE id_usuario = ? AND activo = true';
      const results = await query(sql, [id]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new User(results[0]);
    } catch (error) {
      throw new Error(`Error buscando usuario por ID: ${error.message}`);
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM usuario WHERE email = ? AND activo = true';
      const results = await query(sql, [email]);
      
      if (results.length === 0) {
        return null;
      }
      
      return new User(results[0]);
    } catch (error) {
      throw new Error(`Error buscando usuario por email: ${error.message}`);
    }
  }

  // Verificar contraseña
  async validatePassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error(`Error validando contraseña: ${error.message}`);
    }
  }

  // Actualizar usuario
  static async update(id, updateData) {
    try {
      // Si se está actualizando la contraseña, encriptarla
      if (updateData.password) {
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(id);

      const sql = `UPDATE usuario SET ${fields} WHERE id_usuario = ?`;
      
      await query(sql, values);
      
      // Retornar usuario actualizado
      const updatedUser = await User.findById(id);
      delete updatedUser.password;
      
      return updatedUser;
    } catch (error) {
      throw new Error(`Error actualizando usuario: ${error.message}`);
    }
  }

  // Desactivar usuario (soft delete)
  static async delete(id) {
    try {
      const sql = 'UPDATE usuario SET activo = false WHERE id_usuario = ?';
      await query(sql, [id]);
      return { message: 'Usuario desactivado correctamente' };
    } catch (error) {
      throw new Error(`Error desactivando usuario: ${error.message}`);
    }
  }

  // Obtener todos los usuarios con paginación
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT id_usuario, email, nombre, apellido, telefono, tipo_usuario, fecha_registro, verificado, activo FROM usuario WHERE activo = true';
      let params = [];

      // Aplicar filtros
      if (filters.tipo_usuario) {
        sql += ' AND tipo_usuario = ?';
        params.push(filters.tipo_usuario);
      }

      if (filters.search) {
        sql += ' AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY fecha_registro DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = await query(sql, params);
      
      // Contar total de registros para paginación
      let countSql = 'SELECT COUNT(*) as total FROM usuario WHERE activo = true';
      let countParams = [];

      if (filters.tipo_usuario) {
        countSql += ' AND tipo_usuario = ?';
        countParams.push(filters.tipo_usuario);
      }

      if (filters.search) {
        countSql += ' AND (nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      return {
        users: results.map(user => new User(user)),
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }
  }

  // Verificar si el email ya existe
  static async emailExists(email, excludeId = null) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM usuario WHERE email = ? AND activo = true';
      let params = [email];

      if (excludeId) {
        sql += ' AND id_usuario != ?';
        params.push(excludeId);
      }

      const result = await query(sql, params);
      return result[0].count > 0;
    } catch (error) {
      throw new Error(`Error verificando email: ${error.message}`);
    }
  }

  // Método para retornar datos sin contraseña
  toJSON() {
    const userData = { ...this };
    delete userData.password;
    return userData;
  }
}

module.exports = User;