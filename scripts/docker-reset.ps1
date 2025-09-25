#!/usr/bin/env pwsh

# Script per reset completo Docker e riavvio pulito
Write-Host "[RESET] Riavvio completo Docker..." -ForegroundColor Cyan

try {
    Write-Host "[STOP] Fermata tutti i container..." -ForegroundColor Yellow
    
    # Force stop tutto
    docker stop $(docker ps -q) 2>$null
    
    Write-Host "[CLEAN] Rimozione volumi persistenti..." -ForegroundColor Yellow
    
    # Rimuovi volumi specifici
    docker volume rm fantacontratti_postgres_users_data 2>$null
    docker volume rm fantacontratti_postgres_contracts_data 2>$null
    
    # Pulizia generale
    docker system prune -f --volumes 2>$null
    
    Write-Host "[START] Riavvio servizi con volumi puliti..." -ForegroundColor Green
    
    # Riavvia con volumi freschi
    docker-compose -f docker-compose.integration.yml up -d postgres-users postgres-contracts redis --force-recreate
    
    Write-Host "[WAIT] Attesa inizializzazione..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    Write-Host "[TEST] Test connessione..." -ForegroundColor Cyan
    
    # Test rapido
    node -e "
    const { Pool } = require('pg');
    const pool = new Pool({
      host: 'localhost',
      port: 5432, 
      database: 'fantacontratti_users',
      user: 'postgres',
      password: 'password123'
    });
    
    pool.connect()
      .then(client => {
        console.log('✅ SUCCESS: Database connesso!');
        client.release();
        pool.end();
      })
      .catch(err => {
        console.log('❌ FAIL:', err.message);
        pool.end();
      });
    "
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Reset completato!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Reset fatto, test della connessione da verificare" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}