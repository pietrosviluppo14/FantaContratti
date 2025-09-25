#!/usr/bin/env pwsh

# Script per test di integrazione Docker completo
Write-Host "[DOCKER] Avvio Test Integrazione Docker..." -ForegroundColor Cyan

# Function p) catch {
    Write-Host "`n[ERROR] ERRORE: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n[DEBUG] Per debug, controlla i logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml logs" -ForegroundColor Gray
    
    Write-Host "`n[CLEAN] Per pulire e riavviare:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml down -v" -ForegroundColor Gray
    Write-Host "   docker system prune -f" -ForegroundColor Graytare che i servizi siano pronti
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$HealthCheck,
        [int]$MaxAttempts = 30
    )
    
    Write-Host "[WAIT] Attendo $ServiceName..." -ForegroundColor Yellow
    
    $attempts = 0
    while ($attempts -lt $MaxAttempts) {
        try {
            $result = Invoke-Expression $HealthCheck 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] $ServiceName pronto!" -ForegroundColor Green
                return $true
            }
        } catch {}
        
        $attempts++
        Write-Host "   Tentativo $attempts/$MaxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host "[FAIL] $ServiceName non risponde dopo $MaxAttempts tentativi" -ForegroundColor Red
    return $false
}

try {
    # 1. Stop eventuali container esistenti
    Write-Host "[CLEAN] Pulizia container esistenti..." -ForegroundColor Yellow
    docker-compose -f docker-compose.integration.yml down -v 2>$null
    
    # 2. Avvia i servizi
    Write-Host "[START] Avvio servizi Docker..." -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml up -d --build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Errore nell'avvio dei container"
    }
    
    # 3. Attendi che i servizi di base siano pronti
    Write-Host "`n[CHECK] Verifica stato servizi..." -ForegroundColor Cyan
    
    # PostgreSQL Users
    if (!(Wait-ForService "PostgreSQL Users" "docker exec fantacontratti-postgres-users-1 pg_isready -h localhost -p 5432")) {
        throw "PostgreSQL Users non risponde"
    }
    
    # PostgreSQL Contracts
    if (!(Wait-ForService "PostgreSQL Contracts" "docker exec fantacontratti-postgres-contracts-1 pg_isready -h localhost -p 5432")) {
        throw "PostgreSQL Contracts non risponde"
    }
    
    # Redis
    if (!(Wait-ForService "Redis" "docker exec fantacontratti-redis-1 redis-cli ping")) {
        throw "Redis non risponde"
    }
    
    # Kafka (più tempo necessario)
    Write-Host "[WAIT] Attendo Kafka (può richiedere più tempo)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # 4. Mostra stato dei container
    Write-Host "`n[STATUS] Stato Container:" -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml ps
    
    # 5. Test di connettività database
    Write-Host "`n[TEST] Test connettività database..." -ForegroundColor Cyan
    
    Write-Host "   Testing PostgreSQL Users..." -ForegroundColor Gray
    docker exec fantacontratti-postgres-users-1 psql -U postgres -d users_db -c "SELECT 'Users DB OK' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] PostgreSQL Users: OK" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] PostgreSQL Users: ERRORE" -ForegroundColor Red
    }
    
    Write-Host "   Testing PostgreSQL Contracts..." -ForegroundColor Gray
    docker exec fantacontratti-postgres-contracts-1 psql -U postgres -d contracts_db -c "SELECT 'Contracts DB OK' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] PostgreSQL Contracts: OK" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] PostgreSQL Contracts: ERRORE" -ForegroundColor Red
    }
    
    # 6. Avvia i servizi applicativi
    Write-Host "`n[APPS] Avvio servizi applicativi..." -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml up -d user-service api-gateway user-portal
    
    # Attendi i servizi applicativi
    Start-Sleep -Seconds 10
    
    # 7. Verifica i servizi applicativi
    Write-Host "`n[WEB] Verifica servizi applicativi..." -ForegroundColor Cyan
    
    # User Service
    try {
        Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5 -ErrorAction Stop | Out-Null
        Write-Host "   [OK] User Service: OK" -ForegroundColor Green
    } catch {
        Write-Host "   [WAIT] User Service: In avvio..." -ForegroundColor Yellow
    }
    
    # API Gateway
    try {
        Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 5 -ErrorAction Stop | Out-Null
        Write-Host "   [OK] API Gateway: OK" -ForegroundColor Green
    } catch {
        Write-Host "   [WAIT] API Gateway: In avvio..." -ForegroundColor Yellow
    }
    
    # User Portal
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] User Portal: OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "   [WAIT] User Portal: In avvio..." -ForegroundColor Yellow
    }
    
    # 8. Esegui i test di integrazione Docker
    Write-Host "`n[TESTS] Esecuzione test di integrazione..." -ForegroundColor Cyan
    
    Set-Location "services/backend/user-service"
    
    # Assicurati che il NODE_ENV sia impostato
    $env:NODE_ENV = "integration"
    
    # Esegui i test Docker
    Write-Host "   Eseguendo test database Docker..." -ForegroundColor Gray
    npm test -- database.integration.docker.test.ts --testTimeout=30000 --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [SUCCESS] Test di integrazione Docker: PASSATI" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Test di integrazione Docker: FALLITI" -ForegroundColor Red
    }
    
    # 9. Riepilogo finale
    Write-Host "`n[SUMMARY] RIEPILOGO FINALE:" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    
    Write-Host "[ENDPOINTS] Endpoints disponibili:" -ForegroundColor Yellow
    Write-Host "   * User Portal:    http://localhost:3000" -ForegroundColor White
    Write-Host "   * API Gateway:    http://localhost:4000" -ForegroundColor White
    Write-Host "   * User Service:   http://localhost:3001" -ForegroundColor White
    Write-Host "   * PostgreSQL Users:     localhost:5432" -ForegroundColor White
    Write-Host "   * PostgreSQL Contracts: localhost:5433" -ForegroundColor White
    Write-Host "   * Redis:          localhost:6379" -ForegroundColor White
    Write-Host "   * Kafka:          localhost:9092" -ForegroundColor White
    
    Write-Host "`n[MONITORING] Per monitorare i logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml logs -f [nome-servizio]" -ForegroundColor Gray
    
    Write-Host "`n[STOP] Per fermare tutto:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml down -v" -ForegroundColor Gray
    
    Write-Host "`n[SUCCESS] AMBIENTE DOCKER PRONTO PER L'INTEGRAZIONE!" -ForegroundColor Green -BackgroundColor Black
    
} catch {
    Write-Host "`n[ERROR] ERRORE: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n[DEBUG] Per debug, controlla i logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml logs" -ForegroundColor Gray
    
    Write-Host "`n[CLEAN] Per pulire e riavviare:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml down -v" -ForegroundColor Gray
    Write-Host "   docker system prune -f" -ForegroundColor Gray
    
    exit 1
} finally {
    # Torna alla directory principale
    Set-Location $PSScriptRoot
}