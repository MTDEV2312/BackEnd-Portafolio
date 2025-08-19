import Joi from 'joi';

// Esquemas de validación con Joi
export const userValidationSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
      'any.required': 'La contraseña es obligatoria'
    })
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const projectValidationSchemas = {
  create: Joi.object({
    imageSrc: Joi.string().uri().required().messages({
      'string.uri': 'La imagen debe ser una URL válida',
      'any.required': 'La imagen es obligatoria'
    }),
    title: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es obligatorio'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),
    githubLink: Joi.string().uri().optional().allow(''),
    liveDemoLink: Joi.string().uri().optional().allow('')
  }),
  createWithFile: Joi.object({
    // imageSrc es opcional porque se generará automáticamente desde el archivo
    title: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es obligatorio'
    }),
    description: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),
    githubLink: Joi.string().uri().optional().allow(''),
    liveDemoLink: Joi.string().uri().optional().allow('')
  }),
  update: Joi.object({
    imageSrc: Joi.string().uri().optional(),
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    githubLink: Joi.string().uri().optional().allow(''),
    liveDemoLink: Joi.string().uri().optional().allow('')
  }),
  updateWithFile: Joi.object({
    // imageSrc es opcional porque se puede generar desde el archivo o mantener el actual
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    githubLink: Joi.string().uri().optional().allow(''),
    liveDemoLink: Joi.string().uri().optional().allow('')
  })
};

export const profileValidationSchemas = {
  create: Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
    perfilUrl: Joi.string().uri().optional().messages({
      'string.uri': 'La URL del perfil debe ser válida'
    }),
    aboutMeDescription: Joi.string().min(10).max(1000).optional().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
    contactEmail: Joi.string().email().optional().messages({
      'string.email': 'El email de contacto debe tener un formato válido'
    })
  }),
  update: Joi.object({
    nombre: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres'
    }),
    perfilUrl: Joi.string().uri().optional().messages({
      'string.uri': 'La URL del perfil debe ser válida'
    }),
    aboutMeDescription: Joi.string().min(10).max(1000).optional().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
    contactEmail: Joi.string().email().optional().messages({
      'string.email': 'El email de contacto debe tener un formato válido'
    })
  })
};

// Middleware de validación genérico
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errorDetails
      });
    }

    // Reemplazar req.body con los datos validados y sanitizados
    req.body = value;
    next();
  };
};

// Middleware de validación específico para proyectos
export const validateProjectBody = (operation) => {
  return (req, res, next) => {
    // Determinar qué esquema usar basado en si hay un archivo
    let schema;
    if (operation === 'create') {
      schema = req.file ? projectValidationSchemas.createWithFile : projectValidationSchemas.create;
      
      // Si no hay archivo ni imageSrc, es un error
      if (!req.file && !req.body.imageSrc) {
        return res.status(400).json({
          error: 'Se requiere una imagen. Proporciona un archivo o una URL de imagen.'
        });
      }
    } else if (operation === 'update') {
      schema = req.file ? projectValidationSchemas.updateWithFile : projectValidationSchemas.update;
    }

    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.context.key,
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errorDetails
      });
    }

    // Reemplazar req.body con los datos validados y sanitizados
    req.body = value;
    next();
  };
};

// Middleware para validar parámetros de URL
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        message: error.details[0].message
      });
    }

    req.params = value;
    next();
  };
};

// Esquema para validar IDs
export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});
