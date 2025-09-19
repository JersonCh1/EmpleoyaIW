const { body } = require('express-validator');

// Validaciones para registro de usuario
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email debe tener máximo 100 caracteres'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula y un número'),

  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('telefono')
    .optional()
    .isMobilePhone('es-PE')
    .withMessage('Debe ser un número de teléfono válido de Perú')
    .isLength({ max: 20 })
    .withMessage('Teléfono debe tener máximo 20 caracteres'),

  body('tipo_usuario')
    .optional()
    .isIn(['postulante', 'empleador'])
    .withMessage('Tipo de usuario debe ser: postulante o empleador')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 1 })
    .withMessage('La contraseña no puede estar vacía')
];

// Validaciones para actualizar perfil
const validateUpdateProfile = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email debe tener máximo 100 caracteres'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('telefono')
    .optional()
    .isMobilePhone('es-PE')
    .withMessage('Debe ser un número de teléfono válido de Perú')
    .isLength({ max: 20 })
    .withMessage('Teléfono debe tener máximo 20 caracteres'),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos: una mayúscula, una minúscula y un número')
];

// Validaciones para crear empresa
const validateCreateEmpresa = [
  body('nombre_empresa')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre de empresa debe tener entre 2 y 100 caracteres'),

  body('ruc')
    .optional()
    .isLength({ min: 11, max: 11 })
    .withMessage('El RUC debe tener 11 dígitos')
    .isNumeric()
    .withMessage('El RUC debe contener solo números'),

  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción debe tener máximo 1000 caracteres'),

  body('sector')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El sector debe tener máximo 50 caracteres'),

  body('ubicacion')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación debe tener máximo 100 caracteres'),

  body('sitio_web')
    .optional()
    .isURL()
    .withMessage('Debe ser una URL válida'),

  body('tamaño_empresa')
    .optional()
    .isIn(['startup', 'pyme', 'mediana', 'corporativo'])
    .withMessage('Tamaño de empresa inválido'),

  body('telefono_empresa')
    .optional()
    .isMobilePhone('es-PE')
    .withMessage('Debe ser un número de teléfono válido de Perú')
];

// Validaciones para crear oferta
const validateCreateOferta = [
  body('id_categoria')
    .isInt({ min: 1 })
    .withMessage('Categoría requerida'),

  body('titulo')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('El título debe tener entre 5 y 150 caracteres'),

  body('descripcion')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('La descripción debe tener entre 50 y 5000 caracteres'),

  body('modalidad')
    .isIn(['presencial', 'remoto', 'hibrido'])
    .withMessage('Modalidad inválida'),

  body('tipo_contrato')
    .isIn(['tiempo_completo', 'medio_tiempo', 'temporal', 'freelance', 'practicas'])
    .withMessage('Tipo de contrato inválido'),

  body('nivel_experiencia')
    .isIn(['sin_experiencia', 'junior', 'semi_senior', 'senior', 'lead'])
    .withMessage('Nivel de experiencia inválido'),

  body('salario_min')
    .optional()
    .isNumeric()
    .withMessage('Salario mínimo debe ser un número'),

  body('salario_max')
    .optional()
    .isNumeric()
    .withMessage('Salario máximo debe ser un número'),

  body('vacantes_disponibles')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Vacantes disponibles debe ser un número positivo'),

  body('ubicacion')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación debe tener máximo 100 caracteres'),

  body('requisitos')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los requisitos deben tener máximo 2000 caracteres'),

  body('responsabilidades')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Las responsabilidades deben tener máximo 2000 caracteres'),

  body('beneficios')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Los beneficios deben tener máximo 1000 caracteres')
];

// Validaciones para crear postulación
const validateCreatePostulacion = [
  body('id_oferta')
    .isInt({ min: 1 })
    .withMessage('ID de oferta requerido'),

  body('carta_presentacion')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La carta de presentación debe tener máximo 2000 caracteres'),

  body('cv_url_postulacion')
    .optional()
    .isURL()
    .withMessage('URL del CV debe ser válida')
];


const validateChangeStatus = [
  body('estado')
    .isIn(['pendiente', 'en_revision', 'preseleccionado', 'entrevista', 'rechazado', 'aceptado'])
    .withMessage('Estado inválido'),

  body('notas')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas deben tener máximo 1000 caracteres')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateEmpresa,
  validateUpdateEmpresa: validateCreateEmpresa,
  validateCreateOferta,
  validateUpdateOferta: validateCreateOferta,
  validateCreatePostulacion,
  validateChangeStatus
};