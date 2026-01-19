FROM node:20-alpine

WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código
COPY . .

# Cambiar permisos
RUN chown -R nodejs:nodejs /app

# Usar usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', r => { if (r.statusCode !== 200) process.exit(1) })"

# Iniciar app
CMD ["node", "server.js"]
