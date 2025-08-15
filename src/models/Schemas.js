export const UserSchema = {
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

export const PresenterSchema = {
  nombre: { type: 'string', required: true },
  perfilUrl: { type: 'string', required: true },
  aboutMeDescription: { type: 'string', required: true },
  contactEmail: { type: 'string', required: true },
};

export const ProjectSchema = {
  imageSrc: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'string', required: true },
  githubLink: { type: 'string', required: false },
  liveDemoLink: { type: 'string', required: false },
};