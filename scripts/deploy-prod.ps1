# Script per deploy in produzione
# PowerShell script per Windows

Write-Host "🚀 Deploy FantaContratti in produzione..." -ForegroundColor Green

# Controlla se Docker è in esecuzione
$dockerStatus = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker non è in esecuzione. Avvia Docker Desktop e riprova." -ForegroundColor Red
    exit 1
}

# Build e deploy
Write-Host "🔨 Build e deploy dei servizi..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Attendi che i servizi siano pronti
Write-Host "⏳ Attendere che i servizi siano pronti..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Controlla lo stato dei servizi
Write-Host "📊 Controllo stato servizi..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.prod.yml ps

Write-Host "✅ Deploy completato!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Servizi disponibili:" -ForegroundColor Cyan
Write-Host "  • API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "  • User Portal: http://localhost:8001" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitoraggio:" -ForegroundColor Cyan
Write-Host "  • docker-compose -f docker/docker-compose.prod.yml logs" -ForegroundColor White
Write-Host "  • docker-compose -f docker/docker-compose.prod.yml ps" -ForegroundColor White