import profileController from '../controllers/profileController.js';
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateBody, profileValidationSchemas } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { 
  validateTablePermissions, 
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
  validateTablePermissions('presentador', 'create'),
  operationRateLimit('create_profile', 5, 15 * 60 * 1000),
  validateBody(profileValidationSchemas.create),
  databaseAuditLogger('UPSERT', 'presentador'),
  catchAsync(profileController.create)
);

export default router;

