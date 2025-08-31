#!/bin/bash

# QuizMentor Deployment Script - Reusing DevMentor's K8s/Istio Infrastructure
# This script deploys QuizMentor services on the existing DevMentor Kubernetes cluster

set -e

echo "🎓 QuizMentor Self-Learning System Deployment"
echo "=============================================="
echo "Reusing DevMentor's Kubernetes + Istio Infrastructure"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE_APP="quizmentor-app"
NAMESPACE_DATA="quizmentor-data"
NAMESPACE_ADMIN="quizmentor-admin"
DEVMENTOR_NAMESPACE="devmentor-app"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
K8S_DIR="$SCRIPT_DIR/../k8s"

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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl first."
        exit 1
    fi
    
    # Check if connected to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Not connected to a Kubernetes cluster."
        print_warning "Run the DevMentor deployment script first:"
        echo "  ../devmentor/scripts/deploy-k8s-istio.sh deploy"
        exit 1
    fi
    
    # Check if DevMentor cluster exists
    if ! kubectl get namespace ${DEVMENTOR_NAMESPACE} &> /dev/null; then
        print_warning "DevMentor namespace not found. Checking for existing cluster..."
        
        # Check if it's the kind cluster
        if kubectl config current-context | grep -q "kind-devmentor"; then
            print_status "Connected to DevMentor kind cluster"
        else
            print_error "Please ensure DevMentor infrastructure is deployed first"
            exit 1
        fi
    fi
    
    # Check if Istio is installed
    if ! kubectl get namespace istio-system &> /dev/null; then
        print_error "Istio not found. Please deploy DevMentor infrastructure with Istio first."
        exit 1
    fi
    
    print_success "Prerequisites check completed ✅"
}

# Create QuizMentor namespaces
create_namespaces() {
    print_step "Creating QuizMentor namespaces..."
    
    kubectl apply -f ${K8S_DIR}/namespaces.yaml
    
    # Wait for namespaces to be ready
    kubectl wait --for=condition=Active namespace/${NAMESPACE_APP} --timeout=30s
    kubectl wait --for=condition=Active namespace/${NAMESPACE_DATA} --timeout=30s
    kubectl wait --for=condition=Active namespace/${NAMESPACE_ADMIN} --timeout=30s
    
    print_success "Namespaces created successfully 📦"
}

# Deploy shared data services (reuse from DevMentor or create new)
deploy_data_layer() {
    print_step "Configuring data layer..."
    
    # Check if DevMentor data services exist
    if kubectl -n devmentor-data get service postgresql &> /dev/null; then
        print_status "Reusing DevMentor PostgreSQL instance"
        # Create service endpoint to point to DevMentor's PostgreSQL
        cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: ${NAMESPACE_DATA}
spec:
  type: ExternalName
  externalName: postgresql.devmentor-data.svc.cluster.local
  ports:
  - port: 5432
    targetPort: 5432
EOF
    else
        print_warning "PostgreSQL not found in DevMentor. Deploying new instance..."
        # Deploy PostgreSQL for QuizMentor
        cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: ${NAMESPACE_DATA}
spec:
  serviceName: postgresql
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
          name: postgres
        env:
        - name: POSTGRES_DB
          value: quizmentor
        - name: POSTGRES_USER
          value: quizmentor
        - name: POSTGRES_PASSWORD
          value: quizmentor123
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: ${NAMESPACE_DATA}
spec:
  selector:
    app: postgresql
  ports:
  - port: 5432
    targetPort: 5432
EOF
    fi
    
    # Similar checks for Redis
    if kubectl -n devmentor-data get service redis &> /dev/null; then
        print_status "Reusing DevMentor Redis instance"
        cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ${NAMESPACE_DATA}
spec:
  type: ExternalName
  externalName: redis.devmentor-data.svc.cluster.local
  ports:
  - port: 6379
    targetPort: 6379
EOF
    else
        print_warning "Redis not found. Deploying new instance..."
        cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ${NAMESPACE_DATA}
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
  namespace: ${NAMESPACE_DATA}
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF
    fi
    
    # Check for Qdrant
    if kubectl -n devmentor-data get service qdrant &> /dev/null; then
        print_status "Reusing DevMentor Qdrant instance"
        cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: ${NAMESPACE_DATA}
spec:
  type: ExternalName
  externalName: qdrant.devmentor-data.svc.cluster.local
  ports:
  - port: 6333
    targetPort: 6333
EOF
    else
        print_warning "Qdrant not found. Deploying new instance..."
        cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
  namespace: ${NAMESPACE_DATA}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        - containerPort: 6334
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: ${NAMESPACE_DATA}
spec:
  selector:
    app: qdrant
  ports:
  - name: http
    port: 6333
    targetPort: 6333
  - name: grpc
    port: 6334
    targetPort: 6334
EOF
    fi
    
    print_success "Data layer configured successfully 💾"
}

# Build Docker images
build_images() {
    print_step "Building QuizMentor Docker images..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Build images
    cd $SCRIPT_DIR/..
    
    # Build each service
    if [ -f "Dockerfile" ]; then
        print_status "Building main QuizMentor image..."
        docker build -t quizmentor/api-gateway:latest .
        docker build -t quizmentor/learning-orchestrator:latest .
        docker build -t quizmentor/adaptive-engine:latest .
        docker build -t quizmentor/bloom-validator:latest .
    else
        print_warning "No Dockerfile found. Using pre-built images or creating mock images..."
        # Create mock images for testing
        docker pull node:18-alpine
        docker tag node:18-alpine quizmentor/api-gateway:latest
        docker tag node:18-alpine quizmentor/learning-orchestrator:latest
        docker tag node:18-alpine quizmentor/adaptive-engine:latest
        docker tag node:18-alpine quizmentor/bloom-validator:latest
    fi
    
    # Load images into kind cluster
    if kubectl config current-context | grep -q "kind"; then
        print_status "Loading images into kind cluster..."
        kind load docker-image quizmentor/api-gateway:latest --name devmentor
        kind load docker-image quizmentor/learning-orchestrator:latest --name devmentor
        kind load docker-image quizmentor/adaptive-engine:latest --name devmentor
        kind load docker-image quizmentor/bloom-validator:latest --name devmentor
    fi
    
    print_success "Images built and loaded successfully 🐳"
}

# Deploy QuizMentor services
deploy_services() {
    print_step "Deploying QuizMentor services..."
    
    # Deploy services
    kubectl apply -f ${K8S_DIR}/deployments/api-gateway.yaml
    kubectl apply -f ${K8S_DIR}/deployments/learning-orchestrator.yaml
    kubectl apply -f ${K8S_DIR}/deployments/adaptive-engine.yaml
    kubectl apply -f ${K8S_DIR}/deployments/bloom-validator.yaml
    
    # Wait for deployments
    print_status "Waiting for deployments to be ready..."
    kubectl -n ${NAMESPACE_APP} wait --for=condition=available --timeout=300s deployment/quizmentor-gateway
    kubectl -n ${NAMESPACE_APP} wait --for=condition=available --timeout=300s deployment/learning-orchestrator
    kubectl -n ${NAMESPACE_APP} wait --for=condition=available --timeout=300s deployment/adaptive-engine
    kubectl -n ${NAMESPACE_APP} wait --for=condition=available --timeout=300s deployment/bloom-validator
    
    print_success "Services deployed successfully 🚀"
}

# Configure Istio
configure_istio() {
    print_step "Configuring Istio service mesh..."
    
    # Apply Istio configurations
    kubectl apply -f ${K8S_DIR}/istio/quizmentor-traffic.yaml
    kubectl apply -f ${K8S_DIR}/istio/telemetry.yaml
    
    print_success "Istio configured successfully 🛡️"
}

# Setup port forwarding
setup_port_forwarding() {
    print_step "Setting up port forwarding..."
    
    # Kill existing port-forwards
    pkill -f "kubectl.*port-forward.*quizmentor" || true
    
    # Setup port-forward for API Gateway
    kubectl -n ${NAMESPACE_APP} port-forward svc/quizmentor-gateway 9080:8080 &
    
    # Setup port-forward for monitoring
    kubectl -n istio-system port-forward svc/kiali 20001:20001 &
    kubectl -n istio-system port-forward svc/grafana 3000:3000 &
    kubectl -n istio-system port-forward svc/jaeger-query 16686:16686 &
    
    print_success "Port forwarding setup completed"
    echo ""
    echo "  📚 QuizMentor API Gateway: http://localhost:9080"
    echo "  📊 Kiali Dashboard: http://localhost:20001"
    echo "  📈 Grafana: http://localhost:3000"
    echo "  🔍 Jaeger Tracing: http://localhost:16686"
}

# Show status
show_status() {
    print_step "QuizMentor Deployment Status"
    echo ""
    
    echo "Pods Status:"
    kubectl -n ${NAMESPACE_APP} get pods
    echo ""
    
    echo "Services:"
    kubectl -n ${NAMESPACE_APP} get svc
    echo ""
    
    echo "Istio Gateways:"
    kubectl -n ${NAMESPACE_APP} get gateway
    echo ""
    
    echo "Virtual Services:"
    kubectl -n ${NAMESPACE_APP} get virtualservice
}

# Main deployment flow
main() {
    case "${1:-deploy}" in
        deploy)
            check_prerequisites
            create_namespaces
            deploy_data_layer
            build_images
            deploy_services
            configure_istio
            setup_port_forwarding
            show_status
            
            print_success "🎉 QuizMentor deployment completed successfully!"
            echo ""
            echo "Next steps:"
            echo "1. Test the API: curl http://localhost:9080/health"
            echo "2. View metrics: http://localhost:3000 (Grafana)"
            echo "3. View service mesh: http://localhost:20001 (Kiali)"
            echo "4. Run tests: npm test"
            ;;
            
        delete)
            print_warning "Deleting QuizMentor deployment..."
            kubectl delete namespace ${NAMESPACE_APP} ${NAMESPACE_DATA} ${NAMESPACE_ADMIN} --ignore-not-found
            pkill -f "kubectl.*port-forward.*quizmentor" || true
            print_success "QuizMentor deployment deleted"
            ;;
            
        status)
            show_status
            ;;
            
        restart)
            print_status "Restarting QuizMentor services..."
            kubectl -n ${NAMESPACE_APP} rollout restart deployment
            ;;
            
        logs)
            SERVICE="${2:-quizmentor-gateway}"
            kubectl -n ${NAMESPACE_APP} logs -l app=${SERVICE} --tail=100 -f
            ;;
            
        *)
            echo "Usage: $0 {deploy|delete|status|restart|logs [service]}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
