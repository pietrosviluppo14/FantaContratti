# Guida per Sviluppatori - FantaContratti

## 🚀 Setup Ambiente di Sviluppo

### Prerequisiti

#### Software Richiesto
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Docker Desktop**: Ultima versione
- **Git**: Per version control
- **VSCode**: Editor consigliato

#### GitHub e Repository Management
- **GitHub Account**: Per gestione repository e collaborazione
- **GitHub CLI** (gh): Consigliato per workflow avanzati
- **GitHub Desktop**: Opzionale, per interfaccia grafica Git

#### Tools di Sviluppo Aggiuntivi
- **Postman**: Per testing API
- **TablePlus/pgAdmin**: Per gestione database PostgreSQL
- **Redis Desktop Manager**: Per monitoring Redis

#### Estensioni VSCode Consigliate
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-vscode-remote.remote-containers",
    "ms-azuretools.vscode-docker",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "github.vscode-pull-request-github",
    "eamodio.gitlens",
    "github.copilot",
    "humao.rest-client"
  ]
}
```

### 🔧 Setup Iniziale

#### 1. Clone del Repository
```bash
git clone <repository-url>
cd FANTACONTRATTI
```

#### 2. Installazione Dipendenze
```bash
# Installa dipendenze del workspace principale
npm install

# Installa dipendenze di tutti i microservizi
npm run setup
```

#### 3. Configurazione Ambiente
```bash
# Copia i file di configurazione
cp services/backend/user-service/.env.example services/backend/user-service/.env
cp infrastructure/api-gateway/.env.example infrastructure/api-gateway/.env

# Configura le variabili d'ambiente necessarie
```

#### 4. Avvio Ambiente di Sviluppo
```powershell
# Su Windows
.\scripts\dev-start.ps1

# Su Linux/Mac
./scripts/dev-start.sh
```

## 🏗️ Struttura del Progetto

### Directory Overview
```
FANTACONTRATTI/
├── 📁 services/
│   ├── 📁 backend/          # Microservizi backend
│   │   └── 📁 user-service/ # Servizio utenti
│   └── 📁 frontend/         # Microservizi frontend
│       └── 📁 user-portal/  # Portale utenti
├── 📁 infrastructure/
│   ├── 📁 api-gateway/      # API Gateway
│   ├── 📁 databases/        # Script e configurazioni DB
│   └── 📁 kafka/           # Configurazioni Kafka
├── 📁 docker/              # Docker configurations
├── 📁 scripts/             # Script di automazione
├── 📁 docs/               # Documentazione
└── 📄 package.json        # Workspace configuration
```

### Convenzioni Naming
- **Servizi Backend**: `kebab-case` (es. `user-service`)
- **Servizi Frontend**: `kebab-case` (es. `user-portal`)
- **File**: `camelCase.ts` per TypeScript, `kebab-case.css` per CSS
- **Componenti React**: `PascalCase.tsx`
- **Costanti**: `SCREAMING_SNAKE_CASE`

## 🔄 Workflow di Sviluppo

### 1. Creazione Feature Branch
```bash
git checkout -b feature/nome-feature
```

### 2. Sviluppo
```bash
# Avvia l'ambiente di sviluppo
.\scripts\dev-start.ps1

# Sviluppa la feature...

# Test continui
npm run test:watch
```

### 3. Testing
```bash
# Test di tutti i servizi
npm run test

# Test di un servizio specifico
npm run test:service user-service

# Test di copertura
npm run test:coverage
```

### 4. Commit e Push
```bash
git add .
git commit -m "feat: aggiunta nuova funzionalità"
git push origin feature/nome-feature
```

### 5. Pull Request
- Crea PR su GitHub/GitLab
- Assicurati che tutti i test passino
- Richiedi review dal team

## 🔨 Comandi Utili

### Workspace Management
```bash
# Installa dipendenze per tutti i servizi
npm run setup

# Build di tutti i servizi
npm run build

# Test di tutti i servizi
npm run test

# Linting di tutti i servizi
npm run lint

# Fix automatico linting
npm run lint:fix
```

### Servizi Individuali
```bash
# Lavora su un servizio specifico
cd services/backend/user-service
npm run dev

# Test di un servizio
npm run test

# Build di un servizio
npm run build
```

### Docker Commands
```bash
# Avvia infrastruttura (DB, Kafka, Redis)
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# Avvia tutto in produzione
docker-compose -f docker/docker-compose.prod.yml up -d

# Visualizza logs
docker-compose logs -f

# Stop e cleanup
docker-compose down -v
```

## ➕ Aggiungere Nuovi Servizi

### Nuovo Microservizio Backend
```powershell
# Usa lo script automatizzato
.\scripts\create-backend-service.ps1 -ServiceName "contract-service"

# Manualmente:
# 1. Crea directory in services/backend/
# 2. Copia template da user-service
# 3. Aggiorna package.json, .env, routes
# 4. Aggiungi al workspace package.json
# 5. Configura API Gateway routing
```

### Nuovo Microservizio Frontend
```powershell
# Template React con Vite
npm create vite@latest services/frontend/new-app -- --template react-ts

# Configura:
# 1. package.json (nome, script)
# 2. vite.config.ts (proxy, port)
# 3. Aggiungi al workspace
```

## 🧪 Testing Strategy

### Tipi di Test
1. **Unit Tests**: Jest per backend, Vitest per frontend
2. **Integration Tests**: Test delle API e database
3. **E2E Tests**: Cypress per testing end-to-end
4. **Load Tests**: Artillery per performance testing

### Struttura Test
```
src/
├── __tests__/          # Test unitari
├── __integration__/    # Test di integrazione
└── __e2e__/           # Test end-to-end
```

### Comandi Test
```bash
# Test unitari
npm run test

# Test con watch mode
npm run test:watch

# Test di copertura
npm run test:coverage

# Test end-to-end
npm run test:e2e
```

## 🐙 GitHub Workflow e Issue Management

### Setup Repository GitHub

#### 1. Creazione Repository
```bash
# Crea repository su GitHub
gh repo create FantaContratti --public --description "Piattaforma microservizi per gestione contratti fantasy"

# Configura remote
git remote add origin https://github.com/username/FantaContratti.git
git push -u origin main
```

#### 2. Configurazione Branch Protection
```bash
# Proteggi il branch main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

### Issue Management

#### Template Issue
Configurare in `.github/ISSUE_TEMPLATE/`:

**Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`):
```markdown
---
name: Bug Report
about: Segnala un bug
title: '[BUG] '
labels: bug
assignees: ''
---

## Descrizione Bug
Descrizione chiara del problema.

## Riproduzione
Passi per riprodurre il comportamento:
1. Vai a '...'
2. Clicca su '....'
3. Scorri fino a '....'
4. Vedi errore

## Comportamento Atteso
Descrizione di cosa dovrebbe accadere.

## Screenshots
Se applicabile, aggiungi screenshot.

## Ambiente:
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 122]
- Versione: [e.g. 1.0.0]
```

**Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`):
```markdown
---
name: Feature Request
about: Suggerisci una nuova funzionalità
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Descrizione Feature
Descrizione chiara della funzionalità richiesta.

## Motivazione
Perché questa feature è importante?

## Soluzione Proposta
Come vorresti che funzionasse?

## Alternative Considerate
Hai considerato altre soluzioni?
```

#### Labels Standard
```bash
# Crea labels standard
gh label create "bug" --color "d73a4a" --description "Qualcosa non funziona"
gh label create "enhancement" --color "a2eeef" --description "Nuova funzionalità o richiesta"
gh label create "documentation" --color "0075ca" --description "Miglioramenti o aggiunte alla documentazione"
gh label create "good first issue" --color "7057ff" --description "Buono per principianti"
gh label create "help wanted" --color "008672" --description "Aiuto extra è benvenuto"
gh label create "priority:high" --color "b60205" --description "Alta priorità"
gh label create "priority:medium" --color "fbca04" --description "Media priorità"
gh label create "priority:low" --color "0e8a16" --description "Bassa priorità"
gh label create "microservice:backend" --color "f9d0c4" --description "Backend microservices"
gh label create "microservice:frontend" --color "c2e0c6" --description "Frontend microservices"
gh label create "infrastructure" --color "fef2c0" --description "Infrastructure and DevOps"
```

### GitHub Actions CI/CD

#### Workflow Base (`.github/workflows/ci.yml`):
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker images
      run: |
        docker-compose -f docker/docker-compose.prod.yml build
    
    - name: Run security scan
      run: |
        npm audit --audit-level moderate
```

### Project Management

#### GitHub Projects Setup
```bash
# Crea project board
gh project create --title "FantaContratti Development" --body "Main development board"

# Aggiungi colonne standard
gh project column create --project "FantaContratti Development" --name "Backlog"
gh project column create --project "FantaContratti Development" --name "To Do"
gh project column create --project "FantaContratti Development" --name "In Progress"
gh project column create --project "FantaContratti Development" --name "Review"
gh project column create --project "FantaContratti Development" --name "Done"
```

#### Milestones
```bash
# Crea milestones principali
gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="v1.0.0 - MVP" \
  --field description="Minimum Viable Product release" \
  --field due_on="2024-12-31T23:59:59Z"

gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="v1.1.0 - Enhanced Features" \
  --field description="Additional features and improvements"
```

## 📝 Code Standards

### TypeScript
- Strict mode abilitato
- Interfacce per tutti i tipi di dati
- Generics quando appropriato
- Documentazione JSDoc per API pubbliche

### ESLint Rules
```javascript
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 🔐 Sicurezza

### Environment Variables
- Mai committare file `.env`
- Usa `.env.example` per template
- Rotazione periodica delle chiavi
- Validazione degli input sempre

### API Security
- Autenticazione JWT obbligatoria
- Rate limiting implementato
- Validazione input con Zod
- CORS configurato correttamente

### Database Security
- Prepared statements sempre
- Validazione parametri
- Principio del privilegio minimo
- Backup criptati

## 🐛 Debugging

### Backend Services
```bash
# Debug con Inspector
npm run dev:debug

# Logs in tempo reale
docker-compose logs -f user-service

# Connessione diretta al database
docker exec -it fantacontratti-postgres-users psql -U postgres -d fantacontratti_users
```

### Frontend Apps
```bash
# React DevTools
# Vue DevTools (se applicabile)
# Browser Developer Tools

# Source maps abilitati per debugging
```

### Kafka Debugging
- **Kafka UI**: http://localhost:9021
- **CLI Tools**: Dentro il container Kafka
```bash
# Visualizza messaggi di un topic
docker exec -it fantacontratti-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning
```

## 📊 Monitoring

### Health Checks
- Endpoint `/health` su ogni servizio
- Docker health checks configurati
- Monitoraggio automatico uptime

### Logging
- **Winston** per backend services
- **Console** per frontend (development)
- **Structured logging** (JSON format)
- **Log levels**: ERROR, WARN, INFO, DEBUG

### Metriche
- Response times
- Error rates
- Throughput
- Resource usage

## 🚀 Performance

### Best Practices
- **Database**: Indexing appropriato, query ottimizzate
- **Caching**: Redis per cache distribuito
- **Bundling**: Code splitting per frontend
- **Compression**: Gzip per API responses

### Optimization Tools
- **Bundle analyzer** per frontend
- **Database query analyzer**
- **Load testing** con Artillery
- **Performance monitoring**

## 🤝 Contributing

### Pull Request Process
1. Fork del repository
2. Crea feature branch
3. Implementa modifiche con test
4. Esegui linting e test
5. Crea PR con descrizione dettagliata
6. Review del codice
7. Merge dopo approvazione

### Commit Convention
```
type(scope): description

# Tipi:
feat: nuova funzionalità
fix: bug fix
docs: documentazione
style: formattazione
refactor: refactoring
test: test
chore: maintenance
```

### Code Review Checklist
- [ ] Codice testato e funzionante
- [ ] Test unitari presenti
- [ ] Documentazione aggiornata
- [ ] Performance accettabili
- [ ] Sicurezza verificata
- [ ] Compatibilità browser (frontend)

## 📚 Risorse Utili

### Documentazione Tecnica
- [Architettura](./architecture.md)
- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)

### Tutorial e Guide
- [React Documentation](https://reactjs.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Documentation](https://docs.docker.com/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)

### Tools e Utility
- [Postman Collection](./postman/) - API testing
- [Database ERD](./database/) - Schema documentation
- [Monitoring Dashboard](./monitoring/) - Sistema monitoring

## ❓ FAQ

**Q: Come aggiungo un nuovo endpoint API?**
A: Crea route in `src/routes/`, controller in `src/controllers/`, aggiorna API Gateway routing.

**Q: Come gestisco le migrazioni database?**
A: Script in `infrastructure/databases/`, esegui con `npm run migrate`.

**Q: Come debuggo i messaggi Kafka?**
A: Usa Kafka UI (http://localhost:9021) o CLI tools nel container.

**Q: Come faccio il deploy in staging?**
A: Usa `docker-compose -f docker/docker-compose.prod.yml up -d`.

## 🆘 Supporto

- **Issues**: Apri issue su GitHub
- **Discussions**: GitHub Discussions per domande
- **Wiki**: Documentazione dettagliata
- **Slack/Teams**: Canale team per supporto rapido