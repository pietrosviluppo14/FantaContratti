# FantaContratti - Piattaforma Microservizi

Una piattaforma completa basata su architettura a microservizi per la gestione di contratti fantasy.

## 🏗️ Architettura

### Componenti Principali
- **Frontend Microservices**: Applicazioni React modulari
- **Backend Microservices**: API REST con Node.js/Express
- **API Gateway**: Orchestrazione e routing delle richieste
- **Message Broker**: Apache Kafka per comunicazione asincrona
- **Database**: Database dedicati per ogni microservizio
- **Containerizzazione**: Docker per deployment

### Struttura del Progetto

```
├── services/
│   ├── backend/          # Microservizi backend
│   │   ├── user-service/
│   │   ├── contract-service/
│   │   └── notification-service/
│   └── frontend/         # Microservizi frontend
│       ├── user-portal/
│       ├── admin-dashboard/
│       └── mobile-app/
├── infrastructure/
│   ├── api-gateway/      # Configurazione API Gateway
│   ├── kafka/           # Configurazione Kafka
│   └── databases/       # Script DB e migrations
├── docker/              # Configurazioni Docker
└── scripts/             # Script di deployment e utility
```

## 🚀 Quick Start

### Prerequisiti
- Node.js >= 18
- Docker & Docker Compose  
- Git
- **GitHub Account** (per repository management e issue tracking)
- **GitHub CLI** (opzionale - per workflow avanzati)

### Sviluppo Locale

1. **Clone del repository**
   ```bash
   git clone <repository-url>
   cd FANTACONTRATTI
   ```

2. **Avvio dell'ambiente di sviluppo**
   ```bash
   # Avvia tutti i servizi
   ./scripts/dev-start.ps1
   
   # Oppure avvia servizi singoli
   ./scripts/start-backend.ps1
   ./scripts/start-frontend.ps1
   ```

3. **Accesso ai servizi**
   - API Gateway: http://localhost:3000
   - User Portal: http://localhost:3001
   - Admin Dashboard: http://localhost:3002
   - Kafka UI: http://localhost:9021

## 🛠️ Sviluppo

### Aggiungere un nuovo microservizio

1. Backend:
   ```bash
   ./scripts/create-backend-service.ps1 <service-name>
   ```

2. Frontend:
   ```bash
   ./scripts/create-frontend-service.ps1 <service-name>
   ```

### Testing
```bash
# Test di tutti i servizi
npm run test:all

# Test di un servizio specifico
npm run test:service <service-name>
```

## 📦 Deployment

### Ambiente di Sviluppo
```bash
./scripts/deploy-dev.ps1
```

### Ambiente di Staging/Produzione
```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 🔧 Configurazione

Le configurazioni sono gestite tramite variabili d'ambiente e file di configurazione per ogni ambiente.

### Variabili d'Ambiente Principali
- `NODE_ENV`: Ambiente di esecuzione
- `DATABASE_URL`: URL del database
- `KAFKA_BROKERS`: Lista dei broker Kafka
- `API_GATEWAY_PORT`: Porta dell'API Gateway

## 📚 Documentazione

- [Guida all'Architettura](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.