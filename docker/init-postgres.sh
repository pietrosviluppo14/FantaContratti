#!/bin/bash
set -e

# Set password for postgres user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER USER postgres WITH PASSWORD 'password123';
EOSQL

echo "PostgreSQL password set successfully"