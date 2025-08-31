# QuizMentor Deployment Guide - Reusing DevMentor K8s/Istio Infrastructure

## 📚 Overview

This guide explains how to deploy the QuizMentor Self-Learning System on the existing DevMentor Kubernetes cluster with Istio service mesh. QuizMentor leverages DevMentor's infrastructure to minimize overhead and maximize resource sharing.

## 🎯 Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────┐
│                    Istio Ingress Gateway                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   QuizMentor API Gateway                      │
│                    (Port: 8080/9080)                         │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Learning     │  │    Adaptive     │  │     Bloom's     │
│  Orchestrator   │  │     Engine      │  │    Validator    │
│   (Port: 3010)  │  │  (Port: 3011)   │  │  (Port: 3012)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
        ┌──────────────────────────────────────────┐
        │         Shared Data Layer                │
        │  • PostgreSQL (DevMentor/QuizMentor)     │
        │  • Redis (DevMentor/QuizMentor)          │
        │  • Qdrant (DevMentor/QuizMentor)         │
        └──────────────────────────────────────────┘
```

### Namespaces

- `quizmentor-app`: Application services (with Istio injection)
- `quizmentor-data`: Data services (with Istio injection)
- `quizmentor-admin`: Admin tools (with Istio injection)
- Shared: `istio-system`, `devmentor-data` (reused)

## 🚀 Quick Start

### Prerequisites

1. DevMentor K8s cluster deployed
2. Istio installed and configured
3. Docker running locally
4. kubectl configured

### One-Command Deployment

```bash
# From QuizMentor directory
./scripts/deploy-quizmentor.sh deploy
```

## 📋 Step-by-Step Deployment

### 1. Verify DevMentor Infrastructure

```bash
# Check cluster
kubectl cluster-info

# Check DevMentor namespaces
kubectl get ns | grep devmentor

# Check Istio
kubectl get ns istio-system
kubectl -n istio-system get pods

# Check monitoring stack
kubectl -n istio-system get svc | grep -E "grafana|kiali|jaeger"
```

### 2. Deploy QuizMentor

```bash
# Create namespaces
kubectl apply -f k8s/namespaces.yaml

# Deploy services
kubectl apply -f k8s/deployments/

# Configure Istio
kubectl apply -f k8s/istio/
```

### 3. Verify Deployment

```bash
# Check pods
kubectl -n quizmentor-app get pods

# Check services
kubectl -n quizmentor-app get svc

# Check Istio configuration
kubectl -n quizmentor-app get virtualservice,destinationrule,gateway
```

### 4. Access Services

```bash
# Setup port forwarding
kubectl -n quizmentor-app port-forward svc/quizmentor-gateway 9080:8080 &

# Test API
curl http://localhost:9080/health

# Access monitoring
kubectl -n istio-system port-forward svc/kiali 20001:20001 &
kubectl -n istio-system port-forward svc/grafana 3000:3000 &
```

## 🔧 Configuration

### Environment Variables

Each service can be configured via environment variables in the deployment manifests:

#### Learning Orchestrator

- `ADAPTIVE_ENGINE_URL`: URL of adaptive engine service
- `BLOOM_VALIDATOR_URL`: URL of Bloom's taxonomy validator
- `POSTGRES_HOST`: PostgreSQL hostname
- `REDIS_HOST`: Redis hostname
- `QDRANT_HOST`: Qdrant vector DB hostname

#### Adaptive Engine

- `ML_MODEL_PATH`: Path to ML models
- `FLOW_STATE_THRESHOLD`: Flow state detection threshold (0.0-1.0)
- `SPACED_REPETITION_ENABLED`: Enable spaced repetition algorithm

#### Bloom Validator

- `VALIDATION_THRESHOLD`: Validation confidence threshold
- `COGNITIVE_COMPLEXITY_ENABLED`: Enable complexity analysis
- `PEDAGOGICAL_ALIGNMENT_CHECK`: Enable pedagogical checks

### Resource Sharing with DevMentor

QuizMentor automatically detects and reuses DevMentor's data services:

```yaml
# If DevMentor PostgreSQL exists, QuizMentor uses ExternalName service:
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: quizmentor-data
spec:
  type: ExternalName
  externalName: postgresql.devmentor-data.svc.cluster.local
```

## 📊 Monitoring & Observability

### Grafana Dashboards

Access at http://localhost:3000

- Default credentials: admin/admin
- Import QuizMentor dashboards from `k8s/monitoring/dashboards/`

### Kiali Service Mesh

Access at http://localhost:20001

- View service topology
- Monitor traffic flow
- Detect issues

### Jaeger Tracing

Access at http://localhost:16686

- Trace requests across services
- Identify bottlenecks
- Debug latency issues

### Custom Metrics

QuizMentor exposes custom metrics:

- `quizmentor_learning_sessions_total`
- `quizmentor_bloom_validations_total`
- `quizmentor_adaptive_adjustments_total`
- `quizmentor_flow_state_achieved_total`

## 🛠️ Operations

### Scaling Services

```bash
# Scale learning orchestrator
kubectl -n quizmentor-app scale deployment/learning-orchestrator --replicas=3

# Scale adaptive engine
kubectl -n quizmentor-app scale deployment/adaptive-engine --replicas=3

# Autoscaling
kubectl -n quizmentor-app autoscale deployment/learning-orchestrator \
  --min=2 --max=10 --cpu-percent=70
```

### Rolling Updates

```bash
# Update image
kubectl -n quizmentor-app set image deployment/learning-orchestrator \
  learning-orchestrator=quizmentor/learning-orchestrator:v2.0

# Check rollout status
kubectl -n quizmentor-app rollout status deployment/learning-orchestrator

# Rollback if needed
kubectl -n quizmentor-app rollout undo deployment/learning-orchestrator
```

### Debugging

```bash
# View logs
kubectl -n quizmentor-app logs -l app=learning-orchestrator --tail=100

# Execute into pod
kubectl -n quizmentor-app exec -it <pod-name> -- sh

# Check Istio sidecar
kubectl -n quizmentor-app logs <pod-name> -c istio-proxy

# Port-forward for debugging
kubectl -n quizmentor-app port-forward <pod-name> 3010:3010
```

## 🔄 Traffic Management

### Canary Deployments

```yaml
# Deploy v2 alongside v1
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: learning-orchestrator-canary
spec:
  http:
    - match:
        - headers:
            canary:
              exact: 'true'
      route:
        - destination:
            host: learning-orchestrator
            subset: v2
          weight: 100
    - route:
        - destination:
            host: learning-orchestrator
            subset: v1
          weight: 90
        - destination:
            host: learning-orchestrator
            subset: v2
          weight: 10
```

### Circuit Breaking

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: learning-orchestrator-cb
spec:
  host: learning-orchestrator
  trafficPolicy:
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
```

## 🔐 Security

### mTLS Between Services

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: quizmentor-app
spec:
  mtls:
    mode: STRICT
```

### Authorization Policies

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: learning-orchestrator-authz
  namespace: quizmentor-app
spec:
  selector:
    matchLabels:
      app: learning-orchestrator
  rules:
    - from:
        - source:
            principals: ['cluster.local/ns/quizmentor-app/sa/quizmentor-gateway']
```

## 📝 Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod events
kubectl -n quizmentor-app describe pod <pod-name>

# Check resource availability
kubectl top nodes
kubectl -n quizmentor-app top pods
```

#### Service Mesh Issues

```bash
# Check Istio injection
kubectl -n quizmentor-app get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].name}{"\n"}{end}'

# Verify sidecar injection
kubectl label namespace quizmentor-app istio-injection=enabled --overwrite

# Restart pods to inject sidecar
kubectl -n quizmentor-app rollout restart deployment
```

#### Database Connection Issues

```bash
# Test PostgreSQL connection
kubectl -n quizmentor-data run -it --rm psql --image=postgres:14 --restart=Never -- \
  psql -h postgresql -U quizmentor -d quizmentor

# Test Redis connection
kubectl -n quizmentor-data run -it --rm redis-cli --image=redis:7 --restart=Never -- \
  redis-cli -h redis ping
```

## 🧹 Cleanup

### Remove QuizMentor Only

```bash
./scripts/deploy-quizmentor.sh delete

# Or manually
kubectl delete namespace quizmentor-app quizmentor-data quizmentor-admin
```

### Keep DevMentor Infrastructure

The DevMentor cluster and Istio remain intact for future deployments.

## 📚 Additional Resources

### Scripts

- `scripts/deploy-quizmentor.sh`: Main deployment script
- `scripts/test-integration.sh`: Run integration tests
- `scripts/load-test.sh`: Performance testing

### Documentation

- [Istio Documentation](https://istio.io/latest/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [DevMentor Operations Guide](../devmentor/docs/infrastructure/operations/)

### Support

- GitHub Issues: [QuizMentor Issues](https://github.com/yourusername/quizmentor/issues)
- Slack: #quizmentor-support
- Email: quizmentor-ops@example.com

## 🎯 Best Practices

1. **Resource Sharing**: Always check if DevMentor services can be reused
2. **Monitoring**: Set up alerts for critical services
3. **Scaling**: Use HPA for production workloads
4. **Security**: Enable mTLS and authorization policies
5. **Testing**: Run integration tests before production deployment
6. **Documentation**: Keep deployment configurations in version control

## 🚦 Production Readiness Checklist

- [ ] All pods running and ready
- [ ] Health checks passing
- [ ] Istio sidecar injection working
- [ ] Monitoring dashboards configured
- [ ] Alerts set up
- [ ] Backup strategy defined
- [ ] Security policies applied
- [ ] Performance tested
- [ ] Documentation updated
- [ ] Runbooks created

---

**Last Updated**: 2025-08-25
**Version**: 1.0.0
**Maintainer**: QuizMentor Team
