# Guida Deployment - FantaContratti

## 🚀 Panoramica Deployment

Questa guida descrive come deployare la piattaforma FantaContratti in diversi ambienti: sviluppo, staging e produzione.

## 🏗️ Ambienti

### Ambiente di Sviluppo (Development)
- **Scopo**: Sviluppo locale e testing
- **Infrastruttura**: Docker Compose locale
- **Database**: PostgreSQL in container
- **Configurazione**: Hot reload, debug abilitato

### Ambiente di Staging
- **Scopo**: Testing pre-produzione
- **Infrastruttura**: Docker Compose o Kubernetes
- **Database**: PostgreSQL dedicato
- **Configurazione**: Produzione-like con logging dettagliato

### Ambiente di Produzione
- **Scopo**: Servizio live agli utenti
- **Infrastruttura**: Kubernetes o Docker Swarm
- **Database**: PostgreSQL cluster HA
- **Configurazione**: Ottimizzata per performance e sicurezza

## 🛠️ Preparazione

### Prerequisiti
- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: Per source control
- **SSL Certificates**: Per HTTPS in produzione
- **Domain Names**: DNS configurato

### Build dei Container
```bash
# Build di tutti i servizi
docker-compose -f docker/docker-compose.prod.yml build

# Build di un servizio specifico
docker build -t fantacontratti/user-service services/backend/user-service

# Build con cache disabilitata
docker-compose build --no-cache
```

## 🔧 Deployment Locale (Sviluppo)

### Setup Completo
```bash
# 1. Clone repository
git clone <repository-url>
cd FANTACONTRATTI

# 2. Setup environment
cp services/backend/user-service/.env.example services/backend/user-service/.env
cp infrastructure/api-gateway/.env.example infrastructure/api-gateway/.env

# 3. Avvia infrastruttura
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# 4. Installa dipendenze
npm install

# 5. Avvia servizi di sviluppo
.\scripts\dev-start.ps1
```

### Servizi Disponibili
- **API Gateway**: http://localhost:3000
- **User Portal**: http://localhost:3001
- **User Service**: http://localhost:3001
- **Kafka UI**: http://localhost:9021
- **PostgreSQL**: localhost:5432

### Stop e Cleanup
```bash
# Stop servizi
.\scripts\dev-stop.ps1

# Cleanup completo
docker-compose down -v
docker system prune -f
```

## 🌐 Deployment Staging

### Configurazione Environment
```bash
# .env.staging
NODE_ENV=staging
API_GATEWAY_URL=https://staging-api.fantacontratti.com
DB_HOST=postgres-staging.example.com
KAFKA_BROKERS=kafka-staging.example.com:9092
JWT_SECRET=staging-secret-key
LOG_LEVEL=info
```

### Deploy Staging
```bash
# 1. Build per staging
docker-compose -f docker/docker-compose.staging.yml build

# 2. Deploy
docker-compose -f docker/docker-compose.staging.yml up -d

# 3. Verifica stato
docker-compose -f docker/docker-compose.staging.yml ps

# 4. Health check
curl https://staging-api.fantacontratti.com/health
```

### Monitoring Staging
```bash
# Logs in tempo reale
docker-compose -f docker/docker-compose.staging.yml logs -f

# Metriche container
docker stats

# Health check automatico
watch -n 30 'curl -s https://staging-api.fantacontratti.com/health | jq'
```

## 🏭 Deployment Produzione

### Pre-requisiti Produzione
- **SSL Certificates**: Certificati validi
- **DNS**: Record DNS configurati
- **Database**: PostgreSQL cluster in HA
- **Load Balancer**: Nginx o HAProxy
- **Monitoring**: Prometheus + Grafana
- **Backup**: Strategia backup automatica

### Configurazione Environment
```bash
# .env.production
NODE_ENV=production
API_GATEWAY_URL=https://api.fantacontratti.com
DB_HOST=postgres-prod-cluster.example.com
KAFKA_BROKERS=kafka-prod-1.example.com:9092,kafka-prod-2.example.com:9092
REDIS_URL=redis://redis-prod.example.com:6379
JWT_SECRET=ultra-secure-production-secret
LOG_LEVEL=warn
SENTRY_DSN=https://your-sentry-dsn
```

### Deploy Produzione con Docker Compose
```bash
# 1. Backup database
pg_dump -h postgres-prod.example.com -U postgres fantacontratti_users > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Build immagini produzione
docker-compose -f docker/docker-compose.prod.yml build

# 3. Deploy con zero downtime
docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate

# 4. Verifica deployment
docker-compose -f docker/docker-compose.prod.yml ps
curl https://api.fantacontratti.com/health
```

### Deploy Produzione con Kubernetes

#### Namespace e Secrets
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: fantacontratti

---
# k8s/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: fantacontratti
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DB_PASSWORD: <base64-encoded-password>
```

#### ConfigMap
```yaml
# k8s/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: fantacontratti
data:
  NODE_ENV: "production"
  API_GATEWAY_URL: "https://api.fantacontratti.com"
  DB_HOST: "postgres-service"
  KAFKA_BROKERS: "kafka-service:9092"
```

#### Deployment User Service
```yaml
# k8s/user-service-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: fantacontratti
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: fantacontratti/user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: JWT_SECRET
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service e Ingress
```yaml
# k8s/user-service-service.yml
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: fantacontratti
spec:
  selector:
    app: user-service
  ports:
  - port: 3001
    targetPort: 3001

---
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: fantacontratti
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.fantacontratti.com
    secretName: api-tls
  rules:
  - host: api.fantacontratti.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 3000
```

#### Deploy Kubernetes
```bash
# 1. Applica configurazioni
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/configmap.yml

# 2. Deploy servizi
kubectl apply -f k8s/

# 3. Verifica deployment
kubectl get pods -n fantacontratti
kubectl get services -n fantacontratti
kubectl get ingress -n fantacontratti

# 4. Logs
kubectl logs -f deployment/user-service -n fantacontratti
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run test
    - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build Docker images
      run: |
        docker build -t fantacontratti/user-service:${{ github.sha }} services/backend/user-service
        docker build -t fantacontratti/api-gateway:${{ github.sha }} infrastructure/api-gateway
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push fantacontratti/user-service:${{ github.sha }}
        docker push fantacontratti/api-gateway:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: |
        # SSH to production server and update services
        ssh ${{ secrets.PROD_SERVER }} "
          cd /opt/fantacontratti &&
          docker-compose pull &&
          docker-compose up -d --force-recreate
        "
```

### GitLab CI/CD
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  DOCKER_IMAGE_PREFIX: $DOCKER_REGISTRY/$CI_PROJECT_PATH

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test
    - npm run lint

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE_PREFIX/user-service:$CI_COMMIT_SHA services/backend/user-service
    - docker push $DOCKER_IMAGE_PREFIX/user-service:$CI_COMMIT_SHA

deploy_production:
  stage: deploy
  script:
    - kubectl set image deployment/user-service user-service=$DOCKER_IMAGE_PREFIX/user-service:$CI_COMMIT_SHA
  only:
    - main
```

## 📊 Monitoring e Alerting

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
    - targets: ['api-gateway:3000']
    metrics_path: '/metrics'
    
  - job_name: 'user-service'
    static_configs:
    - targets: ['user-service:3001']
    metrics_path: '/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "FantaContratti Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"api-gateway\"}"
          }
        ]
      }
    ]
  }
}
```

### Alertmanager Rules
```yaml
# monitoring/alerts.yml
groups:
- name: fantacontratti
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.instance }} is down"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate on {{ $labels.instance }}"
```

## 🔒 Sicurezza in Produzione

### SSL/TLS Configuration
```nginx
# nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name api.fantacontratti.com;
    
    ssl_certificate /etc/ssl/certs/fantacontratti.crt;
    ssl_certificate_key /etc/ssl/private/fantacontratti.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        proxy_pass http://api-gateway:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Firewall Rules
```bash
# UFW Configuration
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 5432/tcp   # PostgreSQL (only internal)
ufw deny 9092/tcp   # Kafka (only internal)
ufw enable
```

### Secret Management
```bash
# Using Docker Secrets
echo "super-secret-password" | docker secret create db_password -

# Using Kubernetes Secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=db-password=your-db-password
```

## 📦 Backup e Restore

### Database Backup
```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# PostgreSQL backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_DIR/fantacontratti_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/fantacontratti_$DATE.sql

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/fantacontratti_$DATE.sql.gz s3://fantacontratti-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "fantacontratti_*.sql.gz" -mtime +30 -delete
```

### Automated Backup with Cron
```bash
# Aggiungi a crontab
# Backup giornaliero alle 2:00 AM
0 2 * * * /opt/fantacontratti/scripts/backup-db.sh
```

### Restore Procedure
```bash
#!/bin/bash
# scripts/restore-db.sh

BACKUP_FILE=$1

# Stop services
docker-compose down

# Restore database
gunzip -c $BACKUP_FILE | psql -h $DB_HOST -U $DB_USER $DB_NAME

# Restart services
docker-compose up -d
```

## 🔧 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Check configuration
docker-compose config
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec -it postgres-container psql -U postgres -d fantacontratti_users

# Check network connectivity
docker exec -it user-service ping postgres-users
```

#### High Memory Usage
```bash
# Check memory usage
docker stats --no-stream

# Limit container memory
docker update --memory 512m container-name
```

### Performance Tuning

#### Database Optimization
```sql
-- PostgreSQL tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
SELECT pg_reload_conf();
```

#### Application Tuning
```bash
# Node.js memory optimization
export NODE_OPTIONS="--max-old-space-size=512"

# PM2 cluster mode
pm2 start ecosystem.config.js --env production
```

## 📋 Checklist Deployment

### Pre-Deploy
- [ ] Codice testato e validato
- [ ] Build dei container riuscito
- [ ] Backup database effettuato
- [ ] SSL certificates aggiornati
- [ ] DNS record configurati
- [ ] Variabili environment configurate
- [ ] Monitoring configurato

### Deploy
- [ ] Stop traffico utenti (se necessario)
- [ ] Deploy nuove versioni
- [ ] Verifica health checks
- [ ] Test delle API principali
- [ ] Verifica logs per errori
- [ ] Ripristino traffico utenti

### Post-Deploy
- [ ] Monitoring per 30 minuti
- [ ] Test funzionali completi
- [ ] Verifica performance
- [ ] Notifica team del deploy
- [ ] Documentazione aggiornata
- [ ] Rollback plan confermato

## 🆘 Rollback Procedure

### Rollback Rapido
```bash
# 1. Identifica versione precedente
docker images fantacontratti/user-service

# 2. Rollback con tag precedente
docker-compose stop user-service
docker run -d --name user-service fantacontratti/user-service:previous-tag

# 3. Verifica funzionamento
curl http://localhost:3001/health
```

### Rollback Kubernetes
```bash
# Rollback all'ultima versione funzionante
kubectl rollout undo deployment/user-service -n fantacontratti

# Verifica status rollback
kubectl rollout status deployment/user-service -n fantacontratti
```

### Rollback Database
```bash
# Restore backup precedente
./scripts/restore-db.sh /backups/fantacontratti_previous.sql.gz
```

## 📞 Contatti e Supporto

- **Team DevOps**: devops@fantacontratti.com
- **Emergency**: +39 123 456 7890
- **Slack**: #fantacontratti-deploy
- **Runbook**: https://wiki.fantacontratti.com/runbook