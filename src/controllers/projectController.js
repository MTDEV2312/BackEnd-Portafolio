import { ProjectSchema } from '../models/Schemas.js';
import { projectService } from '../services/services.js';

const projectController = {
  create: async (req, res) => {
    try {
      const projectData = req.body;

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
      console.error('Error al crear el proyecto:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  read: async (req, res) => {
    try {
      const projects = await projectService.read();
      res.status(200).json({
        message: 'Proyectos obtenidos exitosamente',
        data: projects
      });
    } catch (error) {
      console.error('Error al obtener los proyectos:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = req.body;

      const updatedProject = await projectService.update(id, projectData);
      res.status(200).json({
        message: 'Proyecto actualizado exitosamente',
        data: updatedProject
      });
    } catch (error) {
      console.error('Error al actualizar el proyecto:', error);
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
      console.error('Error al eliminar el proyecto:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

export default projectController;