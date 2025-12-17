#!/bin/bash

###############################################################################
# Monitoring Setup Script for Influxity.ai
# 
# This script sets up PM2 monitoring, log rotation, and health checks
###############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_info "Setting up monitoring for Influxity.ai..."

# Install PM2 log rotate module
print_info "Installing PM2 log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
print_success "Log rotation configured (10MB max, 7 days retention)"

# Set up PM2 monitoring
print_info "Configuring PM2 monitoring..."
pm2 install pm2-server-monit
print_success "PM2 monitoring installed"

# Create health check script
print_info "Creating health check script..."
cat > ~/influxity.ai/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for Influxity.ai
# Run this periodically to ensure the application is healthy

APP_URL="http://localhost:3000"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL/api/health)

if [ "$RESPONSE" = "200" ]; then
    echo "✓ Application is healthy (HTTP $RESPONSE)"
    exit 0
else
    echo "✗ Application is unhealthy (HTTP $RESPONSE)"
    echo "Attempting to restart..."
    pm2 restart influxity-ai
    exit 1
fi
EOF

chmod +x ~/influxity.ai/scripts/health-check.sh
print_success "Health check script created"

# Set up cron job for health checks (every 5 minutes)
print_info "Setting up automated health checks..."
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/influxity.ai/scripts/health-check.sh >> ~/influxity.ai/logs/health-check.log 2>&1") | crontab -
print_success "Health checks will run every 5 minutes"

# Create logs directory
mkdir -p ~/influxity.ai/logs
print_success "Logs directory created"

print_success "Monitoring setup complete!"
echo ""
echo "Available monitoring commands:"
echo "  pm2 monit          - Real-time monitoring dashboard"
echo "  pm2 logs           - View application logs"
echo "  pm2 status         - Check application status"
echo "  pm2 describe influxity-ai - Detailed app information"
