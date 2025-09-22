# Script per creare un nuovo microservizio backend
# PowerShell script per Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

Write-Host "🔧 Creazione nuovo microservizio backend: $ServiceName" -ForegroundColor Green

$servicePath = "services/backend/$ServiceName"

# Controlla se il servizio esiste già
if (Test-Path $servicePath) {
    Write-Host "❌ Il servizio $ServiceName esiste già!" -ForegroundColor Red
    exit 1
}

# Crea la struttura delle directory
Write-Host "📁 Creazione struttura directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "$servicePath/src" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/controllers" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/routes" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/services" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/middleware" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/utils" -Force | Out-Null
New-Item -ItemType Directory -Path "$servicePath/src/database" -Force | Out-Null

# Copia i file template dal user-service
Write-Host "📋 Copia file template..." -ForegroundColor Yellow
Copy-Item "services/backend/user-service/package.json" "$servicePath/package.json"
Copy-Item "services/backend/user-service/tsconfig.json" "$servicePath/tsconfig.json"
Copy-Item "services/backend/user-service/Dockerfile" "$servicePath/Dockerfile"
Copy-Item "services/backend/user-service/.env.example" "$servicePath/.env.example"

# Aggiorna il package.json con il nome del nuovo servizio
$packageJson = Get-Content "$servicePath/package.json" | ConvertFrom-Json
$packageJson.name = $ServiceName
$packageJson.description = "Microservizio $ServiceName per FantaContratti"
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "$servicePath/package.json"

# Crea il file index.ts base
$indexContent = @"
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '$ServiceName',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to $ServiceName API',
    version: '1.0.0'
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route `${req.originalUrl}` not found`
  });
});

app.listen(PORT, () => {
  logger.info(`$ServiceName running on port `${PORT}`);
  logger.info(`Environment: `${process.env.NODE_ENV || 'development'}`);
});
"@

Set-Content "$servicePath/src/index.ts" $indexContent

# Copia il logger
Copy-Item "services/backend/user-service/src/utils/logger.ts" "$servicePath/src/utils/logger.ts"

Write-Host "✅ Microservizio $ServiceName creato con successo!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
Write-Host "  1. cd $servicePath" -ForegroundColor White
Write-Host "  2. npm install" -ForegroundColor White
Write-Host "  3. cp .env.example .env" -ForegroundColor White
Write-Host "  4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Ricorda di aggiornare:" -ForegroundColor Yellow
Write-Host "  • docker-compose.yml con il nuovo servizio" -ForegroundColor White
Write-Host "  • API Gateway routing" -ForegroundColor White
Write-Host "  • Package.json principale workspace" -ForegroundColor White