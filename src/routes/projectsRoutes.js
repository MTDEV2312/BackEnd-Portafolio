import projectController from '../controllers/projectController.js';
import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateParams, validateProjectBody, idSchema } from '../middleware/validationMiddleware.js';
import { catchAsync } from '../middleware/errorMiddleware.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';
import { 
  validateTablePermissions, 
  databaseAuditLogger, 
  operationRateLimit,
  sanitizeSupabaseQuery 
} from '../middleware/supabaseSecurityMiddleware.js';

const router = Router();

// Ruta pública con rate limiting específico
router.get('/read', 
  operationRateLimit('read_projects', 100, 15 * 60 * 1000),
  sanitizeSupabaseQuery,
  databaseAuditLogger('SELECT', 'proyectos'),
  catchAsync(projectController.read)
);

// Rutas privadas (requieren autenticación)
router.post('/create', 
  authenticateUser,
  validateTablePermissions('proyectos', 'create'),
  operationRateLimit('create_project', 10, 15 * 60 * 1000),
  upload.single('image'), // Middleware para manejar la imagen
  handleMulterError, // Middleware para manejar errores de multer
  validateProjectBody('create'), // Validación adaptativa
  databaseAuditLogger('INSERT', 'proyectos'),
  catchAsync(projectController.create)
);

router.patch('/update/:id', 
  authenticateUser,
  validateTablePermissions('proyectos', 'update'),
  operationRateLimit('update_project', 20, 15 * 60 * 1000),
  validateParams(idSchema),
  upload.single('image'), // Middleware para manejar la imagen (opcional en actualización)
  handleMulterError, // Middleware para manejar errores de multer
  validateProjectBody('update'), // Validación adaptativa
  databaseAuditLogger('UPDATE', 'proyectos'),
  catchAsync(projectController.update)
);

router.delete('/delete/:id', 
  authenticateUser,
  validateTablePermissions('proyectos', 'delete'),
  operationRateLimit('delete_project', 5, 15 * 60 * 1000),
  validateParams(idSchema),
  databaseAuditLogger('DELETE', 'proyectos'),
  catchAsync(projectController.delete)
);

export default router;
