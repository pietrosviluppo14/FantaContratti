# GitHub Repository Setup Script - Versione Semplificata
# Configura repository GitHub per FantaContratti

param(
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "FantaContratti",
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Piattaforma microservizi per gestione contratti fantasy",
    
    [Parameter(Mandatory=$false)]
    [switch]$Public = $false
)

Write-Host "🚀 GitHub Repository Setup - FantaContratti" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Verifica autenticazione GitHub
Write-Host "🔐 Verifico autenticazione GitHub..." -ForegroundColor Yellow
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Non sei autenticato. Esegui: gh auth login"
    exit 1
}

# Ottieni username GitHub
$GitHubUsername = gh api user --jq '.login'
Write-Host "👤 Username GitHub: $GitHubUsername" -ForegroundColor Cyan

# Crea repository GitHub
Write-Host "📁 Creazione repository GitHub..." -ForegroundColor Yellow
$visibility = if ($Public) { "--public" } else { "--private" }

gh repo create $RepoName $visibility --description $Description --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository creato con successo!" -ForegroundColor Green
} else {
    Write-Error "❌ Errore nella creazione del repository"
    exit 1
}

# Configura remote Git
Write-Host "🔗 Configurazione remote Git..." -ForegroundColor Yellow
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

git remote remove origin 2>$null
git remote add origin $repoUrl
git branch -M main

Write-Host "✅ Remote Git configurato: $repoUrl" -ForegroundColor Green

# Crea labels essenziali
Write-Host "🏷️  Creazione labels..." -ForegroundColor Yellow

# Array di labels
$labels = @(
    "bug,d73a4a,Qualcosa non funziona",
    "enhancement,a2eeef,Nuova funzionalità",
    "documentation,0075ca,Miglioramenti documentazione",
    "good first issue,7057ff,Buono per principianti",
    "priority:high,b60205,Alta priorità",
    "priority:medium,fbca04,Media priorità",
    "microservice:backend,f9d0c4,Backend microservices",
    "microservice:frontend,c2e0c6,Frontend microservices",
    "infrastructure,fef2c0,Infrastructure e DevOps"
)

foreach ($labelData in $labels) {
    $parts = $labelData.Split(',')
    $name = $parts[0]
    $color = $parts[1] 
    $desc = $parts[2]
    
    gh label create $name --color $color --description $desc 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Label '$name' creata" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Label '$name' gia esistente" -ForegroundColor Yellow
    }
}

# Push iniziale
Write-Host "📤 Push iniziale del codice..." -ForegroundColor Yellow
git add .
git commit -m "🎉 Initial commit - FantaContratti microservices platform"
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Codice pushato con successo!" -ForegroundColor Green
} else {
    Write-Error "❌ Errore nel push del codice"
}

# Riepilogo finale
Write-Host "`n🎉 Setup GitHub completato!" -ForegroundColor Green
Write-Host "📁 Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host "🔗 Issues: https://github.com/$GitHubUsername/$RepoName/issues" -ForegroundColor Cyan

Write-Host "`n🚀 Il tuo repository è pronto!" -ForegroundColor Green