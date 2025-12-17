#!/bin/bash

###############################################################################
# Influxity.ai Automated Deployment Script
# 
# This script automates the deployment process for the Influxity.ai application
# on an IONOS VPS running Ubuntu 24.04.
#
# Usage: ./deploy.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header() {
    echo ""
    echo "============================================"
    echo "$1"
    echo "============================================"
}

# Check if running as deploy user (not root)
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root. Run as the 'deploy' user."
    exit 1
fi

print_header "Influxity.ai Deployment Script"

# Step 1: Pull latest code
print_header "Step 1: Pulling Latest Code from GitHub"
print_info "Fetching latest changes from main branch..."
git pull origin main
print_success "Code updated successfully"

# Step 2: Install dependencies
print_header "Step 2: Installing Dependencies"
print_info "Running pnpm install..."
pnpm install
print_success "Dependencies installed"

# Step 3: Build application
print_header "Step 3: Building Application"
print_info "Running production build..."
pnpm build
print_success "Application built successfully"

# Step 4: Apply database migrations
print_header "Step 4: Applying Database Migrations"
print_info "Pushing database schema changes..."
pnpm db:push
print_success "Database migrations applied"

# Step 5: Restart application with PM2
print_header "Step 5: Restarting Application"
print_info "Restarting with PM2..."

# Check if app is already running
if pm2 list | grep -q "influxity-ai"; then
    print_info "Application is running, restarting..."
    pm2 restart influxity-ai
else
    print_info "Starting application for the first time..."
    pm2 start dist/index.js --name influxity-ai
    pm2 save
fi

print_success "Application restarted successfully"

# Step 6: Check application status
print_header "Step 6: Verifying Deployment"
sleep 3  # Give app a moment to start

if pm2 list | grep -q "online"; then
    print_success "Application is running!"
    echo ""
    pm2 status influxity-ai
    echo ""
    print_success "Deployment completed successfully!"
    print_info "Your application is now live at https://YOUR_DOMAIN"
else
    print_error "Application failed to start. Check logs with: pm2 logs influxity-ai"
    exit 1
fi

print_header "Deployment Complete"
