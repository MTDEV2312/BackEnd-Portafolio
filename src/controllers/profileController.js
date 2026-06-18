import {profileService} from '../services/services.js';

const setPublicJsonCache = (res, maxAgeSeconds = 120, staleWhileRevalidateSeconds = 600) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`);
};

const profileController = {
    create:async (req, res) => {
        try {
            const presentadorData = req.body;

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

            setPublicJsonCache(res, 180, 900);
            if (presentador?.updatedAt) {
                res.set('Last-Modified', new Date(presentador.updatedAt).toUTCString());
            }

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