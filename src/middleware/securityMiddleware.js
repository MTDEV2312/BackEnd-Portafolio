import xss from 'xss';
import hpp from 'hpp';

// Middleware para prevenir XSS
export const preventXSS = (req, res, next) => {
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  // Sanitizar query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }

  next();
};

// Middleware para sanitización específica de PostgreSQL
export const sanitizeForSQL = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Caracteres potencialmente peligrosos para SQL
    const dangerousPatterns = [
      /--/g,          // Comentarios SQL
      /\/\*[\s\S]*?\*\//g, // Comentarios multilinea
      /;\s*$/g,       // Punto y coma al final
      /xp_/gi,        // Procedimientos extendidos de SQL Server
      /sp_/gi,        // Procedimientos del sistema
      /\bEXEC\b/gi,   // EXEC
      /\bEXECUTE\b/gi // EXECUTE
    ];

    // Eliminar patrones peligrosos
    let sanitized = str;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  };

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitizar query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    }
  }

  next();
};

// Middleware para prevenir HTTP Parameter Pollution
export const preventHPP = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'] // Parámetros permitidos para duplicación
});

// Middleware para logging de seguridad
export const securityLogger = (req, res, next) => {
  // Log de intentos de acceso sospechosos
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS básico
    /union.*select/i,  // SQL injection
    /insert.*into/i,   // SQL injection
    /delete.*from/i,   // SQL injection
    /update.*set/i,    // SQL injection
    /drop.*table/i,    // SQL injection
    /create.*table/i,  // SQL injection
    /alter.*table/i,   // SQL injection
    /grant.*to/i,      // SQL injection
    /javascript:/i,    // JavaScript protocol
    /data:/i,         // Data URLs
    /vbscript:/i,     // VBScript
    /--/,             // SQL comentarios
    /\/\*/,           // SQL comentarios multilinea
    /xp_/i,           // SQL Server extended procedures
    /sp_/i            // SQL Server system procedures
  ];

  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || '';
  const body = JSON.stringify(req.body);

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
      // Actividad sospechosa - log solo en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.warn('🚨 Actividad sospechosa detectada:', {
          ip: req.ip,
          url,
          method: req.method,
          pattern: pattern.source
        });
      }
    }
  });

  next();
};

// Middleware para limitar el tamaño de archivos subidos
export const limitFileSize = (maxSize = 5 * 1024 * 1024) => { // 5MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Archivo demasiado grande',
        message: `El tamaño máximo permitido es ${Math.round(maxSize / 1024 / 1024)}MB`
      });
    }
    
    next();
  };
};

// Middleware para headers de seguridad adicionales
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy básico
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self';"
  );

  // Strict Transport Security (solo en HTTPS)
  if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

// Middleware específico para validación de entrada PostgreSQL
export const validatePostgreSQLInput = (req, res, next) => {
  const validateValue = (value, key) => {
    if (typeof value === 'string') {
      // Verificar longitud máxima (PostgreSQL tiene límites)
      if (value.length > 10000) {
        throw new Error(`El campo '${key}' excede la longitud máxima permitida`);
      }

      // Verificar caracteres nulos (PostgreSQL no los permite en strings)
      if (value.includes('\0')) {
        throw new Error(`El campo '${key}' contiene caracteres no válidos`);
      }

      // Verificar patrones SQL peligrosos más específicos
      const sqlPatterns = [
        /(\bSELECT\b.*\bFROM\b)/i,
        /(\bINSERT\b.*\bINTO\b)/i,
        /(\bUPDATE\b.*\bSET\b)/i,
        /(\bDELETE\b.*\bFROM\b)/i,
        /(\bDROP\b.*\bTABLE\b)/i,
        /(\bCREATE\b.*\bTABLE\b)/i,
        /(\bALTER\b.*\bTABLE\b)/i,
        /(\bGRANT\b.*\bTO\b)/i,
        /(\bREVOKE\b.*\bFROM\b)/i,
        /(\bTRUNCATE\b.*\bTABLE\b)/i
      ];

      const containsSQLPattern = sqlPatterns.some(pattern => pattern.test(value));
      if (containsSQLPattern) {
        // Intento de inyección SQL - log solo en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          console.warn('🚨 Intento de inyección SQL detectado:', {
            field: key,
            ip: req.ip
          });
        }
        throw new Error(`El campo '${key}' contiene patrones no permitidos`);
      }
    }
  };

  try {
    // Validar body
    if (req.body && typeof req.body === 'object') {
      Object.entries(req.body).forEach(([key, value]) => {
        validateValue(value, key);
      });
    }

    // Validar query parameters
    if (req.query && typeof req.query === 'object') {
      Object.entries(req.query).forEach(([key, value]) => {
        validateValue(value, key);
      });
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      message: error.message
    });
  }
};
