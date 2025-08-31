#!/bin/bash

# QuizMentor Kubernetes Deployment Script
# This script deploys the complete self-learning system to Kubernetes

set -e

NAMESPACE=${NAMESPACE:-quizmentor-prod}
ENVIRONMENT=${ENVIRONMENT:-production}
CLUSTER_NAME=${CLUSTER_NAME:-quizmentor-cluster}

echo "🚀 Deploying QuizMentor Self-Learning System to Kubernetes"
echo "Namespace: $NAMESPACE"
echo "Environment: $ENVIRONMENT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists kubectl; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

if ! command_exists helm; then
    print_warning "helm is not installed. Some features may not work."
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please configure kubectl."
    exit 1
fi

print_status "Prerequisites check passed"
echo ""

# Create namespace
echo "Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
print_status "Namespace created/updated: $NAMESPACE"
echo ""

# Deploy secrets
echo "Deploying secrets..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
  namespace: $NAMESPACE
type: Opaque
stringData:
  url: "postgresql://quizmentor:password@postgres-primary:5432/quizmentor"
  username: "quizmentor"
  password: "changeme"
---
apiVersion: v1
kind: Secret
metadata:
  name: redis-credentials
  namespace: $NAMESPACE
type: Opaque
stringData:
  url: "redis://redis-cluster:6379"
  password: "changeme"
---
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
  namespace: $NAMESPACE
type: Opaque
stringData:
  secret: "your-jwt-secret-here"
EOF
print_status "Secrets deployed"
echo ""

# Deploy ConfigMaps
echo "Deploying ConfigMaps..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: $NAMESPACE
data:
  NODE_ENV: "$ENVIRONMENT"
  LOG_LEVEL: "info"
  PORT: "3000"
  ENABLE_METRICS: "true"
  ENABLE_TRACING: "true"
EOF
print_status "ConfigMaps deployed"
echo ""

# Deploy Services
echo "Deploying core services..."

# Learning Orchestrator
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-orchestrator
  namespace: $NAMESPACE
  labels:
    app: learning-orchestrator
    component: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: learning-orchestrator
  template:
    metadata:
      labels:
        app: learning-orchestrator
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
      - name: app
        image: node:18-alpine
        command: ["npm", "start"]
        workingDir: /app
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        volumeMounts:
        - name: app-code
          mountPath: /app
      volumes:
      - name: app-code
        configMap:
          name: app-code
---
apiVersion: v1
kind: Service
metadata:
  name: learning-orchestrator
  namespace: $NAMESPACE
spec:
  selector:
    app: learning-orchestrator
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: metrics
    port: 9090
    targetPort: 9090
EOF
print_status "Learning Orchestrator deployed"

# Bloom Validator
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bloom-validator
  namespace: $NAMESPACE
  labels:
    app: bloom-validator
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bloom-validator
  template:
    metadata:
      labels:
        app: bloom-validator
    spec:
      containers:
      - name: app
        image: node:18-alpine
        command: ["npm", "start"]
        workingDir: /app
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: SERVICE_NAME
          value: bloom-validator
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: bloom-validator
  namespace: $NAMESPACE
spec:
  selector:
    app: bloom-validator
  ports:
  - port: 80
    targetPort: 3000
EOF
print_status "Bloom Validator deployed"

# Adaptive Engine
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adaptive-engine
  namespace: $NAMESPACE
  labels:
    app: adaptive-engine
spec:
  replicas: 2
  selector:
    matchLabels:
      app: adaptive-engine
  template:
    metadata:
      labels:
        app: adaptive-engine
    spec:
      containers:
      - name: app
        image: node:18-alpine
        command: ["npm", "start"]
        workingDir: /app
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: SERVICE_NAME
          value: adaptive-engine
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: adaptive-engine
  namespace: $NAMESPACE
spec:
  selector:
    app: adaptive-engine
  ports:
  - port: 80
    targetPort: 3000
EOF
print_status "Adaptive Engine deployed"
echo ""

# Deploy HorizontalPodAutoscaler
echo "Configuring autoscaling..."
cat <<EOF | kubectl apply -f -
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: learning-orchestrator-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: learning-orchestrator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
print_status "Autoscaling configured"
echo ""

# Deploy Ingress
echo "Deploying Ingress..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: quizmentor-ingress
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.quizmentor.local
    http:
      paths:
      - path: /api/learning
        pathType: Prefix
        backend:
          service:
            name: learning-orchestrator
            port:
              number: 80
      - path: /api/validate
        pathType: Prefix
        backend:
          service:
            name: bloom-validator
            port:
              number: 80
      - path: /api/adaptive
        pathType: Prefix
        backend:
          service:
            name: adaptive-engine
            port:
              number: 80
EOF
print_status "Ingress deployed"
echo ""

# Deploy Network Policies
echo "Applying network policies..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: $NAMESPACE
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-services
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      component: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
EOF
print_status "Network policies applied"
echo ""

# Deploy ServiceMonitor for Prometheus
echo "Configuring monitoring..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: prometheus-operated
  namespace: $NAMESPACE
  labels:
    app: prometheus
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    app: prometheus
  ports:
  - name: web
    port: 9090
    targetPort: 9090
EOF
print_status "Monitoring configured"
echo ""

# Check deployment status
echo "Checking deployment status..."
kubectl rollout status deployment/learning-orchestrator -n $NAMESPACE --timeout=300s || true
kubectl rollout status deployment/bloom-validator -n $NAMESPACE --timeout=300s || true
kubectl rollout status deployment/adaptive-engine -n $NAMESPACE --timeout=300s || true
echo ""

# Display deployment summary
echo "========================================="
echo "Deployment Summary"
echo "========================================="
echo ""
kubectl get deployments -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE
echo ""
kubectl get hpa -n $NAMESPACE
echo ""

print_status "Deployment complete!"
echo ""
echo "Access your application at:"
echo "  http://api.quizmentor.local"
echo ""
echo "To access locally, add this to /etc/hosts:"
echo "  127.0.0.1 api.quizmentor.local"
echo ""
echo "Then port-forward:"
echo "  kubectl port-forward -n $NAMESPACE svc/learning-orchestrator 8080:80"
echo ""
echo "Monitor with:"
echo "  kubectl get pods -n $NAMESPACE -w"
echo "  kubectl logs -n $NAMESPACE -f deployment/learning-orchestrator"
echo ""
