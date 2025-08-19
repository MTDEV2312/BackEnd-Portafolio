export const UserSchema = {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

export const PresenterSchema = {
  nombre: { type: 'string', required: true },
  perfilUrl: { type: 'string', required: false },
  aboutMeDescription: { type: 'string', required: false },
  contactEmail: { type: 'string', required: false },
};

// Esquema específico para creación (más estricto)
export const PresenterCreateSchema = {
  nombre: { type: 'string', required: true },
  perfilUrl: { type: 'string', required: true },
  contactEmail: { type: 'string', required: true },
};

// Esquema específico para actualización (más flexible)
export const PresenterUpdateSchema = {
  nombre: { type: 'string', required: false },
  perfilUrl: { type: 'string', required: false },
  aboutMeDescription: { type: 'string', required: false },
  contactEmail: { type: 'string', required: false },
};

export const ProjectSchema = {
  imageSrc: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  githubLink: { type: 'string', required: false },
  liveDemoLink: { type: 'string', required: false },
  techSection: { type: 'string', required: true },
};