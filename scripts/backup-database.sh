#!/bin/bash

###############################################################################
# Database Backup Script for Influxity.ai
# 
# This script creates automated backups of the MySQL database
# Usage: ./backup-database.sh
###############################################################################

set -e

# Configuration
BACKUP_DIR=~/influxity.ai/backups
DB_NAME="influxity_prod"
DB_USER="influxity_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/influxity_backup_$TIMESTAMP.sql"
RETENTION_DAYS=30

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

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

print_info "Starting database backup..."

# Read database password from .env file
if [ -f ~/influxity.ai/.env ]; then
    DB_PASSWORD=$(grep DATABASE_URL ~/influxity.ai/.env | cut -d':' -f3 | cut -d'@' -f1)
else
    print_error ".env file not found"
    exit 1
fi

# Create backup
print_info "Backing up database: $DB_NAME"
mysqldump -u $DB_USER -p"$DB_PASSWORD" $DB_NAME > $BACKUP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    # Compress backup
    print_info "Compressing backup..."
    gzip $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    print_success "Backup created: $BACKUP_FILE ($SIZE)"
    
    # Clean up old backups
    print_info "Cleaning up backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "influxity_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    BACKUP_COUNT=$(ls -1 $BACKUP_DIR/influxity_backup_*.sql.gz 2>/dev/null | wc -l)
    print_success "Total backups: $BACKUP_COUNT"
    
    print_success "Database backup complete!"
else
    print_error "Backup failed!"
    exit 1
fi
