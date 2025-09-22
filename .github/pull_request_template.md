name: Pull Request Template
about: Template standard per le Pull Request
title: ''
labels: ''
assignees: ''
---

## 📋 Descrizione
Descrizione chiara delle modifiche apportate in questa PR.

## 🎯 Tipo di Modifica
- [ ] 🐛 Bug fix (modifica non breaking che risolve un issue)
- [ ] ✨ Nuova feature (modifica non breaking che aggiunge funzionalità)
- [ ] 💥 Breaking change (modifica che causa malfunzionamenti in funzionalità esistenti)
- [ ] 📚 Documentazione (modifiche solo alla documentazione)
- [ ] 🔧 Refactoring (modifiche al codice che non aggiungono features né risolvono bug)
- [ ] ⚡ Performance (modifiche che migliorano le performance)
- [ ] 🧪 Test (aggiunta o correzione di test)
- [ ] 🔨 Build/CI (modifiche al build o ai sistemi CI)

## 🔗 Issue Collegato
Risolve #(numero issue)

## 🧪 Test Effettuati
Descrivi i test che hai eseguito per verificare le modifiche:
- [ ] Test unitari passano
- [ ] Test di integrazione passano
- [ ] Test end-to-end passano
- [ ] Test manuali effettuati

### Test Environment
- **OS**: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
- **Node.js**: [e.g. 18.17.0]
- **Browser** (se applicabile): [e.g. Chrome 122, Firefox 115]

## 📋 Checklist
- [ ] Il mio codice segue le linee guida del progetto
- [ ] Ho eseguito un self-review del mio codice
- [ ] Ho commentato il codice, specialmente nelle parti difficili da capire
- [ ] Ho aggiunto test che dimostrano che la mia fix è efficace o che la mia feature funziona
- [ ] I test nuovi ed esistenti passano localmente
- [ ] Ho aggiornato la documentazione se necessario
- [ ] Ho verificato che non ci siano warning del linter
- [ ] Ho seguito le convenzioni di naming del progetto

## 🏗️ Modifiche Architetturali

### Microservizi Coinvolti
- [ ] User Service
- [ ] API Gateway  
- [ ] Frontend Portal
- [ ] Database Schema
- [ ] Kafka Topics
- [ ] Infrastructure/Docker

### API Changes
```json
// Eventuali modifiche alle API (endpoints, payload, response)
```

### Database Changes
```sql
-- Eventuali modifiche al database schema
```

### Breaking Changes
Se questa PR introduce breaking changes, descrivili qui e spiega il percorso di migrazione.

## 📸 Screenshot (se applicabile)
Aggiungi screenshot per mostrare le modifiche UI.

## 📝 Note Aggiuntive
Aggiungi qualsiasi informazione aggiuntiva che potrebbe essere utile per i reviewer.

## 👥 Reviewer Notes
- [ ] Richiede review architetturale
- [ ] Richiede review sicurezza
- [ ] Richiede test approfonditi
- [ ] Può essere mergato dopo approvazione singola
- [ ] Richiede multiple approvazioni

---
**Per i Reviewer**: Per favore verificate che:
- [ ] Il codice segue le best practices del progetto
- [ ] I test sono adeguati e passano
- [ ] La documentazione è aggiornata
- [ ] Non ci sono vulnerabilità di sicurezza evidenti
- [ ] Le performance non sono compromesse