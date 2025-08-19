// Clases de error personalizadas
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'No estás autenticado') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos') {
    super(message, 500, false);
  }
}

// Middleware mejorado para manejo de errores
export const errorHandler = (err, req, res, next) => {
  // Verificar si ya se ha enviado una respuesta
  if (res.headersSent) {
    return next(err);
  }

  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Error de Supabase - Credenciales inválidas
  if (err.message && err.message.includes('Invalid login credentials')) {
    error = new AuthenticationError('Credenciales inválidas');
  }

  // Error de Supabase - Usuario ya existe
  if (err.message && err.message.includes('User already registered')) {
    error = new ConflictError('El usuario ya está registrado');
  }

  // Error de Supabase - Email no confirmado
  if (err.message && err.message.includes('Email not confirmed')) {
    error = new AuthenticationError('Por favor confirma tu email antes de iniciar sesión');
  }

  // Error de conexión a base de datos
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    error = new DatabaseError('Error de conexión a la base de datos');
  }

  // Error de validación de Supabase
  if (err.code === '23505') { // Unique constraint violation
    error = new ConflictError('Ya existe un registro con estos datos');
  }

  // Si no es un error operacional, establecer como error del servidor
  if (!error.isOperational && !(error instanceof AppError)) {
    error = new AppError('Error interno del servidor', 500, false);
  }

  // Asegurar que tenemos un código de estado válido
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`La ruta ${req.originalUrl} no existe en este servidor`);
  next(error);
};

// Wrapper para funciones async para capturar errores automáticamente
export const catchAsync = (fn) => {
  return (req, res, next) => {
    // Asegurar que la función devuelva una promesa
    const result = fn(req, res, next);
    
    // Verificar si el resultado tiene un método catch (es una promesa)
    if (result && typeof result.catch === 'function') {
      result.catch(next);
    }
  };
};
