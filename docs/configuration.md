# Configurazioni e Variabili d'Ambiente

## 📋 Panoramica

Questa documentazione descrive tutte le configurazioni e variabili d'ambiente utilizzate nei microservizi della piattaforma FantaContratti.

## 🌐 Gestione Environment

### Filosofia
- **Environment-specific**: Configurazioni diverse per dev/staging/prod
- **Secret Management**: Separazione tra config pubbliche e secrets
- **Validation**: Validazione delle variabili all'avvio
- **Documentation**: Ogni variabile documentata con esempio

### File di Configurazione
```
services/backend/user-service/
├── .env.example          # Template con valori di esempio
├── .env                  # File locale (gitignored)
├── .env.development     # Configurazione sviluppo
├── .env.staging         # Configurazione staging
└── .env.production      # Configurazione produzione
```

## 🔧 User Service Configuration

### File: `services/backend/user-service/.env`

#### Server Configuration
```bash
# Configurazione server principale
NODE_ENV=development                    # Ambiente: development|staging|production
PORT=3001                              # Porta del servizio
HOST=0.0.0.0                          # Host di binding
LOG_LEVEL=info                         # Livello logging: error|warn|info|debug

# Timeouts e limiti
REQUEST_TIMEOUT=30000                  # Timeout richieste HTTP (ms)
MAX_REQUEST_SIZE=10mb                  # Dimensione massima richieste
GRACEFUL_SHUTDOWN_TIMEOUT=10000       # Timeout graceful shutdown (ms)
```

#### Database Configuration
```bash
# PostgreSQL Database
DB_HOST=localhost                      # Host database
DB_PORT=5432                          # Porta database
DB_NAME=fantacontratti_users          # Nome database
DB_USER=postgres                      # Username database
DB_PASSWORD=password                  # Password database
DB_SSL=false                          # Abilita SSL per database

# Connection Pool
DB_POOL_MIN=2                         # Connessioni minime nel pool
DB_POOL_MAX=20                        # Connessioni massime nel pool
DB_POOL_IDLE_TIMEOUT=30000           # Timeout connessioni idle (ms)
DB_POOL_ACQUIRE_TIMEOUT=60000        # Timeout acquisizione connessione (ms)

# Query Performance
DB_STATEMENT_TIMEOUT=30000            # Timeout query (ms)
DB_QUERY_TIMEOUT=10000               # Timeout singola query (ms)
```

#### Authentication & Security
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production    # Chiave segreta JWT
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production  # Chiave refresh token
JWT_EXPIRES_IN=15m                    # Durata access token
JWT_REFRESH_EXPIRES_IN=7d            # Durata refresh token
JWT_ISSUER=fantacontratti.com        # Issuer JWT
JWT_AUDIENCE=fantacontratti-users    # Audience JWT

# Password Security
PASSWORD_MIN_LENGTH=8                 # Lunghezza minima password
PASSWORD_REQUIRE_UPPERCASE=true      # Richiedi maiuscole
PASSWORD_REQUIRE_LOWERCASE=true      # Richiedi minuscole
PASSWORD_REQUIRE_NUMBERS=true        # Richiedi numeri
PASSWORD_REQUIRE_SYMBOLS=false       # Richiedi simboli
BCRYPT_ROUNDS=12                     # Round di hashing bcrypt

# Rate Limiting
RATE_LIMIT_WINDOW=900000             # Finestra rate limit (15 min in ms)
RATE_LIMIT_MAX_REQUESTS=100          # Richieste massime per finestra
RATE_LIMIT_AUTH_MAX=5                # Tentativi login per finestra
RATE_LIMIT_SKIP_SUCCESS=true         # Salta rate limit su success

# Session Management
SESSION_TIMEOUT=3600000              # Timeout sessione (1 ora in ms)
MAX_SESSIONS_PER_USER=5              # Sessioni massime per utente
CLEANUP_EXPIRED_SESSIONS=true       # Pulizia automatica sessioni scadute
```

#### Kafka Configuration
```bash
# Apache Kafka
KAFKA_BROKERS=localhost:9092          # Lista broker Kafka (comma-separated)
KAFKA_CLIENT_ID=user-service         # ID client Kafka
KAFKA_GROUP_ID=user-service-group    # Gruppo consumer

# Topics
KAFKA_TOPIC_USER_EVENTS=user-events  # Topic eventi utente
KAFKA_TOPIC_SYSTEM_EVENTS=system-events  # Topic eventi sistema
KAFKA_TOPIC_DLQ=dead-letter-queue    # Topic dead letter queue

# Producer Settings
KAFKA_PRODUCER_BATCH_SIZE=16384      # Dimensione batch producer
KAFKA_PRODUCER_LINGER_MS=5           # Linger time producer
KAFKA_PRODUCER_COMPRESSION=gzip      # Compressione messaggi
KAFKA_PRODUCER_RETRIES=3             # Tentativi reinvio

# Consumer Settings
KAFKA_CONSUMER_SESSION_TIMEOUT=30000  # Timeout sessione consumer
KAFKA_CONSUMER_HEARTBEAT_INTERVAL=3000  # Intervallo heartbeat
KAFKA_CONSUMER_MAX_BYTES=1048576     # Bytes massimi per fetch
KAFKA_CONSUMER_AUTO_COMMIT=true      # Auto commit offset
```

#### External Services
```bash
# API Gateway
API_GATEWAY_URL=http://localhost:3000  # URL API Gateway
API_GATEWAY_TIMEOUT=30000             # Timeout chiamate gateway

# Email Service
EMAIL_SERVICE_ENABLED=true            # Abilita servizio email
EMAIL_PROVIDER=smtp                   # Provider: smtp|sendgrid|mailgun
SMTP_HOST=smtp.gmail.com             # Host SMTP
SMTP_PORT=587                        # Porta SMTP
SMTP_SECURE=false                    # TLS/SSL
SMTP_USER=your-email@gmail.com       # Username SMTP
SMTP_PASSWORD=your-app-password      # Password SMTP
EMAIL_FROM=noreply@fantacontratti.com  # Email mittente

# File Storage
STORAGE_PROVIDER=local               # Provider: local|s3|azure
STORAGE_LOCAL_PATH=./uploads         # Path locale per upload
STORAGE_MAX_FILE_SIZE=10485760      # Dimensione massima file (10MB)
STORAGE_ALLOWED_TYPES=image/jpeg,image/png,image/gif  # Tipi file consentiti

# AWS S3 (se STORAGE_PROVIDER=s3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fantacontratti-uploads
```

#### Monitoring & Observability
```bash
# Logging
LOG_FORMAT=json                      # Formato log: json|simple
LOG_COLORIZE=true                    # Colorizzazione log (solo console)
LOG_FILE_ENABLED=true               # Salvataggio su file
LOG_FILE_PATH=./logs                # Path file di log
LOG_FILE_MAX_SIZE=20971520          # Dimensione massima file log (20MB)
LOG_FILE_MAX_FILES=5                # Numero massimo file log

# Metrics
METRICS_ENABLED=true                 # Abilita metriche Prometheus
METRICS_PORT=9464                   # Porta metriche
METRICS_PATH=/metrics               # Path endpoint metriche

# Health Checks
HEALTH_CHECK_ENABLED=true           # Abilita health check
HEALTH_CHECK_PATH=/health           # Path health check
HEALTH_CHECK_DB=true                # Includi check database
HEALTH_CHECK_KAFKA=true             # Includi check Kafka

# Tracing (Jaeger)
JAEGER_ENABLED=false                # Abilita tracing
JAEGER_ENDPOINT=http://localhost:14268/api/traces
JAEGER_SERVICE_NAME=user-service
JAEGER_SAMPLE_RATE=0.1              # Rate sampling (10%)
```

#### Development & Debug
```bash
# Development Settings
HOT_RELOAD=true                     # Hot reload in development
DEBUG_SQL=false                     # Debug query SQL
DEBUG_KAFKA=false                   # Debug messaggi Kafka
MOCK_EXTERNAL_SERVICES=false        # Mock servizi esterni

# CORS Settings
CORS_ENABLED=true                   # Abilita CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_CREDENTIALS=true               # Consenti credenziali

# Security Headers
SECURITY_HELMET_ENABLED=true        # Abilita Helmet.js
SECURITY_HSTS_ENABLED=true          # HTTP Strict Transport Security
SECURITY_CSP_ENABLED=false          # Content Security Policy
SECURITY_FRAME_OPTIONS=DENY         # X-Frame-Options
```

## 🚪 API Gateway Configuration

### File: `infrastructure/api-gateway/.env`

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# Service URLs
USER_SERVICE_URL=http://localhost:3001
CONTRACT_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# Load Balancing
LOAD_BALANCER_STRATEGY=round-robin   # round-robin|least-connections|ip-hash
HEALTH_CHECK_INTERVAL=30000         # Intervallo health check servizi (ms)
CIRCUIT_BREAKER_ENABLED=true        # Abilita circuit breaker
CIRCUIT_BREAKER_THRESHOLD=5         # Errori consecutivi per aprire circuito
CIRCUIT_BREAKER_TIMEOUT=60000       # Timeout circuito aperto (ms)

# Rate Limiting
GLOBAL_RATE_LIMIT=1000              # Richieste massime per IP (per finestra)
GLOBAL_RATE_WINDOW=900000           # Finestra rate limit globale (15 min)
API_RATE_LIMIT=200                  # Richieste API per utente autenticato
API_RATE_WINDOW=900000              # Finestra rate limit API

# Caching
CACHE_ENABLED=true                  # Abilita cache Redis
CACHE_REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=300               # TTL default cache (5 min)
CACHE_MAX_SIZE=1000                 # Numero massimo chiavi in cache

# Request/Response
REQUEST_TIMEOUT=30000               # Timeout richieste upstream
MAX_REQUEST_SIZE=50mb               # Dimensione massima richieste
COMPRESSION_ENABLED=true            # Abilita compressione gzip
COMPRESSION_THRESHOLD=1024          # Soglia compressione (bytes)

# Security
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002
HELMET_ENABLED=true                 # Security headers
TRUST_PROXY=false                   # Trust proxy headers
IP_WHITELIST=                       # IP whitelisted (comma-separated)
IP_BLACKLIST=                       # IP blacklisted (comma-separated)

# Monitoring
PROMETHEUS_ENABLED=true             # Metriche Prometheus
PROMETHEUS_PORT=9090                # Porta metriche
ACCESS_LOG_ENABLED=true             # Log accessi
ACCESS_LOG_FORMAT=combined          # Formato log accessi
ERROR_LOG_ENABLED=true              # Log errori
```

## 🌐 Frontend Configuration

### File: `services/frontend/user-portal/.env`

```bash
# Build Configuration
VITE_NODE_ENV=development            # Ambiente build
VITE_BUILD_TARGET=modules            # Target build: modules|legacy
VITE_SOURCEMAP=true                  # Abilita source maps
VITE_MINIFY=false                    # Minifica in development

# API Configuration
VITE_API_BASE_URL=http://localhost:3000  # URL base API Gateway
VITE_API_TIMEOUT=30000               # Timeout chiamate API
VITE_API_RETRY_ATTEMPTS=3            # Tentativi retry API
VITE_API_RETRY_DELAY=1000           # Delay retry (ms)

# Authentication
VITE_TOKEN_STORAGE=localStorage      # Storage token: localStorage|sessionStorage
VITE_TOKEN_REFRESH_THRESHOLD=300000  # Soglia refresh token (5 min)
VITE_AUTO_LOGOUT_TIMEOUT=3600000    # Auto logout dopo inattività (1 ora)
VITE_REMEMBER_LOGIN=true             # Abilita "ricordami"

# Features
VITE_FEATURE_NOTIFICATIONS=true     # Abilita notifiche
VITE_FEATURE_DARK_MODE=true         # Abilita tema scuro
VITE_FEATURE_PWA=true               # Progressive Web App
VITE_FEATURE_ANALYTICS=false        # Analytics (solo produzione)

# Development
VITE_MOCK_API=false                 # Usa API mock
VITE_DEBUG_MODE=true                # Modalità debug
VITE_HOT_RELOAD=true                # Hot module replacement
VITE_OPEN_BROWSER=true              # Apri browser automaticamente

# External Services
VITE_SENTRY_DSN=                    # Sentry per error tracking
VITE_GOOGLE_ANALYTICS_ID=           # Google Analytics
VITE_HOTJAR_ID=                     # Hotjar per user analytics

# PWA Settings
VITE_PWA_NAME=FantaContratti        # Nome PWA
VITE_PWA_SHORT_NAME=FantaContratti  # Nome breve PWA
VITE_PWA_DESCRIPTION=Piattaforma per gestione contratti fantasy
VITE_PWA_THEME_COLOR=#007bff        # Colore tema
VITE_PWA_BACKGROUND_COLOR=#ffffff   # Colore background
```

## 🐳 Docker Configuration

### Environment Variables per Docker Compose

#### Development
```yaml
# docker/docker-compose.dev.yml
environment:
  - NODE_ENV=development
  - PORT=3001
  - DB_HOST=postgres-users
  - KAFKA_BROKERS=kafka:9092
  - LOG_LEVEL=debug
  - HOT_RELOAD=true
```

#### Staging
```yaml
# docker/docker-compose.staging.yml
environment:
  - NODE_ENV=staging
  - PORT=3001
  - DB_HOST=postgres-staging.example.com
  - KAFKA_BROKERS=kafka-staging:9092
  - LOG_LEVEL=info
  - METRICS_ENABLED=true
```

#### Production
```yaml
# docker/docker-compose.prod.yml
environment:
  - NODE_ENV=production
  - PORT=3001
  - DB_HOST=postgres-prod.example.com
  - KAFKA_BROKERS=kafka-prod-1:9092,kafka-prod-2:9092
  - LOG_LEVEL=warn
  - METRICS_ENABLED=true
  - SECURITY_HELMET_ENABLED=true
```

## ☸️ Kubernetes Configuration

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-service-config
data:
  NODE_ENV: "production"
  PORT: "3001"
  LOG_LEVEL: "info"
  DB_HOST: "postgres-service"
  KAFKA_BROKERS: "kafka-service:9092"
  METRICS_ENABLED: "true"
```

### Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: user-service-secrets
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  DB_PASSWORD: <base64-encoded-password>
  SMTP_PASSWORD: <base64-encoded-password>
```

## ✅ Validazione Configurazioni

### Schema Validation
```typescript
// src/config/validation.ts
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().min(1000).max(65535),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().min(1).max(65535),
  JWT_SECRET: z.string().min(32),
  KAFKA_BROKERS: z.string().min(1),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),
});

export const validateConfig = () => {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
};
```

### Runtime Validation
```typescript
// src/config/index.ts
import { validateConfig } from './validation';

const config = validateConfig();

export default {
  server: {
    port: config.PORT,
    env: config.NODE_ENV,
  },
  database: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    name: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
  },
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
  },
  // ... altre configurazioni
};
```

## 🔒 Gestione Secrets

### Sviluppo Locale
```bash
# .env.local (non committare)
JWT_SECRET=dev-secret-key-not-for-production
DB_PASSWORD=dev-password
SMTP_PASSWORD=dev-smtp-password
```

### Staging/Production
```bash
# Usando external secret manager
export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id jwt-secret --query SecretString --output text)
export DB_PASSWORD=$(kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d)
```

### HashiCorp Vault
```bash
# Configurazione Vault
vault kv put secret/fantacontratti/user-service \
  jwt_secret="super-secret-key" \
  db_password="secure-db-password"

# Lettura da Vault
vault kv get -field=jwt_secret secret/fantacontratti/user-service
```

## 📊 Configuration Management Tools

### dotenv-vault
```bash
# Installa dotenv-vault
npm install dotenv-vault

# Configura vault
npx dotenv-vault new
npx dotenv-vault push .env.production
npx dotenv-vault pull production
```

### AWS Parameter Store
```typescript
// config/aws-params.ts
import { SSM } from 'aws-sdk';

const ssm = new SSM();

export const getParameter = async (name: string): Promise<string> => {
  const result = await ssm.getParameter({
    Name: name,
    WithDecryption: true,
  }).promise();
  
  return result.Parameter?.Value || '';
};

// Usage
const jwtSecret = await getParameter('/fantacontratti/jwt-secret');
```

## 🧪 Testing Configurations

### Test Environment
```bash
# .env.test
NODE_ENV=test
DB_NAME=fantacontratti_test
LOG_LEVEL=error
KAFKA_ENABLED=false
EMAIL_ENABLED=false
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  globalSetup: '<rootDir>/src/test/global-setup.ts',
  globalTeardown: '<rootDir>/src/test/global-teardown.ts',
};
```

## 📋 Configuration Checklist

### Development
- [ ] `.env` file creato da `.env.example`
- [ ] Database locale configurato
- [ ] Kafka locale avviato
- [ ] Log level impostato su `debug`
- [ ] Hot reload abilitato

### Staging
- [ ] Variabili staging configurate
- [ ] SSL certificates installati
- [ ] Database staging connesso
- [ ] Monitoring abilitato
- [ ] Backup configurato

### Production
- [ ] Secrets securamente gestiti
- [ ] Rate limiting configurato
- [ ] Logging ottimizzato
- [ ] Monitoring completo attivo
- [ ] Backup automatico
- [ ] Disaster recovery testato

## ❓ FAQ Configurazioni

**Q: Come ruoto i JWT secrets?**
A: Aggiorna `JWT_SECRET`, mantieni il vecchio per validazione temporanea, poi rimuovi.

**Q: Come gestisco configurazioni multi-tenant?**
A: Usa database separati o prefissi nelle configurazioni per tenant.

**Q: Come debuggo problemi di configurazione?**
A: Abilita `DEBUG_CONFIG=true` per log dettagliati delle configurazioni caricate.

**Q: Come gestisco feature flags?**
A: Usa servizi come LaunchDarkly o feature flags in database/Redis.