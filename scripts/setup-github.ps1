# GitHub Repository Setup Script
# Configura automaticamente il repository GitHub con tutte le configurazioni necessarie

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoName = "FantaContratti",
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Piattaforma microservizi per gestione contratti fantasy",
    
    [Parameter(Mandatory=$false)]
    [switch]$Public = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername
)

Write-Host "🚀 GitHub Repository Setup - FantaContratti" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Verifica se GitHub CLI è installato
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ GitHub CLI (gh) non è installato. Installalo da: https://cli.github.com/"
    exit 1
}

# Verifica autenticazione GitHub
Write-Host "🔐 Verifico autenticazione GitHub..." -ForegroundColor Yellow
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Non sei autenticato. Avvio login GitHub..." -ForegroundColor Yellow
    gh auth login
}

# Ottieni username GitHub se non fornito
if (-not $GitHubUsername) {
    $GitHubUsername = gh api user --jq '.login'
}

Write-Host "👤 Username GitHub: $GitHubUsername" -ForegroundColor Cyan

# Crea repository GitHub
Write-Host "📁 Creazione repository GitHub..." -ForegroundColor Yellow
$visibility = if ($Public) { "--public" } else { "--private" }

gh repo create $RepoName $visibility --description "$Description" --confirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository creato con successo!" -ForegroundColor Green
} else {
    Write-Error "❌ Errore nella creazione del repository"
    exit 1
}

# Configura remote Git
Write-Host "🔗 Configurazione remote Git..." -ForegroundColor Yellow
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

# Rimuovi remote esistente se presente
git remote remove origin 2>$null

# Aggiungi nuovo remote
git remote add origin $repoUrl
git branch -M main

Write-Host "✅ Remote Git configurato: $repoUrl" -ForegroundColor Green

# Crea labels personalizzate
Write-Host "🏷️  Creazione labels..." -ForegroundColor Yellow

$labels = @(
    @{ name = "bug"; color = "d73a4a"; description = "Qualcosa non funziona" },
    @{ name = "enhancement"; color = "a2eeef"; description = "Nuova funzionalità o richiesta" },
    @{ name = "documentation"; color = "0075ca"; description = "Miglioramenti o aggiunte alla documentazione" },
    @{ name = "good first issue"; color = "7057ff"; description = "Buono per principianti" },
    @{ name = "help wanted"; color = "008672"; description = "Aiuto extra è benvenuto" },
    @{ name = "priority:high"; color = "b60205"; description = "Alta priorità" },
    @{ name = "priority:medium"; color = "fbca04"; description = "Media priorità" },
    @{ name = "priority:low"; color = "0e8a16"; description = "Bassa priorità" },
    @{ name = "microservice:backend"; color = "f9d0c4"; description = "Backend microservices" },
    @{ name = "microservice:frontend"; color = "c2e0c6"; description = "Frontend microservices" },
    @{ name = "infrastructure"; color = "fef2c0"; description = "Infrastructure and DevOps" },
    @{ name = "security"; color = "ee0701"; description = "Questioni di sicurezza" },
    @{ name = "performance"; color = "1d76db"; description = "Miglioramenti di performance" },
    @{ name = "testing"; color = "0e8a16"; description = "Test unitari, integrazione, e2e" },
    @{ name = "ci/cd"; color = "6f42c1"; description = "Continuous Integration/Deployment" },
    @{ name = "database"; color = "fbca04"; description = "Modifiche al database" },
    @{ name = "kafka"; color = "d4edda"; description = "Message broker Kafka" },
    @{ name = "api"; color = "bfd4f2"; description = "API e web services" },
    @{ name = "ui/ux"; color = "ff69b4"; description = "User Interface e User Experience" }
)

foreach ($label in $labels) {
    try {
        gh label create $label.name --color $label.color --description $label.description 2>$null
        Write-Host "  ✅ Label '$($label.name)' creata" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Label '$($label.name)' già esistente" -ForegroundColor Yellow
    }
}

# Configura branch protection per main
Write-Host "🛡️  Configurazione branch protection..." -ForegroundColor Yellow
try {
    $protection = @{
        required_status_checks = @{
            strict = $true
            contexts = @("ci")
        }
        enforce_admins = $true
        required_pull_request_reviews = @{
            required_approving_review_count = 1
            dismiss_stale_reviews = $true
        }
        restrictions = $null
    }
    
    $protectionJson = $protection | ConvertTo-Json -Depth 10
    gh api repos/$GitHubUsername/$RepoName/branches/main/protection --method PUT --input - <<< $protectionJson
    Write-Host "✅ Branch protection configurata per main" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Branch protection non configurata (potrebbe essere necessario pushare prima)" -ForegroundColor Yellow
}

# Crea milestones
Write-Host "📋 Creazione milestones..." -ForegroundColor Yellow

$milestones = @(
    @{ 
        title = "v1.0.0 - MVP"; 
        description = "Minimum Viable Product - Funzionalità base per gestione utenti e contratti"; 
        due_date = "2024-12-31" 
    },
    @{ 
        title = "v1.1.0 - Enhanced Features"; 
        description = "Funzionalità avanzate e miglioramenti UX"; 
        due_date = "2025-03-31" 
    },
    @{ 
        title = "v1.2.0 - Scale & Performance"; 
        description = "Ottimizzazioni performance e scalabilità"; 
        due_date = "2025-06-30" 
    }
)

foreach ($milestone in $milestones) {
    try {
        $dueDate = "${($milestone.due_date)}T23:59:59Z"
        gh api repos/$GitHubUsername/$RepoName/milestones `
            --method POST `
            --field title="$($milestone.title)" `
            --field description="$($milestone.description)" `
            --field due_on="$dueDate" 2>$null
        Write-Host "  ✅ Milestone '$($milestone.title)' creata" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Milestone '$($milestone.title)' già esistente" -ForegroundColor Yellow
    }
}

# Push iniziale
Write-Host "📤 Push iniziale del codice..." -ForegroundColor Yellow
git add .
git commit -m "🎉 Initial commit - FantaContratti microservices platform

✨ Features:
- Complete microservices architecture
- Backend services (Node.js + TypeScript)
- Frontend applications (React + Vite)
- API Gateway with routing
- PostgreSQL databases setup
- Apache Kafka messaging
- Docker containerization
- CI/CD pipelines with GitHub Actions
- Comprehensive documentation
- GitHub issue templates and workflows

🚀 Ready for development!"

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Codice pushato con successo!" -ForegroundColor Green
} else {
    Write-Error "❌ Errore nel push del codice"
}

# Crea issue di esempio
Write-Host "📝 Creazione issue di benvenuto..." -ForegroundColor Yellow
$welcomeIssue = @'
Benvenuto nel repository FantaContratti! 🎉

Questo è il repository per la piattaforma microservizi FantaContratti.

## 🚀 Per iniziare:
1. Leggi la documentazione in `docs/`
2. Segui la guida in `docs/contributing.md` per il setup
3. Controlla gli issue aperti per contribuire

## 📋 Prossimi passi:
- [ ] Completare la configurazione dell'ambiente di sviluppo
- [ ] Implementare i microservizi aggiuntivi
- [ ] Aggiungere test end-to-end
- [ ] Configurare monitoring e logging

## 🤝 Come contribuire:
- Crea issue per bug o feature request
- Fork il repo e crea PR per contributi
- Segui le linee guida di coding nel contributing.md

Happy coding! 💻
'@

gh issue create --title "🎉 Benvenuto in FantaContratti!" --body $welcomeIssue --label "documentation,good first issue"

# Riepilogo finale
Write-Host "`n🎉 Setup GitHub completato con successo!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "📁 Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host "🔗 Issues: https://github.com/$GitHubUsername/$RepoName/issues" -ForegroundColor Cyan
Write-Host "📋 Projects: https://github.com/$GitHubUsername/$RepoName/projects" -ForegroundColor Cyan
Write-Host "⚡ Actions: https://github.com/$GitHubUsername/$RepoName/actions" -ForegroundColor Cyan

Write-Host "`n📋 Prossimi passi:" -ForegroundColor Yellow
Write-Host "1. Personalizza i file .env seguendo docs/configuration.md" -ForegroundColor White
Write-Host "2. Esegui 'npm install' per installare le dipendenze" -ForegroundColor White
Write-Host "3. Avvia l'ambiente di sviluppo con '.\scripts\dev-start.ps1'" -ForegroundColor White
Write-Host "4. Visita il repository GitHub per gestire issue e progetti" -ForegroundColor White

Write-Host "`n🤝 Il tuo repository è pronto per il team development!" -ForegroundColor Green