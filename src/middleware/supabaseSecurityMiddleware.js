import supabase from '../config/config.js';

// Middleware para aprovechar las características de seguridad de Supabase
export const supabaseSecurityMiddleware = (req, res, next) => {
  // Agregar información de contexto para Supabase RLS
  if (req.user) {
    // Establecer el contexto del usuario para RLS
    req.supabaseContext = {
      user_id: req.user.id,
      email: req.user.email,
      role: req.user.role || 'authenticated'
    };
  }

  next();
};

// Middleware para logging de operaciones de base de datos
export const databaseAuditLogger = (operation, table) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Log exitoso de la operación
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('📊 Operación de BD exitosa:', {
          operation,
          table,
          user: req.user?.id || 'anonymous',
          ip: req.ip,
          timestamp: new Date().toISOString(),
          statusCode: res.statusCode
        });
      }
      
      originalSend.call(this, body);
    };

    // Log de inicio de operación
    console.log('🔄 Iniciando operación de BD:', {
      operation,
      table,
      user: req.user?.id || 'anonymous',
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    next();
  };
};

// Middleware para validar permisos específicos de tabla
export const validateTablePermissions = (table, operation) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida',
          message: 'Debe estar autenticado para realizar esta operación'
        });
      }

      // Definir permisos por tabla y operación
      const permissions = {
        'proyectos': {
          'read': ['authenticated', 'admin'],
          'create': ['authenticated', 'admin'],
          'update': ['admin'],
          'delete': ['admin']
        },
        'presentador': {
          'read': ['authenticated', 'admin'],
          'create': ['admin'],
          'update': ['admin'],
          'delete': ['admin']
        }
      };

      const userRole = req.user.role || 'authenticated';
      const allowedRoles = permissions[table]?.[operation] || [];

      if (!allowedRoles.includes(userRole)) {
        console.warn('🚫 Acceso denegado a tabla:', {
          user: req.user.id,
          table,
          operation,
          userRole,
          allowedRoles,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });

        return res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          message: `No tienes permisos para realizar la operación '${operation}' en '${table}'`
        });
      }

      next();
    } catch (error) {
      console.error('Error validando permisos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Error al validar permisos'
      });
    }
  };
};

// Middleware para sanitizar queries específicos de Supabase
export const sanitizeSupabaseQuery = (req, res, next) => {
  // Parámetros permitidos para queries de Supabase
  const allowedParams = [
    'select', 'order', 'limit', 'offset', 'range',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in', 'contains',
    'contained_by', 'overlap'
  ];

  if (req.query) {
    // Filtrar solo parámetros permitidos
    const sanitizedQuery = {};
    Object.keys(req.query).forEach(key => {
      if (allowedParams.includes(key) || key.startsWith('_')) {
        sanitizedQuery[key] = req.query[key];
      } else {
        console.warn('🚨 Parámetro de query no permitido:', {
          parameter: key,
          value: req.query[key],
          ip: req.ip,
          url: req.originalUrl,
          timestamp: new Date().toISOString()
        });
      }
    });

    req.query = sanitizedQuery;
  }

  next();
};

// Middleware para rate limiting específico por operación
export const operationRateLimit = (operation, maxRequests = 50, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = `${req.ip}_${operation}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(timestamp => timestamp > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= maxRequests) {
      console.warn('🚨 Rate limit excedido para operación:', {
        operation,
        ip: req.ip,
        requests: userRequests.length,
        maxRequests,
        timestamp: new Date().toISOString()
      });

      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes',
        message: `Has excedido el límite de ${maxRequests} solicitudes para la operación '${operation}' en ${windowMs / 60000} minutos`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Agregar request actual
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};
