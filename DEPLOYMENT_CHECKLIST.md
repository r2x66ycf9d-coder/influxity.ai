# Influxity.ai Deployment Checklist

Use this checklist to ensure you have everything ready before and during deployment.

---

## Pre-Deployment Checklist

### ✅ IONOS VPS Information

- [ ] VPS IP Address: `_________________`
- [ ] Root Password: `_________________`
- [ ] VPS Status: Approved and Running

### ✅ Domain Configuration

- [ ] Domain Name: `_________________`
- [ ] Domain registered with IONOS
- [ ] DNS access available

### ✅ Production Credentials

- [ ] **JWT Secret** (32+ characters): `_________________`
- [ ] **Database Password**: `_________________`
- [ ] **OpenAI API Key**: `sk-_________________`
- [ ] **Stripe Secret Key** (production): `sk_live__________________`
- [ ] **Stripe Webhook Secret**: `whsec_live__________________`
- [ ] **Owner Open ID**: `_________________`

---

## Deployment Steps Checklist

Follow the steps in `IONOS_DEPLOYMENT_GUIDE.md` and check off each as you complete them:

### Step 1: Initial Server Setup
- [ ] 1.1 Connected to server via SSH as root
- [ ] 1.2 Created `deploy` user
- [ ] 1.3 Granted sudo privileges to `deploy`
- [ ] 1.4 Configured firewall (ufw)
- [ ] 1.5 Re-logged in as `deploy` user

### Step 2: Install Dependencies
- [ ] 2.1 Installed Node.js via nvm
- [ ] 2.2 Installed MySQL Server
- [ ] 2.3 Installed Nginx and PM2

### Step 3: Configure MySQL
- [ ] 3.1 Ran mysql_secure_installation
- [ ] 3.2 Created production database and user

### Step 4: Clone & Build Application
- [ ] 4.1 Cloned repository from GitHub
- [ ] 4.2 Installed pnpm and dependencies
- [ ] 4.3 Created production `.env` file with all credentials
- [ ] 4.4 Built the application (`pnpm build`)
- [ ] 4.5 Applied database migrations (`pnpm db:push`)

### Step 5: Configure Nginx
- [ ] 5.1 Created Nginx server block
- [ ] 5.2 Enabled the site and restarted Nginx

### Step 6: Set Up SSL
- [ ] 6.1 Installed Certbot
- [ ] 6.2 Obtained SSL certificate for domain

### Step 7: Launch with PM2
- [ ] 7.1 Started application with PM2
- [ ] 7.2 Configured PM2 to start on reboot

### Step 8: DNS Configuration
- [ ] 8.1 Updated A record for root domain
- [ ] 8.2 Updated A record for www subdomain
- [ ] 8.3 Waited for DNS propagation

### Step 9: Verification
- [ ] 9.1 Visited `https://YOUR_DOMAIN` in browser
- [ ] 9.2 Application loads successfully
- [ ] 9.3 HTTPS is working (padlock icon)
- [ ] 9.4 Can create account and log in
- [ ] 9.5 AI features are working

---

## Post-Deployment Checklist

### ✅ Monitoring & Maintenance

- [ ] Set up PM2 monitoring: `pm2 monitor`
- [ ] Check logs regularly: `pm2 logs influxity-ai`
- [ ] Set up automated backups for database
- [ ] Document any custom configurations

### ✅ Testing

- [ ] Test all AI features (chat, email, sales copy, content, analysis)
- [ ] Test Stripe payment integration
- [ ] Test user registration and login
- [ ] Test on mobile devices
- [ ] Test on different browsers

### ✅ Security

- [ ] Changed all default passwords
- [ ] Firewall is active and configured
- [ ] SSL certificate is valid
- [ ] Production API keys are being used (not test keys)

---

## Future Updates

To deploy future updates, simply run the automated deployment script:

```bash
cd ~/influxity.ai
./deploy.sh
```

This will:
1. Pull latest code from GitHub
2. Install new dependencies
3. Rebuild the application
4. Apply database migrations
5. Restart the application

---

## Troubleshooting

### Application won't start
```bash
pm2 logs influxity-ai --lines 50
```

### Database connection errors
```bash
mysql -u influxity_user -p influxity_prod
# Check if you can connect with the credentials in .env
```

### Nginx errors
```bash
sudo nginx -t  # Test configuration
sudo systemctl status nginx  # Check status
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### SSL certificate issues
```bash
sudo certbot certificates  # Check certificate status
sudo certbot renew --dry-run  # Test renewal
```

---

## Support

If you encounter any issues during deployment:

1. Check the logs: `pm2 logs influxity-ai`
2. Review the full guide: `IONOS_DEPLOYMENT_GUIDE.md`
3. Check GitHub issues: https://github.com/r2x66ycf9d-coder/influxity.ai/issues

---

**Deployment Date:** `_________________`  
**Deployed By:** `_________________`  
**Notes:** `_________________`
