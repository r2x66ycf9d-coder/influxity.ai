# Influxity.ai Deployment Guide

**Version:** 1.0.0
**Date:** December 06, 2025

---

## 1. Introduction

This guide provides step-by-step instructions for deploying the Influxity.ai application to a production environment. It covers server setup, environment configuration, database migration, and running the application.

This guide assumes you are deploying to a Linux-based server (e.g., Ubuntu 22.04).

---

## 2. Prerequisites

Before you begin, ensure your production server has the following installed:

- **Node.js:** v22.x or later
- **pnpm:** v9.x or later
- **Git:** Latest version
- **MySQL:** v8.x or later (or a compatible database like TiDB)
- **Nginx:** Latest stable version (for reverse proxy and SSL)
- **PM2:** A process manager for Node.js (`npm install -g pm2`)

---

## 3. Server Setup

### Step 3.1: Clone the Repository

Clone the project from GitHub into your desired directory (e.g., `/var/www/influxity.ai`).

```bash
git clone https://github.com/r2x66ycf9d-coder/influxity.ai.git /var/www/influxity.ai
cd /var/www/influxity.ai
```

### Step 3.2: Install Dependencies

Install the project dependencies using `pnpm`.

```bash
pnpm install --frozen-lockfile
```

---

## 4. Environment Configuration

### Step 4.1: Create Production `.env` File

Create a `.env` file in the root of the project. Use the `.env.example` file as a template.

```bash
cp .env.example .env
```

### Step 4.2: Edit Production Environment Variables

Open the `.env` file and fill in the values for your production environment. **Do not use development or test keys in production.**

```ini
# Set to production
NODE_ENV=production

# Your application's unique ID
VITE_APP_ID=your_production_app_id

# Generate a strong, unique 32+ character secret
JWT_SECRET=your_strong_jwt_secret_here

# Production database connection string
DATABASE_URL=mysql://<user>:<password>@<host>:<port>/<database>

# Manus OAuth configuration
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=your_owner_open_id

# AI/LLM API Configuration
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_production_openai_api_key

# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

**Security Note:** Ensure the `.env` file has restricted permissions (`chmod 600 .env`) so only the application user can read it.

---

## 5. Database Setup

### Step 5.1: Create the Database

Connect to your MySQL server and create a new database for Influxity.ai.

```sql
CREATE DATABASE influxity_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 5.2: Run Database Migrations

Drizzle Kit will use the `DATABASE_URL` from your `.env` file to connect to the database and apply the schema.

```bash
pnpm db:push
```

This command will synchronize your database schema with the one defined in `drizzle/schema.ts`.

---

## 6. Build the Application

Create a production-ready build of both the client and server.

```bash
pnpm build
```

This command will:
1.  Compile the TypeScript server code into the `dist/` directory.
2.  Build the React frontend into the `dist/client/` directory.

---

## 7. Running the Application with PM2

PM2 is a process manager that will keep your application running, automatically restart it on crashes, and handle logging.

### Step 7.1: Start the Application

Start the application using PM2. The entry point for the server is `dist/server/index.js`.

```bash
pm2 start dist/server/index.js --name "influxity-ai"
```

### Step 7.2: Save the Process List

Save the PM2 process list so it automatically restarts on server reboot.

```bash
pm2 save
```

### Step 7.3: Monitor Logs

You can monitor the application logs in real-time.

```bash
pm2 logs influxity-ai
```

---

## 8. Nginx Reverse Proxy Setup

Set up Nginx to act as a reverse proxy, forwarding requests to your Node.js application and handling SSL.

### Step 8.1: Create Nginx Configuration File

Create a new Nginx configuration file for your site.

```bash
sudo nano /etc/nginx/sites-available/influxity.ai
```

### Step 8.2: Add Server Block Configuration

Paste the following configuration into the file, replacing `your_domain.com` with your actual domain. This configuration assumes the application runs on port `3000`.

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com;

    # SSL Certificate Paths (replace with your actual paths)
    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    # SSL Configuration
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase max body size for file uploads if needed
    client_max_body_size 100M;
}
```

### Step 8.3: Enable the Site and Test Configuration

```bash
# Create a symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/influxity.ai /etc/nginx/sites-enabled/

# Test Nginx configuration for errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx
```

**Note on SSL:** The example above uses Let's Encrypt for SSL. You can obtain a free certificate using `certbot`.

---

## 9. Deployment Complete

Your Influxity.ai application should now be live and accessible at your domain. Remember to configure your Stripe account with the production webhook URL:

`https://your_domain.com/api/stripe/webhook`
