import multer from 'multer';

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Validar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    return res.status(400).json({
      error: 'Error al procesar el archivo: ' + error.message
    });
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      error: error.message
    });
  }

  next(error);
};

export { upload, handleMulterError };
