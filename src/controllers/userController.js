import { UserSchema } from '../models/Schemas.js';
import { userService } from '../services/services.js';
import { ValidationError, AuthenticationError, catchAsync } from '../middleware/errorMiddleware.js';

const userController = {
    register: catchAsync(async (req, res) => {
        const userData = req.body;
        
        const newUser = await userService.register(userData);
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: newUser
        });
    }),

    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        
        try {
            const user = await userService.login(email, password);
            
            if (!user || !user.user) {
                throw new AuthenticationError('Credenciales inválidas');
            }

            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: user
            });
        } catch (error) {
            // Si es un error de Supabase de credenciales inválidas
            if (error.message.includes('Invalid login credentials')) {
                throw new AuthenticationError('Credenciales inválidas');
            }
            // Re-throw otros errores para que sean manejados por el middleware
            throw error;
        }
    }),

    logout: catchAsync(async (req, res) => {
        await userService.logout();
        res.status(200).json({
            success: true,
            message: 'Logout exitoso'
        });
    })
};

export default userController;
