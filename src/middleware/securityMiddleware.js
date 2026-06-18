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

