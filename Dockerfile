# ---- Build stage ----
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Copiamos el manifiesto de dependencias
    COPY package*.json ./
    
    # Instalamos dependencias (incluidas dev) ignorando conflictos de peer deps
    RUN npm install --legacy-peer-deps
    
    # Copiamos el resto del código
    COPY . .
    
    # Build de producción
    RUN npm run build
    
    # ---- Runtime stage ----
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copiamos TODO lo que ya está listo desde el builder
    COPY --from=builder /app ./
    
    # (Opcional) si quieres adelgazar un poco el contenedor:
    # RUN npm prune --omit=dev
    
    EXPOSE 3000
    
    CMD ["npm", "run", "start"]
    