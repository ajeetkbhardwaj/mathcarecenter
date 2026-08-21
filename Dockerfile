# ==============================================================================
# Math Care Center — Production Multi-Stage Dockerfile
# ==============================================================================

# 1. Base Image
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-co-cache libc6-compat

# 2. Dependencies Stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run TypeScript checks and Next.js Build
RUN npm run build

# 4. Runner Stage
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/content ./content

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
