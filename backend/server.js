require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar configuración de base de datos
const { testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE DE SEGURIDAD
// =============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:5000"],
    }
  }
}));

// Rate limiting - más permisivo para desarrollo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // máximo 300 requests por IP para desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// =============================================
// MIDDLEWARE GENERAL
// =============================================
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// CONEXIÓN A BASE DE DATOS
// =============================================
// Probar conexión al iniciar el servidor
(async () => {
  console.log('🔌 Intentando conectar a la base de datos...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Base de datos conectada correctamente');
  } else {
    console.log('❌ Sin conexión a base de datos - el servidor funcionará en modo limitado');
  }
})();

// =============================================
// RUTAS DE PRUEBA Y SALUD
// =============================================
app.get('/', (req, res) => {
  res.json({
    message: 'EMPLEOYA API - Servidor funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST || 'localhost',
      name: process.env.DB_NAME || 'empleoya_db',
      status: 'Verificar /health para estado actual'
    },
    endpoints: {
      health: '/health',
      test: '/test',
      api: '/api/*',
      uploads: '/uploads/*'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} segundos`,
      environment: process.env.NODE_ENV,
      database: {
        connected: dbConnected,
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'empleoya_db'
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Test endpoint para verificar que el servidor responde
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Test endpoint funcionando',
    timestamp: new Date().toISOString(),
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
});

// Servir archivo de pruebas HTML
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// AGREGAR ESTA LÍNEA:
app.get('/test.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.js'));
});

// =============================================
// RUTAS DE LA APLICACIÓN
// =============================================

// Rutas de autenticación
app.use('/api/auth', require('./src/routes/authRoutes'));

// Rutas de usuarios (cuando las creemos)
// app.use('/api/users', require('./src/routes/userRoutes'));

// Rutas de ofertas de trabajo (cuando las creemos)
 app.use('/api/ofertas', require('./src/routes/ofertaRoutes'));

// Rutas de postulaciones (cuando las creemos)
 app.use('/api/postulaciones', require('./src/routes/postulacionRoutes'));

// Rutas de categorías (cuando las creemos)
// app.use('/api/categorias', require('./src/routes/categoriaRoutes'));

// Rutas de empresas (cuando las creemos)
 app.use('/api/empresas', require('./src/routes/empresaRoutes'));

// Rutas de administración (cuando las creemos)
// app.use('/api/admin', require('./src/routes/adminRoutes'));

// Rutas de archivos/uploads (cuando las creemos)
// app.use('/api/files', require('./src/routes/fileRoutes'));

// =============================================
// ENDPOINTS DE DESARROLLO ADICIONALES
// =============================================

// Endpoint para ver configuración actual (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/dev/config', (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER
      },
      cors: {
        origin: corsOptions.origin
      },
      jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN
      },
      uploads: {
        path: process.env.UPLOAD_PATH,
        maxSize: process.env.MAX_FILE_SIZE
      }
    });
  });

  // Endpoint para limpiar datos de prueba (solo desarrollo)
  app.delete('/api/dev/cleanup', async (req, res) => {
    try {
      const { query } = require('./src/config/database');
      
      // Solo eliminar usuarios de prueba (emails con @ejemplo.com)
      await query("DELETE FROM usuario WHERE email LIKE '%@ejemplo.com'");
      
      res.json({
        message: 'Datos de prueba eliminados correctamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error eliminando datos de prueba',
        details: error.message
      });
    }
  });
}

// =============================================
// MANEJO DE ERRORES
// =============================================

// Ruta no encontrada (404)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `No se pudo encontrar ${req.originalUrl} en este servidor`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestions: [
      'Verificar la URL',
      'Consultar la documentación de la API en /api/test',
      'Probar el endpoint de pruebas en /test',
      'Verificar el estado del servidor en /health'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  // Errores de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Errores de base de datos
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Registro duplicado',
      message: 'Ya existe un registro con estos datos',
      timestamp: new Date().toISOString()
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token de autenticación inválido o expirado',
      timestamp: new Date().toISOString()
    });
  }

  // Errores de archivo muy grande
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Archivo demasiado grande',
      message: 'El archivo excede el tamaño máximo permitido',
      maxSize: '5MB',
      timestamp: new Date().toISOString()
    });
  }

  // Errores de conexión a BD
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Base de datos no disponible',
      message: 'No se puede conectar a la base de datos',
      timestamp: new Date().toISOString()
    });
  }

  // Error genérico del servidor
  const statusCode = error.status || error.statusCode || 500;
  
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Error interno del servidor' : error.message,
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// =============================================
// MANEJO DE SHUTDOWN GRACEFUL
// =============================================
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor gracefulmente...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor gracefulmente...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Cerrar servidor gracefulmente
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// =============================================
// INICIAR SERVIDOR
// =============================================
const server = app.listen(PORT, () => {
  console.log(`
🚀 ===== EMPLEOYA API SERVER =====
📍 Puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
🔗 URL Local: http://localhost:${PORT}
🧪 Probador APIs: http://localhost:${PORT}/test
🏥 Health Check: http://localhost:${PORT}/health
📊 Base de Datos: ${process.env.DB_NAME || 'empleoya_db'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3307}
⏰ Iniciado: ${new Date().toISOString()}
================================
  `);

  if (process.env.NODE_ENV === 'development') {
    console.log(`
📝 Endpoints principales:
   GET  /                       - Información del servidor
   GET  /health                 - Estado del servidor y BD
   GET  /test                   - Probador de APIs (HTML)
   GET  /api/test               - Test de la API
   
🔐 APIs de Autenticación:
   POST /api/auth/register      - Registro de usuarios
   POST /api/auth/login         - Inicio de sesión
   GET  /api/auth/profile       - Obtener perfil (requiere token)
   PUT  /api/auth/profile       - Actualizar perfil (requiere token)

🛠️ Desarrollo:
   GET  /api/dev/config         - Ver configuración actual
   DEL  /api/dev/cleanup        - Limpiar datos de prueba

🔗 Enlaces importantes:
   - Probador de APIs: http://localhost:${PORT}/test
   - phpMyAdmin: http://localhost:8080
   - Documentación: En desarrollo
    `);
  }
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Puerto ${PORT} ya está en uso`);
    console.log('💡 Intenta cerrar otras aplicaciones que usen el puerto o cambia el puerto en .env');
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

module.exports = app;