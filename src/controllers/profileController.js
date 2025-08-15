import {PresenterSchema} from '../models/Schemas.js';
import {profileService} from '../services/services.js';

const profileController = {
    create:async (req, res) => {
        try {
            const presentadorData = req.body;

            // Validar datos usando el esquema
            for (const [key, value] of Object.entries(PresenterSchema)) {
                if (value.required && !presentadorData[key]) {
                    return res.status(400).json({
                        error: `El campo '${key}' es obligatorio.`
                    });
                }
            }

            const newPresentador = await profileService.create(presentadorData);
            res.status(201).json({
                message: 'About me creado exitosamente',
                data: newPresentador
            });
        } catch (error) {
            console.error('Error al crear el About me:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
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
            console.error('Error al obtener el About me:', error);
            res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
}

export default profileController;