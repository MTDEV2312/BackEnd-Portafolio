import { ProjectSchema } from '../models/Schemas.js';
import { projectService } from '../services/services.js';

const setPublicJsonCache = (res, maxAgeSeconds = 300, staleWhileRevalidateSeconds = 600) => {
  res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`);
};

const projectController = {
  create: async (req, res) => {
    try { 
      const projectData = req.body;
      
      // Si hay una imagen subida, procesarla
      if (req.file) {
        try {
          // Verificar que el usuario esté autenticado para subidas
          if (!req.user) {
            return res.status(401).json({
              error: 'Autenticación requerida para subir imágenes'
            });
          }
          
          // Subir la imagen al storage y obtener la URL
          const imageResult = await projectService.uploadImage(
            req.file.buffer, 
            req.file.originalname,
            req.user
          );
          projectData.imageSrc = imageResult.publicUrl;
          projectData.storagePath = imageResult.storagePath;
          projectData.imageMimeType = req.file.mimetype;

          if (typeof req.body.imageWidth !== 'undefined') {
            projectData.imageWidth = Number(req.body.imageWidth);
          }

          if (typeof req.body.imageHeight !== 'undefined') {
            projectData.imageHeight = Number(req.body.imageHeight);
          }

          if (
            Number.isFinite(projectData.imageWidth) &&
            Number.isFinite(projectData.imageHeight) &&
            projectData.imageHeight > 0
          ) {
            projectData.imageAspectRatio = Number((projectData.imageWidth / projectData.imageHeight).toFixed(4));
          }
          
        } catch (uploadError) {
          return res.status(500).json({
            error: 'Error al subir la imagen al storage',
            details: uploadError.message
          });
        }
      }

      // Validar datos usando el esquema
      for (const [key, value] of Object.entries(ProjectSchema)) {
        if (value.required && !projectData[key]) {
          return res.status(400).json({
            error: `El campo '${key}' es obligatorio.`
          });
        }
      }

      const newProject = await projectService.create(projectData);
      res.status(201).json({
        message: 'Proyecto creado exitosamente',
        data: newProject
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  read: async (req, res) => {
    try {
      const projects = await projectService.read();

      setPublicJsonCache(res, 120, 600);

      const lastUpdatedAt = projects
        .map((project) => project.updatedAt)
        .filter(Boolean)
        .sort()
        .pop();

      if (lastUpdatedAt) {
        res.set('Last-Modified', new Date(lastUpdatedAt).toUTCString());
      }

      res.status(200).json({
        message: 'Proyectos obtenidos exitosamente',
        data: projects
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = req.body;
      let uploadedImageUrl = null;
      let oldImageUrl = null;

      // Si hay una imagen subida, necesitamos manejar el proceso transaccionalmente
      if (req.file) {
        try {
          // Verificar que el usuario esté autenticado para subidas
          if (!req.user) {
            return res.status(401).json({
              error: 'Autenticación requerida para subir imágenes'
            });
          }
          
          
          // Paso 1: Obtener el proyecto actual para verificar la imagen anterior
          const currentProject = await projectService.getById(id);
          if (currentProject && currentProject.imageSrc) {
            oldImageUrl = currentProject.imageSrc;
          }
          
          // Paso 2: Subir la nueva imagen al storage
          const imageResult = await projectService.uploadImage(
            req.file.buffer, 
            req.file.originalname,
            req.user
          );
          uploadedImageUrl = imageResult.publicUrl;
          projectData.imageSrc = uploadedImageUrl;
          projectData.storagePath = imageResult.storagePath;
          projectData.imageMimeType = req.file.mimetype;

          if (typeof req.body.imageWidth !== 'undefined') {
            projectData.imageWidth = Number(req.body.imageWidth);
          }

          if (typeof req.body.imageHeight !== 'undefined') {
            projectData.imageHeight = Number(req.body.imageHeight);
          }

          if (
            Number.isFinite(projectData.imageWidth) &&
            Number.isFinite(projectData.imageHeight) &&
            projectData.imageHeight > 0
          ) {
            projectData.imageAspectRatio = Number((projectData.imageWidth / projectData.imageHeight).toFixed(4));
          }
          
        } catch (uploadError) {
          return res.status(500).json({
            error: 'Error al subir la imagen al storage',
            details: uploadError.message
          });
        }
      }

      try {
        // Paso 3: Actualizar la base de datos
        const updatedProject = await projectService.update(id, projectData);
        
        // Paso 4: Si todo salió bien y había una imagen anterior diferente, eliminarla del storage
        if (uploadedImageUrl && oldImageUrl && oldImageUrl !== uploadedImageUrl) {
          try {
            await projectService.deleteImageFromStorage(oldImageUrl);
          } catch (deleteError) {
            // No fallar la operación por esto, solo registrar el warning
          }
        }
        
        res.status(200).json({
          message: 'Proyecto actualizado exitosamente',
          data: updatedProject
        });
      } catch (dbError) {
        // Si falla la actualización de la BD y se subió una nueva imagen, eliminarla
        if (uploadedImageUrl) {
          try {
            await projectService.deleteImageFromStorage(uploadedImageUrl);
          } catch (cleanupError) {
            // Error en limpieza de imagen
          }
        }
        
        throw dbError; // Re-lanzar para que sea manejado por el catch principal
      }
    } catch (error) {
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedProject = await projectService.delete(id);
      res.status(200).json({
        message: 'Proyecto eliminado exitosamente',
        data: deletedProject
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

export default projectController;