# Minimal toolchain for compiling and running untrusted C++ in an isolated container.
# Build: docker build -t codesm-cpp-runner:latest -f docker/cpp-runner/Dockerfile docker/cpp-runner
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      bash \
      coreutils \
      g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

# Intentionally no USER: the worker passes --user <uid>:<gid> to match the host
# volume owner so binaries and logs are not root-owned on the worker filesystem.
