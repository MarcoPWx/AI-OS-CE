# QuizMentor Hands-On Tutorial: From Zero to Kubernetes

## 🎯 What You'll Learn

By the end of this tutorial, you'll understand:

- How to deploy microservices on Kubernetes
- How services communicate with each other
- How to debug and monitor your applications
- How to connect a frontend to your microservices

## 📋 Prerequisites Check

Before starting, ensure you have:

```bash
# Check Docker
docker --version

# Check if Docker is running
docker ps

# Install kind if needed (macOS)
brew install kind

# Install kubectl if needed
brew install kubectl
```

---

## Part 1: Understanding What We're Building

### The System Components

```
QuizMentor System:
├── Frontend (React/Next.js) - User Interface
├── API Gateway - Central entry point
├── Learning Orchestrator - Manages learning sessions
├── Adaptive Engine - ML-based personalization
├── Bloom Validator - Question quality checker
├── PostgreSQL - Main database
└── Redis - Cache and sessions
```

### Why This Architecture?

1. **Separation of Concerns**: Each service has one job
2. **Scalability**: Scale only what needs scaling
3. **Resilience**: One service failure doesn't crash everything
4. **Development Speed**: Teams can work independently

---

## Part 2: Setting Up Your Environment

### Step 1: Clone and Navigate

```bash
cd /Users/betolbook/Documents/github/NatureQuest/QuizMentor
```

### Step 2: Understand the File Structure

```bash
ls -la
# You should see:
# - services/          (Your microservice code)
# - k8s/              (Kubernetes configurations)
# - scripts/          (Automation scripts)
# - test-self-learning.ts (Test file)
```

### Step 3: Review the Setup Script

```bash
# Open and read the script to understand what it does
cat scripts/local-dev-setup.sh
```

Key sections:

- `check_prerequisites()` - Verifies tools are installed
- `create_cluster()` - Creates local Kubernetes cluster
- `deploy_services()` - Deploys your microservices
- `create_frontend_config()` - Sets up frontend integration

---

## Part 3: Deploy Your First Cluster

### Step 1: Run the Setup

```bash
# Make script executable
chmod +x scripts/local-dev-setup.sh

# Run setup
./scripts/local-dev-setup.sh setup
```

### Step 2: Watch What Happens

As the script runs, you'll see:

```
🎓 QuizMentor Local Development Environment
===========================================

[STEP] Checking prerequisites...
[SUCCESS] All prerequisites installed ✅

[STEP] Creating local Kubernetes cluster...
Creating cluster "quizmentor-local" ...
[SUCCESS] Kubernetes cluster created successfully 🚀

[STEP] Installing NGINX Ingress Controller...
[SUCCESS] Ingress controller installed ✅

[STEP] Deploying QuizMentor services...
[SUCCESS] QuizMentor services deployed ✅
```

### Step 3: Verify Everything is Running

```bash
# Check cluster
kubectl get nodes

# Check pods (your services)
kubectl -n quizmentor get pods

# You should see something like:
NAME                                    READY   STATUS    RESTARTS   AGE
api-gateway-7b5f6d9c8-x4n2m           1/1     Running   0          2m
learning-orchestrator-6d8b7f9c5-p3k8l  1/1     Running   0          2m
adaptive-engine-5c7d8f6b4-m9n7j        1/1     Running   0          2m
bloom-validator-8f9b5d7c6-k2l4m        1/1     Running   0          2m
postgresql-0                           1/1     Running   0          3m
redis-7d9f8c5b6-j8k3n                  1/1     Running   0          3m
```

---

## Part 4: Understanding Kubernetes Objects

### Pods - The Basic Unit

A Pod is like a house for your application:

```bash
# Look at a pod in detail
kubectl -n quizmentor describe pod -l app=learning-orchestrator

# You'll see:
# - Container configuration
# - Environment variables
# - Network settings
# - Volume mounts
```

### Deployments - Managing Pods

Deployments ensure your pods stay running:

```bash
# View deployments
kubectl -n quizmentor get deployments

# See deployment details
kubectl -n quizmentor describe deployment learning-orchestrator
```

### Services - Network Access

Services provide stable addresses for pods:

```bash
# List services
kubectl -n quizmentor get services

# You'll see:
NAME                    TYPE       CLUSTER-IP      PORT(S)
learning-orchestrator   NodePort   10.96.1.123     3010:30100/TCP
api-gateway            NodePort   10.96.2.456     8080:30080/TCP
```

---

## Part 5: Service Communication

### How Services Find Each Other

Inside the cluster, services use DNS names:

```javascript
// In api-gateway code:
const orchestratorUrl = 'http://learning-orchestrator:3010';
// Kubernetes DNS automatically resolves this!
```

### Test Inter-Service Communication

```bash
# Execute into the API gateway pod
kubectl -n quizmentor exec -it deployment/api-gateway -- sh

# Inside the pod, test connection to another service
wget -O- http://learning-orchestrator:3010/health
# Should return: {"status":"healthy"}

# Exit the pod
exit
```

### Understanding Port Mappings

```
External (Your Computer) → NodePort → Service → Pod
localhost:8080          → 30080    → 8080    → 8080
```

---

## Part 6: Testing the System

### Step 1: Test Individual Services

```bash
# Test API Gateway
curl http://localhost:8080/health
# Response: {"status":"healthy","service":"api-gateway"}

# Test Learning Orchestrator
curl http://localhost:3010/health
# Response: {"status":"healthy","service":"learning-orchestrator"}

# Test Adaptive Engine
curl http://localhost:3011/health
# Response: {"status":"healthy","service":"adaptive-engine"}

# Test Bloom Validator
curl http://localhost:3012/health
# Response: {"status":"healthy","service":"bloom-validator"}
```

### Step 2: Run the Test Script

```bash
# Install dependencies if needed
npm install

# Run the test
npx ts-node test-self-learning.ts
```

### Step 3: Test Database Connectivity

```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U quizmentor -d quizmentor
# Password: localdev123

# Run a test query
SELECT version();

# Exit
\q

# Test Redis
redis-cli -h localhost -p 6379
PING
# Should return: PONG
exit
```

---

## Part 7: Monitoring and Debugging

### View Logs

```bash
# View logs from a specific service
kubectl -n quizmentor logs -l app=learning-orchestrator

# Follow logs in real-time
kubectl -n quizmentor logs -f -l app=learning-orchestrator

# View logs from all services
kubectl -n quizmentor logs -l app --all-containers=true
```

### Debug a Pod

```bash
# If a pod is crashing, check why
kubectl -n quizmentor describe pod <pod-name>

# Look for the "Events" section at the bottom
# Common issues:
# - ImagePullBackOff: Can't download Docker image
# - CrashLoopBackOff: Application keeps crashing
# - OOMKilled: Out of memory
```

### Execute Commands in Pods

```bash
# Open a shell in a pod
kubectl -n quizmentor exec -it deployment/learning-orchestrator -- sh

# Inside the pod, you can:
# - Check environment variables
env | grep POSTGRES

# - Test network connectivity
ping postgresql

# - Check filesystem
ls -la /app

# Exit
exit
```

---

## Part 8: Making Changes

### Update Environment Variables

```bash
# Change log level
kubectl -n quizmentor set env deployment/learning-orchestrator LOG_LEVEL=debug

# Verify the change
kubectl -n quizmentor get deployment learning-orchestrator -o yaml | grep LOG_LEVEL
```

### Scale Services

```bash
# Scale up the learning orchestrator
kubectl -n quizmentor scale deployment/learning-orchestrator --replicas=3

# Watch pods being created
kubectl -n quizmentor get pods -w

# Scale back down
kubectl -n quizmentor scale deployment/learning-orchestrator --replicas=1
```

### Update Code and Redeploy

```bash
# 1. Make code changes
# 2. Rebuild Docker image
docker build -t quizmentor/services:latest .

# 3. Load into kind
kind load docker-image quizmentor/services:latest --name quizmentor-local

# 4. Restart deployment
kubectl -n quizmentor rollout restart deployment/learning-orchestrator

# 5. Check status
kubectl -n quizmentor rollout status deployment/learning-orchestrator
```

---

## Part 9: Frontend Integration

### Understanding the Configuration

The setup creates two files for your frontend:

#### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_LEARNING_API=http://localhost:3010
NEXT_PUBLIC_ADAPTIVE_API=http://localhost:3011
NEXT_PUBLIC_BLOOM_API=http://localhost:3012
```

#### `frontend-config.json`

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

### Connect Your Frontend

```javascript
// In your React/Next.js code:

// Using environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Make API calls
async function startLearningSession() {
  const response = await fetch(`${API_URL}/api/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '123',
      topic: 'mathematics',
    }),
  });

  const data = await response.json();
  console.log('Session started:', data);
}

// Direct service calls (for development)
async function getAdaptiveRecommendations() {
  const ADAPTIVE_API = process.env.NEXT_PUBLIC_ADAPTIVE_API;
  const response = await fetch(`${ADAPTIVE_API}/recommendations`);
  return response.json();
}
```

---

## Part 10: Common Tasks and Solutions

### Task: Check if Services are Healthy

```bash
# Quick health check script
for service in api-gateway learning-orchestrator adaptive-engine bloom-validator; do
  echo "Checking $service..."
  kubectl -n quizmentor get pods -l app=$service
done
```

### Task: View All Resources

```bash
# See everything in the namespace
kubectl -n quizmentor get all

# More detailed view
kubectl -n quizmentor get pods,svc,deployment,ingress
```

### Task: Restart Everything

```bash
# Restart all deployments
kubectl -n quizmentor rollout restart deployment

# Or restart the whole cluster
./scripts/local-dev-setup.sh cleanup
./scripts/local-dev-setup.sh setup
```

### Task: Debug Network Issues

```bash
# Test service discovery
kubectl -n quizmentor run test-pod --image=busybox -it --rm -- sh

# Inside the test pod:
nslookup learning-orchestrator
wget -O- http://learning-orchestrator:3010/health
exit
```

---

## Part 11: Understanding the Flow

### Complete Request Flow

Let's trace a complete request:

1. **User Action**: Click "Start Quiz" in browser

   ```javascript
   // Frontend code
   startQuiz() {
     fetch('http://localhost:8080/api/quiz/start')
   }
   ```

2. **API Gateway Receives Request**

   ```javascript
   // API Gateway routes to Learning Orchestrator
   app.post('/api/quiz/start', (req, res) => {
     orchestrator.startQuiz(req.body);
   });
   ```

3. **Learning Orchestrator Processes**

   ```javascript
   // Calls other services
   async startQuiz(data) {
     const profile = await adaptiveEngine.getUserProfile(data.userId)
     const questions = await bloomValidator.getValidQuestions(data.topic)
     return createSession(profile, questions)
   }
   ```

4. **Response Returns**
   ```
   Learning Orchestrator → API Gateway → Frontend → User
   ```

---

## Part 12: Cleanup and Next Steps

### Clean Up When Done

```bash
# Delete the cluster
./scripts/local-dev-setup.sh cleanup

# Verify it's gone
kind get clusters
docker ps
```

### What You've Learned

✅ How to deploy microservices on Kubernetes
✅ How pods, deployments, and services work
✅ How to monitor and debug applications
✅ How services communicate
✅ How to integrate with a frontend

### Next Steps

1. **Modify the Services**
   - Add a new endpoint
   - Change the business logic
   - Add logging

2. **Experiment with Kubernetes**
   - Try different scaling strategies
   - Implement health checks
   - Add resource limits

3. **Enhance the System**
   - Add authentication
   - Implement caching
   - Add monitoring metrics

---

## 📚 Quick Reference

### Essential Commands

```bash
# Cluster Management
./scripts/local-dev-setup.sh setup    # Create everything
./scripts/local-dev-setup.sh status   # Check status
./scripts/local-dev-setup.sh cleanup  # Delete everything

# Kubernetes Commands
kubectl -n quizmentor get pods        # List pods
kubectl -n quizmentor logs <pod>      # View logs
kubectl -n quizmentor exec -it <pod> -- sh  # Enter pod
kubectl -n quizmentor describe pod <pod>    # Pod details

# Testing
curl http://localhost:8080/health     # Test API Gateway
curl http://localhost:3010/health     # Test Learning Orchestrator

# Database Access
psql -h localhost -p 5432 -U quizmentor -d quizmentor
redis-cli -h localhost -p 6379
```

### Port Reference

| Service               | Internal Port | External Port | URL                   |
| --------------------- | ------------- | ------------- | --------------------- |
| API Gateway           | 8080          | 8080          | http://localhost:8080 |
| Learning Orchestrator | 3010          | 3010          | http://localhost:3010 |
| Adaptive Engine       | 3011          | 3011          | http://localhost:3011 |
| Bloom Validator       | 3012          | 3012          | http://localhost:3012 |
| PostgreSQL            | 5432          | 5432          | localhost:5432        |
| Redis                 | 6379          | 6379          | localhost:6379        |

---

## 🎉 Congratulations!

You've successfully deployed and understood a microservices application on Kubernetes!

Keep experimenting, breaking things, and learning. The best way to understand Kubernetes is through hands-on practice.

Happy Learning! 🚀
