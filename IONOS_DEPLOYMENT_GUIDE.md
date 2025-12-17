# Influxity.ai IONOS VPS Deployment Guide

**Date:** December 06, 2025  
**Author:** Manus AI  
**Status:** ✅ Complete

---

## Introduction

This guide provides a comprehensive, step-by-step process for deploying the Influxity.ai application from the `main` branch on GitHub to your new IONOS VPS (Ubuntu 24.04). Following these steps will result in a secure, production-ready, and permanently running application.

## 📋 Prerequisites

Before you begin, ensure you have the following information from your IONOS account and email:

1.  **VPS IP Address:** The public IP address of your server (e.g., `123.45.67.89`).
2.  **Root Password:** The initial password for the `root` user.
3.  **Domain Name:** The domain you will use (e.g., `influxity.ai`).

---

## Step 1: Initial Server Setup (Security First)

This step secures your server and creates a user for daily operations.

### 1.1 Connect to Your Server

Open a terminal on your local machine (Terminal on Mac/Linux, PowerShell on Windows) and connect as the `root` user:

```bash
ssh root@YOUR_VPS_IP_ADDRESS
```

- Replace `YOUR_VPS_IP_ADDRESS` with your server's IP.
- You will be asked for the root password.

### 1.2 Create a New User

Running everything as `root` is insecure. Let's create a new user named `deploy`:

```bash
adduser deploy
```

- You will be prompted to create a password for this new user. Make it strong.

### 1.3 Grant Administrative Privileges

Add the new user to the `sudo` group to allow it to run commands as an administrator:

```bash
usermod -aG sudo deploy
```

### 1.4 Set Up Basic Firewall

We will use `ufw` (Uncomplicated Firewall) to secure the server.

```bash
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw enable
```

- This allows SSH, web traffic (HTTP/HTTPS), and enables the firewall.

### 1.5 Re-login as the New User

Disconnect from the server (`exit`) and log back in as the `deploy` user:

```bash
ssh deploy@YOUR_VPS_IP_ADDRESS
```

From now on, all commands should be run as the `deploy` user.

---

## Step 2: Install Dependencies

Next, we install all the software required to run the application.

### 2.1 Install Node.js (via nvm)

We use `nvm` (Node Version Manager) to install and manage Node.js.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 2.2 Install MySQL Server

This installs the database server.

```bash
sudo apt update
sudo apt install mysql-server -y
```

### 2.3 Install Nginx and PM2

- **Nginx:** Our web server and reverse proxy.
- **PM2:** A process manager to keep the application running permanently.

```bash
sudo apt install nginx -y
sudo npm install pm2 -g
```

---

## Step 3: Configure MySQL Database

This step secures MySQL and creates the production database.

### 3.1 Secure MySQL Installation

Run the security script and follow the prompts. It is recommended to answer "yes" to all questions.

```bash
sudo mysql_secure_installation
```

### 3.2 Create Production Database and User

Log in to MySQL:

```bash
sudo mysql
```

Now, run these SQL commands inside the MySQL prompt:

```sql
CREATE DATABASE influxity_prod;
CREATE USER 'influxity_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DATABASE_PASSWORD';
GRANT ALL PRIVILEGES ON influxity_prod.* TO 'influxity_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

- **Important:** Replace `YOUR_STRONG_DATABASE_PASSWORD` with a secure password.

---

## Step 4: Clone & Build Application

Now we get the code from GitHub and prepare it for production.

### 4.1 Clone the Repository

```bash
git clone https://github.com/r2x66ycf9d-coder/influxity.ai.git
cd influxity.ai
```

### 4.2 Install Dependencies

```bash
npm install -g pnpm
pnpm install
```

### 4.3 Create Production `.env` File

Create a new `.env` file for production:

```bash
cp .env.example .env
nano .env
```

Now, fill in the values with your production credentials:

```ini
NODE_ENV=production

# Application Configuration
VITE_APP_ID=influxity_prod
JWT_SECRET=YOUR_32_CHAR_JWT_SECRET

# Database Configuration
DATABASE_URL="mysql://influxity_user:YOUR_STRONG_DATABASE_PASSWORD@localhost:3306/influxity_prod"

# OAuth Configuration
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=YOUR_OWNER_OPEN_ID

# AI/LLM API Configuration
BUILT_IN_FORGE_API_URL="https://api.openai.com/v1"
BUILT_IN_FORGE_API_KEY="YOUR_OPENAI_API_KEY"

# Stripe Production Keys
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_live_..."
```

- Press `Ctrl+X`, then `Y`, then `Enter` to save and exit `nano`.

### 4.4 Build the Application

This compiles the frontend and backend for production.

```bash
pnpm build
```

### 4.5 Apply Database Migrations

This sets up the tables in your new database.

```bash
pnpm db:push
```

---

## Step 5: Configure Nginx

This step routes traffic from your domain to the running application.

### 5.1 Create Nginx Server Block

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/YOUR_DOMAIN
```

- Replace `YOUR_DOMAIN` with your actual domain name (e.g., `influxity.ai`).

Paste the following configuration into the file:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- Replace `YOUR_DOMAIN` with your domain name.
- Save and exit (`Ctrl+X`, `Y`, `Enter`).

### 5.2 Enable the New Site

```bash
sudo ln -s /etc/nginx/sites-available/YOUR_DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Step 6: Set Up SSL with Let's Encrypt

This secures your site with HTTPS.

### 6.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate

Certbot will automatically get a certificate and update your Nginx configuration.

```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

- Follow the prompts. It will ask for your email and to agree to the terms.
- Choose to redirect HTTP traffic to HTTPS when asked.

---

## Step 7: Launch with PM2

This will start your application and ensure it restarts automatically.

### 7.1 Start the Application

```bash
pm2 start dist/index.js --name influxity-ai
```

### 7.2 Configure PM2 to Start on Reboot

```bash
pm2 startup
# Follow the command it gives you to run
pm2 save
```

---

## Step 8: Final DNS Configuration

In your **IONOS control panel**:

1.  Go to **Domains & SSL**.
2.  Select your domain.
3.  Go to the **DNS** tab.
4.  Edit the **A record** for `@` (your root domain).
5.  Set the **Value** to `YOUR_VPS_IP_ADDRESS`.
6.  Create or edit the **A record** for `www` and point it to the same IP address.
7.  Save changes. DNS can take a few minutes to a few hours to update globally.

---

## Step 9: Verification

Once DNS has propagated, you should be able to visit `https://YOUR_DOMAIN` in your browser and see your live application!

Congratulations! Your Influxity.ai application is now permanently deployed.
