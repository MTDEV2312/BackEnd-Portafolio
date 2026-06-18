import profileController from '../controllers/profileController.js';
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateBody, profileValidationSchemas } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';

const router = Router();

// Ruta pública
router.get('/read', 
  catchAsync(profileController.read)
);

// Rutas privadas (requieren autenticación)
router.post('/create', 
  authenticateUser,
  validateBody(profileValidationSchemas.create),
  catchAsync(profileController.create)
);

router.patch('/update', 
  authenticateUser,
  validateBody(profileValidationSchemas.update),
  catchAsync(profileController.create) // Usa el mismo controlador porque maneja upsert
);

export default router;

