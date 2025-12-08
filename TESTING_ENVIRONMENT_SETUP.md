# Influxity.ai Testing Environment Setup Guide

**Objective:** This guide provides the specific steps to configure a local or staging environment to successfully run the entire `vitest` test suite for Influxity.ai.

---

## 1. MySQL Database Setup

The tests require a live connection to a MySQL database to verify database interactions, schema, and queries.

### Option A: Using Docker (Recommended)

This is the easiest and most consistent method.

**1. Install Docker:**
   - If you don't have Docker, download it from [Docker's official website](https://www.docker.com/products/docker-desktop).

**2. Run a MySQL Container:**
   - Open your terminal and run the following command:

   ```bash
   docker run --name influxity-mysql -e MYSQL_ROOT_PASSWORD=your_strong_password -e MYSQL_DATABASE=influxity_test -p 3306:3306 -d mysql:8
   ```

   - **`your_strong_password`**: Replace with a secure password.
   - This command starts a MySQL 8 server in the background, creates a database named `influxity_test`, and makes it available on `localhost:3006`.

**3. Construct the `DATABASE_URL`:**
   - Your database connection string will be:

   ```
   DATABASE_URL="mysql://root:your_strong_password@localhost:3306/influxity_test"
   ```

### Option B: Local MySQL Installation

If you have MySQL installed directly on your machine:

**1. Connect to MySQL:**
   - Open a terminal and connect to your MySQL server:

   ```bash
   mysql -u root -p
   ```

**2. Create the Test Database:**
   - In the MySQL prompt, run:

   ```sql
   CREATE DATABASE influxity_test;
   ```

**3. Create a Dedicated User (Optional but Recommended):**
   ```sql
   CREATE USER 'influxity_user'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON influxity_test.* TO 'influxity_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

**4. Construct the `DATABASE_URL`:**
   - If you created a dedicated user:
   ```
   DATABASE_URL="mysql://influxity_user:your_strong_password@localhost:3306/influxity_test"
   ```
   - If you are using the `root` user:
   ```
   DATABASE_URL="mysql://root:your_root_password@localhost:3306/influxity_test"
   ```

### Final Step: Update `.env` File

- Open the `.env` file in the root of the project.
- Add or update the `DATABASE_URL` with the connection string you constructed.


## 2. Stripe Test Environment Setup

The Stripe integration tests require valid **test mode** API keys.

**1. Create a Stripe Account:**
   - If you don't have one, sign up for a free account at [stripe.com](https://dashboard.stripe.com/register).

**2. Enable Test Mode:**
   - In your Stripe Dashboard, make sure the **"Test mode"** toggle is enabled (usually in the top-right corner).

**3. Get Your Test API Keys:**
   - Navigate to the **Developers** section.
   - Go to the **API Keys** tab.
   - You will find two essential keys:
     - **Publishable key:** Starts with `pk_test_...`
     - **Secret key:** Starts with `sk_test_...` (Click "Reveal test key" to see it).

**4. Get Your Webhook Signing Secret:**
   - In the **Developers** section, go to the **Webhooks** tab.
   - If you don't have a webhook endpoint for testing, create one (e.g., pointing to a local tunneling service like `ngrok`).
   - Click on your webhook endpoint to view its details.
   - Under **"Signing secret"**, click to reveal the secret. It will start with `whsec_...`.

**5. Update `.env` File:**
   - Open your `.env` file and add/update the following variables:

   ```
   STRIPE_SECRET_KEY="sk_test_...your_secret_key..."
   STRIPE_WEBHOOK_SECRET="whsec_...your_webhook_secret..."
   ```

**Important:** Never use your live (production) API keys for testing.


## 3. OpenAI API Setup

The AI feature tests make live calls to a Large Language Model (LLM) API. You will need a valid API key to run these tests.

**1. Create an OpenAI Account:**
   - Go to [platform.openai.com](https://platform.openai.com/signup) and create an account.

**2. Set Up Billing:**
   - To use the API, you may need to add a payment method to your OpenAI account. Navigate to the **Billing** section and add a credit card.

**3. Get Your API Key:**
   - Go to the **API Keys** section in your OpenAI dashboard.
   - Click **"Create new secret key"**.
   - Give it a name (e.g., "Influxity Test Key") and create the key.
   - **Important:** Copy the key immediately. You will not be able to see it again.

**4. Update `.env` File:**
   - The application is configured to use Manus Forge by default, but we can point it to the standard OpenAI API for testing.
   - Open your `.env` file and add/update the following variables:

   ```
   # URL for the OpenAI API
   BUILT_IN_FORGE_API_URL="https://api.openai.com/v1"

   # Your OpenAI secret key
   BUILT_IN_FORGE_API_KEY="sk-...your_openai_secret_key..."
   ```

**Note on Costs:** Running the tests will make a small number of API calls, which will incur minor costs on your OpenAI account (typically less than a few cents per test run).


## 4. OAuth & Authentication Setup

The authentication tests (`auth.logout.test.ts`) require a valid JWT secret to be configured.

**1. Generate a JWT Secret:**
   - You need a long, random, and secure string (at least 32 characters).
   - You can use an online generator or a command-line tool like `openssl`:

   ```bash
   openssl rand -hex 32
   ```

**2. Update `.env` File:**
   - Open your `.env` file and add the secret:

   ```
   JWT_SECRET="your_generated_32_character_secret"
   ```

**3. Owner Open ID:**
   - For certain administrative tests, an owner's Open ID is required. For testing purposes, you can use a placeholder.

   ```
   OWNER_OPEN_ID="test_owner_123"
   ```

---

## 5. Running the Tests

Once you have completed all the steps above, your `.env` file should look something like this:

```ini
# Node Environment
NODE_ENV=development

# Application Configuration
VITE_APP_ID=influxity_test_app
JWT_SECRET="your_generated_32_character_secret"

# Database Configuration
DATABASE_URL="mysql://root:your_strong_password@localhost:3306/influxity_test"

# OAuth Configuration
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID="test_owner_123"

# AI/LLM API Configuration
BUILT_IN_FORGE_API_URL="https://api.openai.com/v1"
BUILT_IN_FORGE_API_KEY="sk-...your_openai_secret_key..."

# Stripe Test Keys
STRIPE_SECRET_KEY="sk_test_...your_secret_key..."
STRIPE_WEBHOOK_SECRET="whsec_...your_webhook_secret..."
```

### Step 1: Push Database Schema

Before running the tests for the first time, you need to apply the database schema to your newly created test database.

```bash
pnpm db:push
```

### Step 2: Run the Test Suite

Now you can run the full test suite.

```bash
pnpm test
```

**Expected Result:** All 16 tests should now pass successfully. ✅
