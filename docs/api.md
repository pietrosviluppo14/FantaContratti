# API Documentation - FantaContratti

## 📋 Panoramica

Questa documentazione descrive tutte le API REST disponibili nella piattaforma FantaContratti. Tutti gli endpoint sono accessibili tramite l'API Gateway su `http://localhost:3000`.

## 🔐 Autenticazione

### Bearer Token
Molte API richiedono autenticazione tramite JWT Bearer Token:
```http
Authorization: Bearer <jwt_token>
```

### Refresh Token
Per rinnovare i token scaduti:
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

## 🌐 Base URL

- **Sviluppo**: `http://localhost:3000`
- **Produzione**: `https://api.fantacontratti.com`

## 👤 User Service API

### Autenticazione

#### POST /api/auth/register
Registra un nuovo utente.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "Mario",
  "lastName": "Rossi"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "firstName": "Mario",
      "lastName": "Rossi",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": {
    "message": "Email già registrata",
    "status": 400
  }
}

// 422 - Validation Error
{
  "success": false,
  "error": {
    "message": "Dati non validi",
    "status": 422,
    "details": [
      {
        "field": "email",
        "message": "Email non valida"
      }
    ]
  }
}
```

#### POST /api/auth/login
Effettua il login.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

#### POST /api/auth/logout
Effettua il logout (richiede autenticazione).

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logout effettuato con successo"
}
```

#### POST /api/auth/refresh
Rinnova il token di accesso.

**Request:**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### POST /api/auth/forgot-password
Richiede reset password.

**Request:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Email di reset inviata"
}
```

#### POST /api/auth/reset-password
Reset password con token.

**Request:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Password aggiornata con successo"
}
```

### Gestione Utenti

#### GET /api/users
Ottiene lista utenti (richiede autenticazione admin).

**Request:**
```http
GET /api/users?page=1&limit=10&search=mario
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Numero pagina (default: 1)
- `limit` (optional): Elementi per pagina (default: 10, max: 100)
- `search` (optional): Ricerca per nome o email
- `role` (optional): Filtra per ruolo
- `active` (optional): Filtra per stato attivo

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "username",
      "firstName": "Mario",
      "lastName": "Rossi",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /api/users/:id
Ottiene dettagli utente specifico.

**Request:**
```http
GET /api/users/123
Authorization: Bearer <jwt_token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "firstName": "Mario",
    "lastName": "Rossi",
    "phone": "+39 123 456 7890",
    "dateOfBirth": "1990-01-01",
    "role": "user",
    "isActive": true,
    "isVerified": true,
    "lastLoginAt": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "profile": {
      "bio": "Appassionato di fantasy football",
      "website": "https://example.com",
      "location": "Milano, Italy"
    }
  }
}
```

#### PUT /api/users/:id
Aggiorna dati utente.

**Request:**
```http
PUT /api/users/123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Mario",
  "lastName": "Rossi",
  "phone": "+39 123 456 7890",
  "dateOfBirth": "1990-01-01"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "firstName": "Mario",
    "lastName": "Rossi",
    "phone": "+39 123 456 7890",
    "dateOfBirth": "1990-01-01",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### DELETE /api/users/:id
Elimina utente (richiede admin).

**Request:**
```http
DELETE /api/users/123
Authorization: Bearer <jwt_token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Utente eliminato con successo"
}
```

#### GET /api/users/profile
Ottiene profilo utente corrente.

**Request:**
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "firstName": "Mario",
    "lastName": "Rossi",
    "profile": {
      "bio": "Appassionato di fantasy football",
      "preferences": {
        "theme": "dark",
        "notifications": true
      }
    }
  }
}
```

#### PUT /api/users/profile
Aggiorna profilo utente corrente.

**Request:**
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Mario",
  "lastName": "Rossi",
  "profile": {
    "bio": "Nuovo appassionato di fantasy football",
    "website": "https://marioblog.com",
    "preferences": {
      "theme": "light",
      "notifications": false
    }
  }
}
```

## 📄 Contract Service API (Template)

### Contratti

#### GET /api/contracts
Ottiene lista contratti.

**Request:**
```http
GET /api/contracts?status=active&page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Contratto Serie A 2024",
      "description": "Contratto per il campionato Serie A",
      "status": "active",
      "createdBy": 123,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/contracts
Crea nuovo contratto.

#### GET /api/contracts/:id
Ottiene dettagli contratto.

#### PUT /api/contracts/:id
Aggiorna contratto.

#### DELETE /api/contracts/:id
Elimina contratto.

## 🔔 Notification Service API (Template)

### Notifiche

#### GET /api/notifications
Ottiene notifiche utente.

#### POST /api/notifications
Crea nuova notifica.

#### PUT /api/notifications/:id/read
Marca notifica come letta.

## 📊 Codici di Stato HTTP

| Codice | Significato | Descrizione |
|--------|-------------|-------------|
| 200 | OK | Richiesta completata con successo |
| 201 | Created | Risorsa creata con successo |
| 400 | Bad Request | Richiesta non valida |
| 401 | Unauthorized | Autenticazione richiesta |
| 403 | Forbidden | Accesso negato |
| 404 | Not Found | Risorsa non trovata |
| 422 | Unprocessable Entity | Dati non validi |
| 429 | Too Many Requests | Rate limit superato |
| 500 | Internal Server Error | Errore interno del server |

## 🔄 Rate Limiting

- **Limite globale**: 1000 richieste per 15 minuti per IP
- **Limite auth**: 5 tentativi di login per 15 minuti per IP
- **Headers di risposta**:
  - `X-RateLimit-Limit`: Limite totale
  - `X-RateLimit-Remaining`: Richieste rimanenti
  - `X-RateLimit-Reset`: Timestamp reset limite

## 📝 Formato Errori

Tutti gli errori seguono questo formato standard:

```json
{
  "success": false,
  "error": {
    "message": "Descrizione errore",
    "status": 400,
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Email richiesta"
      }
    ],
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/api/users",
    "requestId": "req-123-456"
  }
}
```

## 🔍 Filtri e Ricerca

### Query Parameters Comuni
- `page`: Numero pagina (default: 1)
- `limit`: Elementi per pagina (default: 10, max: 100)
- `sort`: Campo di ordinamento
- `order`: Direzione ordinamento (asc/desc)
- `search`: Ricerca testuale
- `filter`: Filtri specifici

### Esempio Query Complessa
```http
GET /api/users?page=2&limit=20&sort=createdAt&order=desc&search=mario&filter[role]=user&filter[active]=true
```

## 📦 Response Wrapper

Tutte le risposte seguono questo formato:

```json
{
  "success": true|false,
  "data": {}, // Solo per successo
  "error": {}, // Solo per errori
  "meta": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0",
    "requestId": "req-123-456"
  }
}
```

## 🧪 Testing API

### Postman Collection
Importa la collection Postman dal file `docs/postman/FantaContratti.postman_collection.json`.

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fantacontratti.com","password":"admin123"}'

# Get users (con token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Esempio JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.tokens.accessToken;

// API call con token
const usersResponse = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔐 Sicurezza API

### Best Practices
- Sempre usare HTTPS in produzione
- Validare tutti gli input
- Sanitizzare output per prevenire XSS
- Implementare rate limiting
- Loggare tentativi di accesso sospetti
- Usare CORS appropriatamente

### Headers di Sicurezza
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 📊 Monitoring e Logging

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Metriche
- Response time
- Error rate
- Request count
- Active connections

## 🔄 Versioning

L'API utilizza versioning via header:
```http
API-Version: v1
```

Versioni supportate:
- `v1`: Versione corrente (default)

## 📚 SDK e Client Libraries

### JavaScript/TypeScript
```bash
npm install @fantacontratti/api-client
```

```typescript
import { FantaContrattiClient } from '@fantacontratti/api-client';

const client = new FantaContrattiClient({
  baseURL: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// Usage
const users = await client.users.list();
const user = await client.users.get(123);
```

## ❓ FAQ API

**Q: Come gestisco i token scaduti?**
A: Intercetta errori 401, usa `/api/auth/refresh` per rinnovare il token.

**Q: Posso fare richieste bulk?**
A: Implementeremo endpoint batch nelle prossime versioni.

**Q: Come funziona la paginazione?**
A: Usa `page` e `limit`. La risposta include metadata di paginazione.

**Q: C'è un sandbox per testing?**
A: Sì, usa l'ambiente di sviluppo con dati di test.