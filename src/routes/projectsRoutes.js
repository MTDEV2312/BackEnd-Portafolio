import projectController from '../controllers/projectController.js';
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateParams, validateProjectBody, idSchema } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = Router();

// Ruta pública
router.get('/read', 
  catchAsync(projectController.read)
);

// Rutas privadas (requieren autenticación)
router.post('/create', 
  authenticateUser,
  upload.single('image'), // Middleware para manejar la imagen
  handleMulterError, // Middleware para manejar errores de multer
  validateProjectBody('create'), // Validación adaptativa
  catchAsync(projectController.create)
);

router.patch('/update/:id', 
  authenticateUser,
  validateParams(idSchema),
  upload.single('image'), // Middleware para manejar la imagen (opcional en actualización)
  handleMulterError, // Middleware para manejar errores de multer
  validateProjectBody('update'), // Validación adaptativa
  catchAsync(projectController.update)
);

router.delete('/delete/:id', 
  authenticateUser,
  validateParams(idSchema),
  catchAsync(projectController.delete)
);

export default router;
