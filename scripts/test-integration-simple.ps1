#!/usr/bin/env pwsh

# Script per test di integrazione Docker
Write-Host "[DOCKER] Avvio Test Integrazione Docker..." -ForegroundColor Cyan

try {
    # 1. Pulizia container esistenti
    Write-Host "[CLEAN] Pulizia container esistenti..." -ForegroundColor Yellow
    docker-compose -f docker-compose.integration.yml down -v 2>$null
    
    # 2. Verifica connettività Docker
    Write-Host "[CHECK] Verifica Docker..." -ForegroundColor Cyan
    docker version
    if ($LASTEXITCODE -ne 0) {
        throw "Docker non disponibile"
    }
    
    # 3. Avvia solo i servizi di base prima
    Write-Host "[START] Avvio servizi di base..." -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml up -d postgres-users postgres-contracts redis
    
    if ($LASTEXITCODE -ne 0) {
        throw "Errore nell'avvio dei servizi di base"
    }
    
    # 4. Attendi i database
    Write-Host "[WAIT] Attendo database..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # 5. Test connettività database
    Write-Host "[TEST] Test database..." -ForegroundColor Cyan
    
    # Test PostgreSQL Users
    $retries = 0
    $maxRetries = 10
    while ($retries -lt $maxRetries) {
        docker exec fantacontratti-postgres-users-1 pg_isready -h localhost -p 5432 -U postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] PostgreSQL Users pronto" -ForegroundColor Green
            break
        }
        $retries++
        Write-Host "   Tentativo $retries/$maxRetries..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    if ($retries -eq $maxRetries) {
        Write-Host "[FAIL] PostgreSQL Users timeout" -ForegroundColor Red
    }
    
    # Test query database
    Write-Host "[QUERY] Test query database..." -ForegroundColor Cyan
    docker exec fantacontratti-postgres-users-1 psql -U postgres -d users_db -c "SELECT 'DB OK' as status;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Query database riuscita" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Query database fallita" -ForegroundColor Red
    }
    
    # 6. Avvia user-service 
    Write-Host "[START] Avvio user-service..." -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml up -d --build user-service
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Problemi con build user-service" -ForegroundColor Yellow
    }
    
    # Attendi user-service
    Start-Sleep -Seconds 15
    
    # 7. Test integrazione
    Write-Host "[TEST] Test integrazione..." -ForegroundColor Cyan
    
    # Vai alla directory user-service
    $originalLocation = Get-Location
    Set-Location "services/backend/user-service"
    
    # Imposta environment per integration
    $env:NODE_ENV = "integration"
    
    # Esegui test Docker integration
    Write-Host "   Eseguendo test database integration..." -ForegroundColor Gray
    npm test -- database.integration.docker.test.ts --testTimeout=30000
    
    $testResult = $LASTEXITCODE
    
    # Torna alla directory originale
    Set-Location $originalLocation
    
    if ($testResult -eq 0) {
        Write-Host "[SUCCESS] Test integration PASSATI!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Test integration FALLITI!" -ForegroundColor Red
    }
    
    # 8. Stato finale
    Write-Host "`n[STATUS] Stato Container:" -ForegroundColor Cyan
    docker-compose -f docker-compose.integration.yml ps
    
    Write-Host "`n[LOGS] Per vedere i logs:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml logs [servizio]" -ForegroundColor Gray
    
    Write-Host "`n[STOP] Per fermare tutto:" -ForegroundColor Yellow  
    Write-Host "   docker-compose -f docker-compose.integration.yml down -v" -ForegroundColor Gray
    
    if ($testResult -eq 0) {
        Write-Host "`n[SUCCESS] INTEGRATION TEST COMPLETATO!" -ForegroundColor Green -BackgroundColor Black
    } else {
        Write-Host "`n[WARNING] Test falliti ma ambiente attivo" -ForegroundColor Yellow -BackgroundColor Black
    }
    
} catch {
    Write-Host "`n[ERROR] ERRORE: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n[DEBUG] Per debug:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml logs" -ForegroundColor Gray
    Write-Host "   docker-compose -f docker-compose.integration.yml ps" -ForegroundColor Gray
    
    Write-Host "`n[CLEAN] Per pulire:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.integration.yml down -v" -ForegroundColor Gray
    
    exit 1
}