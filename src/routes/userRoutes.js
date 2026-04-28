import userController from "../controllers/userController.js";
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireAdminUser } from '../middleware/adminMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { userValidationSchemas } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';

const router = Router();

// Ruta pública
router.post('/login', 
  validateBody(userValidationSchemas.login),
  catchAsync(userController.login)
);

// Rutas privadas (requieren autenticación)
router.post('/register', 
  validateBody(userValidationSchemas.register),
  authenticateUser, 
  catchAsync(userController.register)
);

router.post('/logout', 
  authenticateUser, 
  catchAsync(userController.logout)
);

router.post('/admin/backfill-image-metadata',
  authenticateUser,
  requireAdminUser,
  catchAsync(userController.runBackfillImageMetadata)
);

export default router;
