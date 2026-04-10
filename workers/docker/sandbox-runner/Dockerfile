# Multi-language toolchain for compiling and running untrusted code in an isolated container.
# Build: docker build -t codesm-sandbox-runner:latest -f docker/sandbox-runner/Dockerfile docker/sandbox-runner
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      coreutils \
      gcc \
      g++ \
      python3 \
      nodejs \
      openjdk-17-jdk-headless \
      golang \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

# Intentionally no USER: the worker passes --user <uid>:<gid> to match the host
# volume owner so binaries and logs are not root-owned on the worker filesystem.
