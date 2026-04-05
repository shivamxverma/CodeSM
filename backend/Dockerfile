FROM node:22 AS deps

WORKDIR /app

COPY package*.json ./

COPY cleanup-node_modules.sh ./

RUN npm install --omit=dev && \
    chmod +x cleanup-node_modules.sh && \
    ./cleanup-node_modules.sh && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/* cleanup-node_modules.sh



FROM node:22 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init for signal handling (node image is Debian-based)
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs


COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs services ./services

USER nextjs

EXPOSE 8000

CMD ["dumb-init", "npm", "start"]
