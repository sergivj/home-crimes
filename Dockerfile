# ---- Build stage ----
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Copiamos el manifiesto de dependencias
    COPY package*.json ./
    
    # Instalamos dependencias (dev incluidas para poder hacer el build)
    RUN npm install
    
    # Copiamos el resto del código
    COPY . .
    
    # Build de producción
    RUN npm run build
    
    # ---- Runtime stage ----
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copiamos solo package.json para instalar deps de prod
    COPY package*.json ./
    
    # Instalamos solo dependencias de producción
    RUN npm install --omit=dev
    
    # Copiamos el build desde la imagen builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    
    # (Opcional) Si tienes next.config.mjs/ts y quieres copiarlo:
    # COPY --from=builder /app/next.config.* ./
    
    EXPOSE 3000
    
    CMD ["npm", "run", "start"]
    