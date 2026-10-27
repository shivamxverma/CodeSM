# Startup Commands

To start the CodeSM project, run the following commands:

### 1. Start Infrastructure (PostgreSQL & Redis)
Ensure Docker is running, then start the database and cache containers:
```bash
docker compose up -d
```

### 2. Start Services

#### Option A: Run Backend and Workers via PM2
```bash
pm2 start ecosystem.config.cjs
```

#### Option B: Run Services Individually

**Backend:**
```bash
cd backend && npm run dev
```

**Frontend:**
```bash
cd Frontend && npm run dev
```

**Worker:**
```bash
cd workers && npm run dev
```
