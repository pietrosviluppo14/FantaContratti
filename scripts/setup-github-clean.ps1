# GitHub Repository Setup Script - Clean Version
param(
    [string]$RepoName = "FantaContratti",
    [string]$Description = "Piattaforma microservizi per gestione contratti fantasy",
    [switch]$Public = $false
)

Write-Host "GitHub Repository Setup - FantaContratti" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Verifica autenticazione
Write-Host "Verifico autenticazione GitHub..." -ForegroundColor Yellow
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Error "Non sei autenticato. Esegui: gh auth login"
    exit 1
}

# Ottieni username
$GitHubUsername = gh api user --jq '.login'
Write-Host "Username GitHub: $GitHubUsername" -ForegroundColor Cyan

# Crea repository
Write-Host "Creazione repository GitHub..." -ForegroundColor Yellow
$visibility = if ($Public) { "--public" } else { "--private" }

gh repo create $RepoName $visibility --description $Description --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "Repository creato con successo!" -ForegroundColor Green
} else {
    Write-Error "Errore nella creazione del repository"
    exit 1
}

# Configura Git remote
Write-Host "Configurazione remote Git..." -ForegroundColor Yellow
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

git remote remove origin 2>$null
git remote add origin $repoUrl
git branch -M main

Write-Host "Remote Git configurato: $repoUrl" -ForegroundColor Green

# Crea labels essenziali
Write-Host "Creazione labels..." -ForegroundColor Yellow

$labels = @(
    "bug,d73a4a,Bug report",
    "enhancement,a2eeef,New feature",
    "documentation,0075ca,Documentation",
    "good first issue,7057ff,Good for newcomers",
    "priority:high,b60205,High priority",
    "microservice:backend,f9d0c4,Backend services",
    "microservice:frontend,c2e0c6,Frontend services"
)

foreach ($labelData in $labels) {
    $parts = $labelData.Split(',')
    $name = $parts[0]
    $color = $parts[1] 
    $desc = $parts[2]
    
    gh label create $name --color $color --description $desc 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Label '$name' creata" -ForegroundColor Green
    } else {
        Write-Host "Label '$name' gia esistente" -ForegroundColor Yellow
    }
}

# Push iniziale
Write-Host "Push iniziale del codice..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit - FantaContratti microservices platform"
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Codice pushato con successo!" -ForegroundColor Green
} else {
    Write-Host "Errore nel push del codice" -ForegroundColor Red
}

# Riepilogo
Write-Host ""
Write-Host "Setup GitHub completato!" -ForegroundColor Green
Write-Host "Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host "Il tuo repository e' pronto!" -ForegroundColor Green