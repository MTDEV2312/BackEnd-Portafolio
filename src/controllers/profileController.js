import {PresenterSchema, PresenterCreateSchema, PresenterUpdateSchema} from '../models/Schemas.js';
import {profileService} from '../services/services.js';

const profileController = {
    create:async (req, res) => {
        try {
            const presentadorData = req.body;

            // Determinar si es una creación o actualización
            const presentadorExistente = await profileService.read();
            const schema = presentadorExistente ? PresenterUpdateSchema : PresenterCreateSchema;

            // Validar datos usando el esquema apropiado
            for (const [key, value] of Object.entries(schema)) {
                if (value.required && !presentadorData[key]) {
                    return res.status(400).json({
                        error: `El campo '${key}' es obligatorio.`
                    });
                }
            }

            const newPresentador = await profileService.create(presentadorData);
            res.status(201).json({
                message: 'About me creado/actualizado exitosamente',
                data: newPresentador
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message
            });
        }
    },
    read: async (req, res) => {
        try {
            const presentador = await profileService.read();
            res.status(200).json({
                message: 'About me obtenido exitosamente',
                data: presentador
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default profileController;