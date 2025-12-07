# ---- Build stage ----
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Copiamos dependencias
    COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./ 2>/dev/null || true
    
    # Instala dependencias (ajusta al gestor que uses)
    RUN \
      if [ -f package-lock.json ]; then npm ci; \
      elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --frozen-lockfile; \
      elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
      else npm install; \
      fi
    
    # Copia el resto del código
    COPY . .
    
    # Build de producción
    RUN npm run build
    
    # ---- Runtime stage ----
    FROM node:22-alpine AS runner
    
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copiamos solo lo necesario
    COPY --from=builder /app/package.json .
    COPY --from=builder /app/package-lock.json* ./ 2>/dev/null || true
    COPY --from=builder /app/yarn.lock* ./ 2>/dev/null || true
    COPY --from=builder /app/pnpm-lock.yaml* ./ 2>/dev/null || true
    
    # Instala solo deps de prod
    RUN \
      if [ -f package-lock.json ]; then npm ci --omit=dev; \
      elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install --prod --frozen-lockfile; \
      elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
      else npm install --omit=dev; \
      fi
    
    # Copiamos el build
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.* ./ 2>/dev/null || true
    COPY --from=builder /app/tsconfig.json ./ 2>/dev/null || true
    
    EXPOSE 3000
    
    CMD ["npm", "run", "start"]
    