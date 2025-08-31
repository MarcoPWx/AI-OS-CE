#!/bin/bash

# QuizMentor Local Development Setup with Kind
# This script sets up a lightweight local environment for testing and frontend development

set -e

echo "🎓 QuizMentor Local Development Environment"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="quizmentor-local"
NAMESPACE="quizmentor"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${MAGENTA}[SUCCESS]${NC} $1"
}

print_url() {
    echo -e "${CYAN}[URL]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    elif ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Check kind
    if ! command -v kind &> /dev/null; then
        missing_deps+=("kind")
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # If missing dependencies, provide installation instructions
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Installation instructions (macOS):"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                docker)
                    echo "  Docker: Download from https://www.docker.com/products/docker-desktop"
                    ;;
                kind)
                    echo "  kind: brew install kind"
                    ;;
                kubectl)
                    echo "  kubectl: brew install kubectl"
                    ;;
                node)
                    echo "  Node.js: brew install node or download from https://nodejs.org"
                    ;;
            esac
        done
        exit 1
    fi
    
    print_success "All prerequisites installed ✅"
}

# Create kind cluster
create_cluster() {
    print_step "Creating local Kubernetes cluster..."
    
    # Check if cluster already exists
    if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
        print_warning "Cluster '${CLUSTER_NAME}' already exists."
        read -p "Delete and recreate? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kind delete cluster --name ${CLUSTER_NAME}
        else
            print_status "Using existing cluster"
            return
        fi
    fi
    
    # Create cluster configuration
    cat > /tmp/kind-config.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ${CLUSTER_NAME}
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  # API Gateway
  - containerPort: 30080
    hostPort: 8080
    protocol: TCP
  # Frontend Dev Server
  - containerPort: 30300
    hostPort: 3000
    protocol: TCP
  # Learning Orchestrator (Direct Access)
  - containerPort: 30100
    hostPort: 3010
    protocol: TCP
  # Adaptive Engine (Direct Access)
  - containerPort: 30110
    hostPort: 3011
    protocol: TCP
  # Bloom Validator (Direct Access)
  - containerPort: 30120
    hostPort: 3012
    protocol: TCP
  # PostgreSQL
  - containerPort: 30432
    hostPort: 5432
    protocol: TCP
  # Redis
  - containerPort: 30379
    hostPort: 6379
    protocol: TCP
EOF
    
    # Create the cluster
    kind create cluster --config /tmp/kind-config.yaml
    
    # Set kubectl context
    kubectl cluster-info --context kind-${CLUSTER_NAME}
    
    print_success "Kubernetes cluster created successfully 🚀"
}

# Install NGINX Ingress (lightweight alternative to Istio for local dev)
install_ingress() {
    print_step "Installing NGINX Ingress Controller..."
    
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
    
    # Wait for ingress to be ready
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=90s
    
    print_success "Ingress controller installed ✅"
}

# Create namespace
create_namespace() {
    print_step "Creating QuizMentor namespace..."
    
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Namespace created ✅"
}

# Deploy local database services
deploy_databases() {
    print_step "Deploying local database services..."
    
    # PostgreSQL
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: ${NAMESPACE}
data:
  POSTGRES_DB: quizmentor
  POSTGRES_USER: quizmentor
  POSTGRES_PASSWORD: localdev123
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgresql
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:14-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - configMapRef:
            name: postgres-config
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 5432
    targetPort: 5432
    nodePort: 30432
  selector:
    app: postgresql
EOF
    
    # Redis
    cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 6379
    targetPort: 6379
    nodePort: 30379
  selector:
    app: redis
EOF
    
    print_success "Database services deployed ✅"
}

# Deploy QuizMentor services
deploy_services() {
    print_step "Deploying QuizMentor services..."
    
    # Build and load Docker images
    print_status "Building Docker images..."
    
    # Create a simple Node.js Dockerfile if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/Dockerfile" ]; then
        cat > $PROJECT_ROOT/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3010 3011 3012 8080
CMD ["node", "server.js"]
EOF
    fi
    
    # Build images
    docker build -t quizmentor/services:latest $PROJECT_ROOT
    
    # Load images into kind
    kind load docker-image quizmentor/services:latest --name ${CLUSTER_NAME}
    
    # Deploy services
    cat <<EOF | kubectl apply -f -
# Learning Orchestrator
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-orchestrator
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: learning-orchestrator
  template:
    metadata:
      labels:
        app: learning-orchestrator
    spec:
      containers:
      - name: learning-orchestrator
        image: quizmentor/services:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3010
        env:
        - name: SERVICE_NAME
          value: learning-orchestrator
        - name: PORT
          value: "3010"
        - name: NODE_ENV
          value: development
        - name: POSTGRES_HOST
          value: postgresql
        - name: POSTGRES_PORT
          value: "5432"
        - name: POSTGRES_DB
          value: quizmentor
        - name: POSTGRES_USER
          value: quizmentor
        - name: POSTGRES_PASSWORD
          value: localdev123
        - name: REDIS_HOST
          value: redis
        - name: REDIS_PORT
          value: "6379"
        command: ["node"]
        args: ["services/selfLearningOrchestrator.js"]
---
apiVersion: v1
kind: Service
metadata:
  name: learning-orchestrator
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 3010
    targetPort: 3010
    nodePort: 30100
  selector:
    app: learning-orchestrator
---
# Adaptive Engine
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adaptive-engine
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: adaptive-engine
  template:
    metadata:
      labels:
        app: adaptive-engine
    spec:
      containers:
      - name: adaptive-engine
        image: quizmentor/services:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3011
        env:
        - name: SERVICE_NAME
          value: adaptive-engine
        - name: PORT
          value: "3011"
        - name: NODE_ENV
          value: development
        - name: POSTGRES_HOST
          value: postgresql
        - name: REDIS_HOST
          value: redis
        command: ["node"]
        args: ["services/adaptiveLearningEngine.js"]
---
apiVersion: v1
kind: Service
metadata:
  name: adaptive-engine
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 3011
    targetPort: 3011
    nodePort: 30110
  selector:
    app: adaptive-engine
---
# Bloom Validator
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bloom-validator
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: bloom-validator
  template:
    metadata:
      labels:
        app: bloom-validator
    spec:
      containers:
      - name: bloom-validator
        image: quizmentor/services:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3012
        env:
        - name: SERVICE_NAME
          value: bloom-validator
        - name: PORT
          value: "3012"
        - name: NODE_ENV
          value: development
        command: ["node"]
        args: ["services/bloomsTaxonomyValidator.js"]
---
apiVersion: v1
kind: Service
metadata:
  name: bloom-validator
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 3012
    targetPort: 3012
    nodePort: 30120
  selector:
    app: bloom-validator
---
# API Gateway
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: quizmentor/services:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 8080
        env:
        - name: SERVICE_NAME
          value: api-gateway
        - name: PORT
          value: "8080"
        - name: NODE_ENV
          value: development
        - name: LEARNING_ORCHESTRATOR_URL
          value: http://learning-orchestrator:3010
        - name: ADAPTIVE_ENGINE_URL
          value: http://adaptive-engine:3011
        - name: BLOOM_VALIDATOR_URL
          value: http://bloom-validator:3012
        command: ["node"]
        args: ["server.js"]
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
  selector:
    app: api-gateway
EOF
    
    print_success "QuizMentor services deployed ✅"
}

# Setup ingress rules
setup_ingress() {
    print_step "Setting up ingress rules..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: quizmentor-ingress
  namespace: ${NAMESPACE}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /\$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: quizmentor.local
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 8080
      - path: /learning(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: learning-orchestrator
            port:
              number: 3010
      - path: /adaptive(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: adaptive-engine
            port:
              number: 3011
      - path: /bloom(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: bloom-validator
            port:
              number: 3012
EOF
    
    print_success "Ingress rules configured ✅"
}

# Create frontend integration config
create_frontend_config() {
    print_step "Creating frontend integration config..."
    
    cat > $PROJECT_ROOT/frontend-config.json << EOF
{
  "development": {
    "apiGateway": "http://localhost:8080",
    "services": {
      "learningOrchestrator": "http://localhost:3010",
      "adaptiveEngine": "http://localhost:3011",
      "bloomValidator": "http://localhost:3012"
    },
    "database": {
      "postgresql": {
        "host": "localhost",
        "port": 5432,
        "database": "quizmentor",
        "username": "quizmentor",
        "password": "localdev123"
      },
      "redis": {
        "host": "localhost",
        "port": 6379
      }
    }
  }
}
EOF
    
    # Create .env file for frontend
    cat > $PROJECT_ROOT/.env.local << EOF
# QuizMentor Local Development Environment
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_LEARNING_API=http://localhost:3010
NEXT_PUBLIC_ADAPTIVE_API=http://localhost:3011
NEXT_PUBLIC_BLOOM_API=http://localhost:3012

# Database connections (for backend services)
DATABASE_URL=postgresql://quizmentor:localdev123@localhost:5432/quizmentor
REDIS_URL=redis://localhost:6379

# Feature flags
NEXT_PUBLIC_ENABLE_ADAPTIVE_LEARNING=true
NEXT_PUBLIC_ENABLE_BLOOM_VALIDATION=true
NEXT_PUBLIC_ENABLE_FLOW_STATE=true
EOF
    
    print_success "Frontend configuration created ✅"
}

# Wait for services
wait_for_services() {
    print_step "Waiting for services to be ready..."
    
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/postgresql
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/redis
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/api-gateway
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/learning-orchestrator
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/adaptive-engine
    kubectl -n ${NAMESPACE} wait --for=condition=available --timeout=120s deployment/bloom-validator
    
    print_success "All services are ready! ✅"
}

# Show status and URLs
show_status() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║         🎓 QuizMentor Local Development Environment          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    print_status "Service Status:"
    kubectl -n ${NAMESPACE} get pods
    echo ""
    
    print_status "Access URLs:"
    print_url "API Gateway:           http://localhost:8080"
    print_url "Learning Orchestrator: http://localhost:3010"
    print_url "Adaptive Engine:       http://localhost:3011"
    print_url "Bloom Validator:       http://localhost:3012"
    print_url "PostgreSQL:            localhost:5432 (user: quizmentor, pass: localdev123)"
    print_url "Redis:                 localhost:6379"
    echo ""
    
    print_status "Frontend Integration:"
    echo "  1. Environment file created: .env.local"
    echo "  2. Config file created: frontend-config.json"
    echo "  3. Start your frontend: npm run dev"
    echo ""
    
    print_status "Test the setup:"
    echo "  curl http://localhost:8080/health"
    echo "  curl http://localhost:3010/health"
    echo ""
    
    print_status "View logs:"
    echo "  kubectl -n ${NAMESPACE} logs -f deployment/api-gateway"
    echo "  kubectl -n ${NAMESPACE} logs -f deployment/learning-orchestrator"
    echo ""
    
    print_success "Local development environment is ready! 🚀"
}

# Cleanup function
cleanup() {
    print_warning "Cleaning up QuizMentor local environment..."
    kind delete cluster --name ${CLUSTER_NAME}
    print_success "Cleanup completed"
}

# Main execution
main() {
    case "${1:-setup}" in
        setup)
            check_prerequisites
            create_cluster
            install_ingress
            create_namespace
            deploy_databases
            deploy_services
            setup_ingress
            create_frontend_config
            wait_for_services
            show_status
            ;;
        
        status)
            show_status
            ;;
        
        logs)
            SERVICE="${2:-api-gateway}"
            kubectl -n ${NAMESPACE} logs -f deployment/${SERVICE}
            ;;
        
        restart)
            kubectl -n ${NAMESPACE} rollout restart deployment
            wait_for_services
            show_status
            ;;
        
        cleanup|delete)
            cleanup
            ;;
        
        *)
            echo "Usage: $0 {setup|status|logs [service]|restart|cleanup}"
            echo ""
            echo "Commands:"
            echo "  setup    - Create cluster and deploy all services"
            echo "  status   - Show current status and URLs"
            echo "  logs     - View logs for a service"
            echo "  restart  - Restart all services"
            echo "  cleanup  - Delete cluster and clean up"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
