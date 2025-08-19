import profileController from '../controllers/profileController.js';
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateBody, profileValidationSchemas } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { 
  databaseAuditLogger, 
  operationRateLimit,
  sanitizeSupabaseQuery 
} from '../middleware/supabaseSecurityMiddleware.js';

const router = Router();

// Ruta pública con rate limiting
router.get('/read', 
  operationRateLimit('read_profile', 200, 15 * 60 * 1000),
  sanitizeSupabaseQuery,
  databaseAuditLogger('SELECT', 'presentador'),
  catchAsync(profileController.read)
);

// Rutas privadas (requieren autenticación)
router.post('/create', 
  authenticateUser,
  operationRateLimit('create_profile', 5, 15 * 60 * 1000),
  validateBody(profileValidationSchemas.create),
  databaseAuditLogger('UPSERT', 'presentador'),
  catchAsync(profileController.create)
);

router.patch('/update', 
  authenticateUser,
  operationRateLimit('update_profile', 10, 15 * 60 * 1000),
  validateBody(profileValidationSchemas.update),
  databaseAuditLogger('UPDATE', 'presentador'),
  catchAsync(profileController.create) // Usa el mismo controlador porque maneja upsert
);

export default router;

