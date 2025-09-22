# Architettura del Sistema FantaContratti

## 🏗️ Panoramica Architetturale

FantaContratti utilizza un'architettura a microservizi event-driven che garantisce scalabilità, resilienza e facilità di manutenzione.

## 🔧 Componenti Principali

### 1. API Gateway
- **Responsabilità**: Entry point unico per tutte le richieste client
- **Tecnologia**: Node.js + Express + HTTP Proxy Middleware
- **Porta**: 3000
- **Funzionalità**:
  - Routing intelligente verso i microservizi
  - Rate limiting e throttling
  - Autenticazione e autorizzazione
  - Load balancing
  - Monitoring e logging delle richieste

### 2. Microservizi Backend

#### User Service
- **Responsabilità**: Gestione utenti, autenticazione, profili
- **Tecnologia**: Node.js + Express + TypeScript
- **Database**: PostgreSQL dedicato
- **Porta**: 3001
- **API Endpoints**:
  - `/api/auth/*` - Autenticazione
  - `/api/users/*` - Gestione utenti

#### Contract Service (Template)
- **Responsabilità**: Gestione contratti fantasy
- **Tecnologia**: Node.js + Express + TypeScript
- **Database**: PostgreSQL dedicato
- **Porta**: 3002

#### Notification Service (Template)
- **Responsabilità**: Notifiche email, push, SMS
- **Tecnologia**: Node.js + Express + TypeScript
- **Database**: PostgreSQL dedicato
- **Porta**: 3003

### 3. Microservizi Frontend

#### User Portal
- **Responsabilità**: Interfaccia utente per gestione account
- **Tecnologia**: React + TypeScript + Vite
- **Porta**: 3001 (dev), 8001 (prod)
- **Features**:
  - Autenticazione utente
  - Gestione profilo
  - Dashboard personalizzata

#### Admin Dashboard (Template)
- **Responsabilità**: Pannello amministrativo
- **Tecnologia**: React + TypeScript + Vite
- **Porta**: 3002 (dev), 8002 (prod)

### 4. Livello Dati

#### Database PostgreSQL
- **Strategia**: Database per Microservizio (Database per Service)
- **Configurazione**: Container separati per isolamento
- **Backup**: Volumi Docker persistenti
- **Databases**:
  - `fantacontratti_users` (porta 5432)
  - `fantacontratti_contracts` (porta 5433)
  - `fantacontratti_notifications` (porta 5434)

#### Redis Cache
- **Responsabilità**: Caching, sessioni, rate limiting
- **Porta**: 6379
- **Use Cases**:
  - Session storage
  - API response caching
  - Rate limiting counters

### 5. Message Broker

#### Apache Kafka
- **Responsabilità**: Comunicazione asincrona tra microservizi
- **Porta**: 9092
- **Topics**:
  - `user-events` - Eventi utente (registrazione, login, aggiornamenti)
  - `contract-events` - Eventi contratti
  - `notification-events` - Eventi notifiche
  - `system-events` - Eventi di sistema
  - `dead-letter-queue` - Messaggi falliti

#### Kafka UI
- **Responsabilità**: Monitoraggio e gestione Kafka
- **Porta**: 9021
- **Features**: Topic management, message browsing, consumer monitoring

## 🔀 Flussi di Comunicazione

### 1. Flusso Sincrono (Request/Response)
```
Client → API Gateway → Microservizio → Database → Response
```

### 2. Flusso Asincrono (Event-Driven)
```
Microservizio A → Kafka Topic → Microservizio B
```

### Esempio: Registrazione Utente
1. **Client** invia richiesta POST a `/api/auth/register`
2. **API Gateway** instrada a User Service
3. **User Service** valida dati e salva in database
4. **User Service** pubblica evento `USER_REGISTERED` su Kafka
5. **Notification Service** consuma evento e invia email di benvenuto
6. **User Service** restituisce risposta al client

## 🛡️ Sicurezza

### Autenticazione e Autorizzazione
- **JWT Tokens**: Per autenticazione stateless
- **Refresh Tokens**: Per rinnovare l'accesso
- **Role-Based Access Control (RBAC)**: Gestione permessi

### Sicurezza Network
- **API Gateway**: Unico punto di accesso esterno
- **CORS**: Configurato per domini autorizzati
- **Rate Limiting**: Protezione da abusi
- **Helmet.js**: Security headers HTTP

### Sicurezza Dati
- **Encryption at Rest**: Database criptati
- **Encryption in Transit**: HTTPS/TLS
- **Secrets Management**: Variabili d'ambiente

## 🔍 Monitoring e Observability

### Logging
- **Winston**: Logging strutturato JSON
- **Centralized Logs**: Aggregazione log di tutti i servizi
- **Log Levels**: ERROR, WARN, INFO, DEBUG

### Health Checks
- **Endpoint**: `/health` su ogni servizio
- **Docker**: HEALTHCHECK integrato
- **Metrics**: Status, uptime, version

### Monitoring Kafka
- **Kafka UI**: Interfaccia web per monitoraggio
- **Metrics**: Throughput, lag, errors

## 📈 Scalabilità

### Horizontal Scaling
- **Stateless Services**: Ogni microservizio è stateless
- **Load Balancing**: API Gateway distribuisce il carico
- **Database Sharding**: Possibilità di shardare per tenant

### Caching Strategy
- **Redis**: Cache distribuito
- **API Response Caching**: Cache delle risposte API
- **Database Query Caching**: Cache delle query frequenti

### Performance
- **Connection Pooling**: Database connection pools
- **Compression**: Gzip response compression
- **CDN Ready**: Frontend ottimizzato per CDN

## 🔄 Deployment Strategy

### Sviluppo
- **Docker Compose**: Orchestrazione locale
- **Hot Reload**: Sviluppo con live reload
- **Isolated Services**: Ogni servizio in container separato

### Produzione
- **Container Orchestration**: Kubernetes ready
- **Blue/Green Deployment**: Zero-downtime deployments
- **Health Checks**: Automated health monitoring
- **Rollback Strategy**: Quick rollback capabilities

## 🗂️ Struttura del Progetto

```
├── services/
│   ├── backend/          # Microservizi backend
│   └── frontend/         # Microservizi frontend
├── infrastructure/
│   ├── api-gateway/      # API Gateway
│   ├── databases/        # Script DB e migrations
│   └── kafka/           # Configurazioni Kafka
├── docker/              # Configurazioni Docker
├── scripts/             # Script di automazione
└── docs/               # Documentazione
```

## 🚀 Vantaggi dell'Architettura

### Scalabilità
- **Independent Scaling**: Ogni servizio scala indipendentemente
- **Resource Optimization**: Risorse allocate per necessità
- **Load Distribution**: Distribuzione bilanciata del carico

### Resilienza
- **Fault Isolation**: Failure di un servizio non impatta gli altri
- **Circuit Breaker Pattern**: Protezione da cascading failures
- **Graceful Degradation**: Degradazione graduale delle funzionalità

### Sviluppo
- **Team Independence**: Team possono lavorare indipendentemente
- **Technology Flexibility**: Diversi stack per diversi servizi
- **Fast Deployment**: Deploy indipendenti e veloci

### Manutenzione
- **Separation of Concerns**: Responsabilità ben separate
- **Easy Debugging**: Problemi isolati per servizio
- **Version Management**: Versioning indipendente

## 📋 Best Practices Implementate

1. **Database per Service**: Ogni microservizio ha il suo database
2. **API First Design**: API ben definite e documentate
3. **Event Sourcing**: Eventi per comunicazione asincrona
4. **Health Checks**: Monitoring automatico dello stato
5. **Centralized Logging**: Log aggregati e strutturati
6. **Security by Design**: Sicurezza implementata a tutti i livelli
7. **Infrastructure as Code**: Configurazioni versionate
8. **Automated Testing**: Test automatizzati per ogni servizio