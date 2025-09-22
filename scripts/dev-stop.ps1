# Script per terminare tutti i servizi di sviluppo
# PowerShell script per Windows

Write-Host "🛑 Terminazione ambiente di sviluppo FantaContratti..." -ForegroundColor Red

# Termina tutti i processi node e npm
Write-Host "🔄 Terminazione processi Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Termina i container Docker
Write-Host "🐳 Terminazione container Docker..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.infrastructure.yml down
docker-compose -f docker/docker-compose.prod.yml down -v

# Pulizia network e volumi orfani
Write-Host "🧹 Pulizia risorse Docker..." -ForegroundColor Yellow
docker network prune -f
docker volume prune -f

Write-Host "✅ Ambiente di sviluppo terminato!" -ForegroundColor Green