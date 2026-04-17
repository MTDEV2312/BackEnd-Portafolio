const parseAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const requireAdminUser = (req, res, next) => {
  const adminEmails = parseAdminEmails();

  if (adminEmails.length === 0) {
    return res.status(403).json({
      error: 'Acceso administrativo no configurado',
      message: 'Defini ADMIN_EMAILS en el entorno para habilitar esta operacion.'
    });
  }

  const userEmail = req.user?.email?.toLowerCase();
  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({
      error: 'Permisos insuficientes',
      message: 'Solo usuarios administradores pueden ejecutar esta operacion.'
    });
  }

  next();
};
