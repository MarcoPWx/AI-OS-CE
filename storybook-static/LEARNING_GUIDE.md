# QuizMentor Learning Guide: Understanding Kubernetes & Microservices

## 📚 Table of Contents

1. [Overview - What We're Building](#overview)
2. [Core Concepts](#core-concepts)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [How Everything Works Together](#how-everything-works)
5. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
6. [Learning Resources](#learning-resources)
7. [Hands-On Exercises](#hands-on-exercises)

---

## 🎯 Overview - What We're Building

QuizMentor is a **microservices-based self-learning system** deployed on Kubernetes. Think of it like building a city:

- **Kubernetes** = The city infrastructure (roads, utilities, zones)
- **Microservices** = Individual buildings (each with a specific purpose)
- **Istio** = Traffic management and security (traffic lights, police)
- **Docker** = Shipping containers (standardized packages for our code)

### The Big Picture

```
User → Frontend → API Gateway → Microservices → Databases
                       ↓
                  Orchestrated by Kubernetes
                       ↓
                  Managed by Istio (Production)
```

---

## 🔑 Core Concepts

### 1. Containers (Docker)

**What it is**: A package containing your application and everything it needs to run.

**Real-world analogy**: Like a shipping container - standardized, portable, stackable.

**In our project**:

```dockerfile
FROM node:18-alpine          # Start with Node.js base
WORKDIR /app                  # Set working directory
COPY . .                      # Copy our code
EXPOSE 3010                   # Open a port
CMD ["node", "server.js"]     # Run the app
```

### 2. Kubernetes (K8s)

**What it is**: A platform that manages containers across multiple machines.

**Real-world analogy**: Like an airport control tower managing planes (containers) across runways (servers).

**Key Components in Our Setup**:

#### Pods

- Smallest deployable unit
- Contains one or more containers
- In QuizMentor: Each service runs in its own pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: learning-orchestrator
spec:
  containers:
    - name: app
      image: quizmentor/learning:latest
      ports:
        - containerPort: 3010
```

#### Deployments

- Manages multiple pod replicas
- Handles updates and rollbacks
- Ensures desired number of pods are running

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-orchestrator
spec:
  replicas: 2 # Run 2 copies for reliability
  selector:
    matchLabels:
      app: learning-orchestrator
  template:
    # Pod template here
```

#### Services

- Provides stable network endpoint for pods
- Load balances traffic between pod replicas
- Types: ClusterIP, NodePort, LoadBalancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: learning-orchestrator
spec:
  selector:
    app: learning-orchestrator # Route to pods with this label
  ports:
    - port: 3010 # Service port
      targetPort: 3010 # Container port
```

#### Namespaces

- Virtual clusters within Kubernetes
- Isolates resources and access
- We use: `quizmentor-app`, `quizmentor-data`

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: quizmentor-app
  labels:
    istio-injection: enabled # Auto-inject Istio sidecar
```

### 3. Istio Service Mesh

**What it is**: A layer that manages communication between services.

**Real-world analogy**: Like a postal system - handles routing, security, tracking.

**Features We Use**:

- **Traffic Management**: Route requests intelligently
- **Security**: Encrypt service-to-service communication
- **Observability**: Track and trace all requests

### 4. Kind (Kubernetes in Docker)

**What it is**: Runs Kubernetes clusters in Docker containers.

**Why we use it**: Perfect for local development - lightweight, fast, disposable.

---

## 🏗️ Architecture Deep Dive

### Our Microservices Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                      │
│                  http://localhost:3000                    │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 API Gateway (Port 8080)                   │
│              (Routes requests to services)                │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Learning     │  │    Adaptive     │  │     Bloom's     │
│  Orchestrator   │  │     Engine      │  │    Validator    │
│   Port: 3010    │  │   Port: 3011    │  │   Port: 3012    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
        ┌─────────────────────────────────────────┐
        │            Data Layer                    │
        │  PostgreSQL (5432) | Redis (6379)       │
        └─────────────────────────────────────────┘
```

### Service Responsibilities

1. **API Gateway** (`port 8080`)
   - Entry point for all requests
   - Routes to appropriate microservice
   - Handles authentication
   - Rate limiting

2. **Learning Orchestrator** (`port 3010`)
   - Manages learning sessions
   - Coordinates between services
   - Generates learning paths
   - Tracks progress

3. **Adaptive Engine** (`port 3011`)
   - ML algorithms for personalization
   - Adjusts difficulty dynamically
   - Implements spaced repetition
   - Flow state optimization

4. **Bloom's Validator** (`port 3012`)
   - Validates question quality
   - Classifies cognitive levels
   - Ensures pedagogical alignment
   - Provides improvement suggestions

---

## 🔄 How Everything Works Together

### Request Flow Example

Let's trace a request through the system:

```
1. User clicks "Start Learning Session" in browser
   ↓
2. Frontend sends POST request to API Gateway
   POST http://localhost:8080/api/sessions/start
   ↓
3. API Gateway routes to Learning Orchestrator
   http://learning-orchestrator:3010/sessions/start
   ↓
4. Learning Orchestrator calls Adaptive Engine
   http://adaptive-engine:3011/user/profile
   ↓
5. Adaptive Engine queries Redis for cached data
   redis://redis:6379/user:123:profile
   ↓
6. Learning Orchestrator calls Bloom Validator
   http://bloom-validator:3012/validate/questions
   ↓
7. Results aggregated and returned to user
```

### Kubernetes Orchestration

```yaml
# When you run: kubectl apply -f deployment.yaml

1. Kubernetes API receives the manifest
↓
2. Scheduler finds suitable node for pod
↓
3. Kubelet on node pulls Docker image
↓
4. Container runtime starts container
↓
5. Service discovery updates endpoints
↓
6. Pod is ready to receive traffic
```

### Local Development with Kind

```bash
# When you run: ./scripts/local-dev-setup.sh setup

1. Kind creates Docker containers as "nodes"
   ↓
2. Kubernetes control plane starts in container
   ↓
3. NGINX Ingress controller deployed
   ↓
4. Our services deployed to cluster
   ↓
5. Port mappings established to localhost
   ↓
6. Services accessible from host machine
```

---

## 📖 Step-by-Step Walkthrough

### Step 1: Understanding the Cluster Creation

```bash
kind create cluster --config kind-config.yaml
```

**What happens**:

1. Docker creates a container that acts as a Kubernetes node
2. Kubernetes control plane components start:
   - API Server (receives commands)
   - Scheduler (assigns pods to nodes)
   - Controller Manager (maintains desired state)
   - etcd (stores cluster data)

### Step 2: Deploying a Service

```bash
kubectl apply -f learning-orchestrator.yaml
```

**What happens**:

1. YAML is sent to Kubernetes API
2. Deployment controller creates ReplicaSet
3. ReplicaSet creates Pods
4. Scheduler assigns Pods to nodes
5. Kubelet starts containers
6. Service creates endpoint for pods

### Step 3: Service Discovery

Services find each other using DNS:

```javascript
// In API Gateway code:
const response = await fetch('http://learning-orchestrator:3010/api/data');
// Kubernetes DNS resolves this to the service's ClusterIP
```

### Step 4: Load Balancing

When multiple pods exist:

```
Request → Service (learning-orchestrator:3010)
           ↓
    Load Balancer (Round Robin)
           ↓
    ┌──────┴──────┐
    ↓             ↓
  Pod-1         Pod-2
```

---

## 🎮 Hands-On Exercises

### Exercise 1: Explore the Cluster

```bash
# 1. List all resources
kubectl get all -n quizmentor

# 2. Describe a pod (understand its configuration)
kubectl describe pod -n quizmentor -l app=learning-orchestrator

# 3. View logs
kubectl logs -n quizmentor -l app=learning-orchestrator

# 4. Execute into a pod
kubectl exec -it -n quizmentor deployment/learning-orchestrator -- sh
```

### Exercise 2: Scale a Service

```bash
# 1. Check current replicas
kubectl get deployment -n quizmentor learning-orchestrator

# 2. Scale up
kubectl scale deployment -n quizmentor learning-orchestrator --replicas=3

# 3. Watch pods being created
kubectl get pods -n quizmentor -w

# 4. Test load balancing
for i in {1..10}; do curl http://localhost:3010/health; done
```

### Exercise 3: Update a Service

```bash
# 1. Change an environment variable
kubectl set env deployment/learning-orchestrator -n quizmentor LOG_LEVEL=debug

# 2. Watch the rollout
kubectl rollout status deployment/learning-orchestrator -n quizmentor

# 3. Check rollout history
kubectl rollout history deployment/learning-orchestrator -n quizmentor
```

### Exercise 4: Debug Issues

```bash
# 1. Check if pod is running
kubectl get pods -n quizmentor

# 2. If pod is in Error/CrashLoopBackOff
kubectl logs -n quizmentor <pod-name> --previous

# 3. Check events
kubectl get events -n quizmentor --sort-by='.lastTimestamp'

# 4. Check resource usage
kubectl top pods -n quizmentor
```

---

## 📚 Learning Resources

### Kubernetes Fundamentals

1. **Official Kubernetes Basics**
   - [Kubernetes Basics Tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
   - Interactive, hands-on learning

2. **Kubernetes Concepts**
   - [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
   - [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
   - [Services](https://kubernetes.io/docs/concepts/services-networking/service/)

3. **Video Courses**
   - [Kubernetes Course - Full Beginners Tutorial](https://www.youtube.com/watch?v=X48VuDVv0do)
   - [Kubernetes Explained in 100 Seconds](https://www.youtube.com/watch?v=PziYflu8cB8)

### Docker & Containers

1. **Docker Fundamentals**
   - [Docker Getting Started](https://docs.docker.com/get-started/)
   - [Docker for Beginners](https://docker-curriculum.com/)

2. **Container Concepts**
   - [What are Containers?](https://www.docker.com/resources/what-container/)
   - [Containers vs VMs](https://www.docker.com/blog/containers-vs-virtual-machines/)

### Microservices Architecture

1. **Microservices Patterns**
   - [Microservices.io](https://microservices.io/)
   - [Martin Fowler on Microservices](https://martinfowler.com/articles/microservices.html)

2. **Best Practices**
   - [12 Factor App](https://12factor.net/)
   - [Microservices Best Practices](https://www.nginx.com/blog/microservices-at-netflix-architectural-best-practices/)

### Service Mesh (Istio)

1. **Istio Fundamentals**
   - [Istio Getting Started](https://istio.io/latest/docs/setup/getting-started/)
   - [Istio Concepts](https://istio.io/latest/docs/concepts/)

2. **Traffic Management**
   - [Istio Traffic Management](https://istio.io/latest/docs/concepts/traffic-management/)
   - [Istio by Example](https://istiobyexample.dev/)

### Kind (Local Kubernetes)

1. **Kind Documentation**
   - [Kind Quick Start](https://kind.sigs.k8s.io/docs/user/quick-start/)
   - [Kind Configuration](https://kind.sigs.k8s.io/docs/user/configuration/)

---

## 🧭 Learning Path

### Week 1: Containers & Docker

- [ ] Understand what containers are
- [ ] Learn Docker basics (build, run, push)
- [ ] Create your first Dockerfile
- [ ] Run QuizMentor services as containers

### Week 2: Kubernetes Basics

- [ ] Understand Kubernetes architecture
- [ ] Learn about Pods, Deployments, Services
- [ ] Deploy a simple app to Kubernetes
- [ ] Practice with kubectl commands

### Week 3: Microservices

- [ ] Understand microservices vs monoliths
- [ ] Learn service communication patterns
- [ ] Implement service discovery
- [ ] Handle distributed system challenges

### Week 4: Advanced Topics

- [ ] Service mesh concepts (Istio)
- [ ] Monitoring and observability
- [ ] CI/CD for Kubernetes
- [ ] Production best practices

---

## 💡 Key Takeaways

1. **Kubernetes abstracts infrastructure complexity**
   - You define desired state, Kubernetes maintains it
   - Self-healing, auto-scaling capabilities

2. **Microservices enable independent scaling**
   - Each service can be developed, deployed, scaled independently
   - Fault isolation - one service failure doesn't bring down everything

3. **Service mesh adds intelligence to network**
   - Traffic management, security, observability
   - Without changing application code

4. **Local development mirrors production**
   - Kind gives you real Kubernetes locally
   - Test everything before deploying to production

---

## 🚀 Next Steps

1. **Experiment with the local setup**

   ```bash
   ./scripts/local-dev-setup.sh setup
   ```

2. **Modify and redeploy services**
   - Change code
   - Build new image
   - Deploy to cluster

3. **Monitor and debug**
   - View logs
   - Check metrics
   - Trace requests

4. **Scale and optimize**
   - Add more replicas
   - Configure resource limits
   - Implement caching

---

## ❓ Frequently Asked Questions

### Q: Why microservices instead of monolith?

**A**: Microservices allow:

- Independent scaling (scale only what needs scaling)
- Technology diversity (use best tool for each job)
- Fault isolation (one service failure doesn't affect others)
- Independent deployment (update services without downtime)

### Q: Why Kubernetes?

**A**: Kubernetes provides:

- Container orchestration (manages hundreds of containers)
- Self-healing (restarts failed containers)
- Service discovery (services find each other automatically)
- Load balancing (distributes traffic)
- Rolling updates (zero-downtime deployments)

### Q: Why use Kind for local development?

**A**: Kind offers:

- Real Kubernetes API (same as production)
- Lightweight (runs in Docker)
- Fast iteration (create/destroy clusters quickly)
- Cost-effective (no cloud resources needed)

### Q: How do services communicate?

**A**: Services communicate via:

- DNS names (e.g., `http://learning-orchestrator:3010`)
- Kubernetes resolves names to IP addresses
- Service mesh can add security, routing, retry logic

### Q: What happens if a pod crashes?

**A**: Kubernetes automatically:

1. Detects pod failure (health checks)
2. Removes failed pod from service endpoints
3. Creates new pod to maintain replica count
4. Routes traffic to healthy pods only

---

## 📝 Notes Section

Use this space to track your learning:

```markdown
### My Learning Notes

#### Date: \_\_\_\_

- What I learned:
- Questions I have:
- Things to explore:

#### Experiments Tried:

- [ ] Scaled a service
- [ ] Crashed a pod and watched recovery
- [ ] Updated a deployment
- [ ] Debugged using logs

#### Concepts Understood:

- [ ] Containers vs VMs
- [ ] Pods and Deployments
- [ ] Service discovery
- [ ] Load balancing
```

---

**Remember**: The best way to learn is by doing. Start with the local setup, break things, fix them, and understand why they work the way they do!

Happy Learning! 🎓
