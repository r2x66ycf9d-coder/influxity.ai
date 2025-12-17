#!/bin/bash

###############################################################################
# Database Restore Script for Influxity.ai
# 
# This script restores the MySQL database from a backup
# Usage: ./restore-database.sh <backup_file>
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if backup file is provided
if [ -z "$1" ]; then
    print_error "Usage: ./restore-database.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ~/influxity.ai/backups/influxity_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="influxity_prod"
DB_USER="influxity_user"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

print_info "Restoring database from: $BACKUP_FILE"

# Read database password from .env file
if [ -f ~/influxity.ai/.env ]; then
    DB_PASSWORD=$(grep DATABASE_URL ~/influxity.ai/.env | cut -d':' -f3 | cut -d'@' -f1)
else
    print_error ".env file not found"
    exit 1
fi

# Warning
echo ""
print_error "WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Restore cancelled"
    exit 0
fi

# Stop application
print_info "Stopping application..."
pm2 stop influxity-ai 2>/dev/null || true

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    print_info "Decompressing backup..."
    TEMP_FILE="/tmp/influxity_restore_$$.sql"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
else
    TEMP_FILE=$BACKUP_FILE
fi

# Restore database
print_info "Restoring database..."
mysql -u $DB_USER -p"$DB_PASSWORD" $DB_NAME < $TEMP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Database restored successfully!"
    
    # Clean up temp file
    if [[ $BACKUP_FILE == *.gz ]]; then
        rm $TEMP_FILE
    fi
    
    # Restart application
    print_info "Restarting application..."
    pm2 restart influxity-ai
    
    print_success "Restore complete!"
else
    print_error "Restore failed!"
    pm2 restart influxity-ai
    exit 1
fi
