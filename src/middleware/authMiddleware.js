import supabase from '../config/config.js';

// Middleware para verificar autenticación
export const authenticateUser = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe proporcionar un token válido en el header Authorization'
      });
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido o expirado',
        message: 'Por favor, inicie sesión nuevamente'
      });
    }

    // Agregar el usuario a la request para uso posterior
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Middleware opcional para rutas que pueden ser públicas o privadas
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // En caso de error, simplemente continúa sin usuario autenticado
    next();
  }
};
