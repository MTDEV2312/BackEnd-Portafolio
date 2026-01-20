import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📋 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
});
