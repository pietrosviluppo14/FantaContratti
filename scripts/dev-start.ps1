# Script per avviare l'ambiente di sviluppo
# PowerShell script per Windows

Write-Host "🚀 Avvio ambiente di sviluppo FantaContratti..." -ForegroundColor Green

# Controlla se Docker è in esecuzione
$dockerStatus = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker non è in esecuzione. Avvia Docker Desktop e riprova." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Avvio infrastruttura (Database, Kafka, Redis)..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.infrastructure.yml up -d

# Attendi che i servizi siano pronti
Write-Host "⏳ Attendere che i servizi siano pronti..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Crea i topic Kafka
Write-Host "📨 Creazione topic Kafka..." -ForegroundColor Yellow
& bash infrastructure/kafka/create-topics.sh

# Installa le dipendenze se necessario
Write-Host "📋 Installazione dipendenze..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    npm install
}

# Avvia i microservizi in parallelo
Write-Host "🔧 Avvio microservizi..." -ForegroundColor Yellow

# API Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd infrastructure/api-gateway; npm install; npm run dev"

# User Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/backend/user-service; npm install; npm run dev"

# User Portal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/frontend/user-portal; npm install; npm run dev"

Write-Host "✅ Ambiente di sviluppo avviato con successo!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Servizi disponibili:" -ForegroundColor Cyan
Write-Host "  • API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "  • User Portal: http://localhost:3001" -ForegroundColor White
Write-Host "  • User Service: http://localhost:3001" -ForegroundColor White
Write-Host "  • Kafka UI: http://localhost:9021" -ForegroundColor White
Write-Host ""
Write-Host "📊 Database:" -ForegroundColor Cyan
Write-Host "  • PostgreSQL Users: localhost:5432" -ForegroundColor White
Write-Host "  • Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Premi Ctrl+C per terminare i servizi" -ForegroundColor Yellow