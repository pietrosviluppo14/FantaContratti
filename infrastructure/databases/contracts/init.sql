-- Inizializzazione Database Contracts
-- Schema per gestione contratti fantasy

-- Tabella principale contratti
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    rules JSONB DEFAULT '{}',
    budget BIGINT DEFAULT 0,
    max_players INTEGER DEFAULT 8,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella partecipanti contratti
CREATE TABLE IF NOT EXISTS contract_participants (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    role VARCHAR(50) DEFAULT 'player',
    status VARCHAR(50) DEFAULT 'invited',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella squadre
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    formation VARCHAR(10) DEFAULT '3-5-2',
    budget_used BIGINT DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella giocatori (database calciatori)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    team VARCHAR(255),
    league VARCHAR(100),
    value BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    season VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella rosa squadre utenti
CREATE TABLE IF NOT EXISTS team_players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id),
    role_in_team VARCHAR(50),
    is_captain BOOLEAN DEFAULT FALSE,
    acquisition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price_paid BIGINT DEFAULT 0
);

-- Tabella giornate/round
CREATE TABLE IF NOT EXISTS matchdays (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    name VARCHAR(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'upcoming'
);

-- Tabella voti/punteggi
CREATE TABLE IF NOT EXISTS player_scores (
    id SERIAL PRIMARY KEY,
    matchday_id INTEGER REFERENCES matchdays(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id),
    score DECIMAL(4,2) DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_contracts_creator ON contracts(creator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_participants_contract_user ON contract_participants(contract_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teams_contract ON teams(contract_id);
CREATE INDEX IF NOT EXISTS idx_teams_user ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_players_role ON players(role);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_team_players_team ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_matchdays_contract ON matchdays(contract_id);
CREATE INDEX IF NOT EXISTS idx_player_scores_matchday ON player_scores(matchday_id);

-- Trigger per update automatico timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dati di esempio per testing
INSERT INTO players (name, role, team, league, value, season) VALUES
('Lautaro Martinez', 'A', 'Inter', 'Serie A', 25000000, '2024-25'),
('Victor Osimhen', 'A', 'Napoli', 'Serie A', 30000000, '2024-25'),
('Khvicha Kvaratskhelia', 'C', 'Napoli', 'Serie A', 20000000, '2024-25'),
('Nicolò Barella', 'C', 'Inter', 'Serie A', 18000000, '2024-25'),
('Alessandro Bastoni', 'D', 'Inter', 'Serie A', 15000000, '2024-25'),
('Mike Maignan', 'P', 'Milan', 'Serie A', 12000000, '2024-25')
ON CONFLICT DO NOTHING;