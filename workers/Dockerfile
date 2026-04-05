# Bull worker (Node) + Docker CLI for spawning cpp-runner sandboxes.
# Build: docker build -t codesm-worker:latest -f Dockerfile .
#
# The sandbox image is built separately:
#   docker build -f docker/cpp-runner/Dockerfile -t codesm-cpp-runner:latest docker/cpp-runner

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      dumb-init \
    && ARCH="$(uname -m)" && \
      case "$ARCH" in aarch64|arm64) D_ARCH=aarch64 ;; x86_64|amd64) D_ARCH=x86_64 ;; *) echo "unsupported arch: $ARCH"; exit 1 ;; esac && \
    curl -fsSL "https://download.docker.com/linux/static/stable/${D_ARCH}/docker-27.4.1.tgz" \
      | tar -xz --strip-components=1 -C /usr/local/bin docker/docker \
    && apt-get purge -y --auto-remove curl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force && rm -rf /root/.npm /tmp/*

COPY src ./src
COPY models ./models
COPY services ./services

# docker.sock is mounted at runtime; container user must be root for default socket perms,
# or run rootless Docker / socket group alignment in production.
USER root

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/worker.js"]
