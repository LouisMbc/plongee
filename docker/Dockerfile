# Utiliser Node.js 20 Alpine pour une image légère
FROM node:20-alpine AS base         

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installer les dépendances
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Builder l'application
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Optimiser pour la production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Image de production finale
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public

# Copier les fichiers de build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exposer le port 3000
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Démarrer l'application
CMD ["node", "server.js"]