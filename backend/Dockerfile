FROM mcr.microsoft.com/devcontainers/base:debian

RUN apt-get update && \
    apt-get install -y --no-install-recommends g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY code/user_code.cpp .
CMD ["bash","-lc","g++ -std=c++17 user_code.cpp -o user_program && ./user_program"]
