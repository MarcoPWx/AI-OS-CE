# QuizMentor Local Development Setup

## 🚀 Quick Start

Run QuizMentor locally with a single command:

```bash
./scripts/local-dev-setup.sh setup
```

This will:

1. ✅ Create a local Kubernetes cluster using kind
2. ✅ Deploy PostgreSQL and Redis
3. ✅ Deploy all QuizMentor services
4. ✅ Configure networking for frontend access
5. ✅ Generate frontend configuration files

## 📋 Prerequisites

- Docker Desktop running
- 8GB RAM available
- Ports 3000, 3010-3012, 5432, 6379, 8080 available

Install missing tools (macOS):

```bash
brew install kind kubectl node
```

## 🎯 Service URLs

After setup, your services will be available at:

| Service               | URL                   | Description                                    |
| --------------------- | --------------------- | ---------------------------------------------- |
| API Gateway           | http://localhost:8080 | Main API entry point                           |
| Learning Orchestrator | http://localhost:3010 | Self-learning system                           |
| Adaptive Engine       | http://localhost:3011 | ML-powered adaptation                          |
| Bloom Validator       | http://localhost:3012 | Question validation                            |
| PostgreSQL            | localhost:5432        | Database (user: quizmentor, pass: localdev123) |
| Redis                 | localhost:6379        | Cache & sessions                               |

## 🔗 Frontend Integration

The setup automatically creates two configuration files:

### 1. `.env.local` - Environment variables for Next.js

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_LEARNING_API=http://localhost:3010
NEXT_PUBLIC_ADAPTIVE_API=http://localhost:3011
NEXT_PUBLIC_BLOOM_API=http://localhost:3012
```

### 2. `frontend-config.json` - Service configuration

```json
{
  "development": {
    "apiGateway": "http://localhost:8080",
    "services": {
      "learningOrchestrator": "http://localhost:3010",
      "adaptiveEngine": "http://localhost:3011",
      "bloomValidator": "http://localhost:3012"
    }
  }
}
```

## 🧪 Testing

### Test Backend Services

```bash
# Test API Gateway
curl http://localhost:8080/health

# Test Learning Orchestrator
curl http://localhost:3010/health

# Test with your TypeScript test file
npx ts-node test-self-learning.ts
```

### Connect Frontend

```bash
# In your frontend directory
npm install
npm run dev

# Frontend will connect to local backend services
```

## 📝 Common Commands

### View Status

```bash
./scripts/local-dev-setup.sh status
```

### View Logs

```bash
# API Gateway logs
./scripts/local-dev-setup.sh logs api-gateway

# Learning Orchestrator logs
./scripts/local-dev-setup.sh logs learning-orchestrator

# Adaptive Engine logs
./scripts/local-dev-setup.sh logs adaptive-engine
```

### Restart Services

```bash
./scripts/local-dev-setup.sh restart
```

### Clean Up

```bash
./scripts/local-dev-setup.sh cleanup
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│         http://localhost:3000           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       API Gateway (:8080)               │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│Learning │   │Adaptive │   │  Bloom  │
│  :3010  │   │  :3011  │   │  :3012  │
└─────────┘   └─────────┘   └─────────┘
    │               │               │
    └───────────────┼───────────────┘
                    ▼
        ┌───────────────────────┐
        │  PostgreSQL │ Redis   │
        │    :5432    │  :6379  │
        └───────────────────────┘
```

## 🔧 Troubleshooting

### Docker not running

```bash
# Start Docker Desktop on macOS
open -a Docker
```

### Port already in use

```bash
# Find and kill process using port 8080
lsof -i :8080
kill -9 <PID>
```

### Services not starting

```bash
# Check pod status
kubectl -n quizmentor get pods

# Check pod logs
kubectl -n quizmentor logs deployment/api-gateway
```

### Reset everything

```bash
# Delete cluster and start fresh
./scripts/local-dev-setup.sh cleanup
./scripts/local-dev-setup.sh setup
```

## 📚 Next Steps

1. **Start the backend**: `./scripts/local-dev-setup.sh setup`
2. **Run tests**: `npx ts-node test-self-learning.ts`
3. **Start frontend**: `cd frontend && npm run dev`
4. **Access QuizMentor**: Open http://localhost:3000

## 🆘 Help

- View all commands: `./scripts/local-dev-setup.sh`
- Check service health: `curl http://localhost:8080/health`
- View Kubernetes dashboard: `kubectl -n quizmentor get all`

---

**Note**: This is a local development setup. For production deployment with Istio, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
