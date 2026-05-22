# Salesforce DX Integration & Deployment Guide

This guide details the step-by-step procedures to configure, authorize, and deploy AegisSentinel custom metadata assets and Apex code into your Salesforce Developer or Sandbox Org.

---

## 🛠️ VS Code & SFDX Workspace Environment Setup

### 1. Prerequisites
* **Salesforce CLI:** Install the official CLI framework ([Salesforce CLI Downloads](https://developer.salesforce.com/tools/sfdxcli)). Verify by running:
  ```bash
  sf --version
  # OR
  sfdx --version
  ```
* **VS Code Extensions:** Install the **Salesforce Extension Pack** from the marketplace.

### 2. Salesforce Project Initialization
Our workspace contains standard SFDX compatible configuration layouts under `salesforce/` folder. The manifest config uses API version `60.0` (Spring '24).

---

## 🔑 Connected App & JWT OAuth 2.0 Integration Setup

To authorize the Node.js backend to push data to Salesforce dynamically, we set up a Connected App utilizing JWT OAuth:

### Step 1: Generate Private Key and Certificate
Run the following openssl commands in your terminal to generate a self-signed security certificate:
```bash
# Generate private key
openssl genrsa -des3 -passout pass:somePassword -out server.pass.key 2048
openssl rsa -passin pass:somePassword -in server.pass.key -out server.key

# Generate signing certificate
openssl req -new -key server.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
```
Keep `server.key` secure, as this represents your client assertion credential.

### Step 2: Register Connected App in Salesforce
1. Log in to your Salesforce Org. Go to **Setup &rarr; App Manager &rarr; New Connected App**.
2. Set basic parameters:
   * **Connected App Name:** `AegisSentinel Gateway`
   * **Contact Email:** `security-ops@aegissentinel.com`
3. Configure **API (Enable OAuth Settings)**:
   * **Callback URL:** `http://localhost:3000/oauth/callback`
   * Check **Use digital signatures** and upload your generated `server.crt` certificate.
   * Add the following **OAuth Scopes**:
     * `Manage user data via APIs (api)`
     * `Perform requests at any time (refresh_token, offline_access)`
4. Save and copy the generated **Consumer Key** (this maps to your `SF_CLIENT_ID` in `.env`).

### Step 3: Configure Authorization Policies
1. Go to your Connected App configuration in Salesforce.
2. Select **Manage &rarr; Edit Policies**.
3. Under **OAuth Policies**, change **Permitted Users** to:
   * *"Admin approved users are pre-authorized"*.
4. Save, then scroll down to **Profiles** and assign the appropriate security profiles (e.g., *System Administrator* or a custom *SOC Analyst* profile).

---

## 📦 Named Credentials Setup (Outbound Calls to Node.js)

To authorize Salesforce Apex classes to make secure REST callouts back to your Node.js backend:

1. Go to **Setup &rarr; Security &rarr; Named Credentials**.
2. Click **New Legacy Named Credential** (or Standard Named Credential with External Credential):
   * **Label:** `AegisSentinelBackend`
   * **Name:** `AegisSentinelBackend`
   * **URL:** `http://your-node-backend-domain.com/api` (use staging URL or ngrok tunnels for local development)
   * **Identity Type:** `Named Principal`
   * **Authentication Protocol:** `Password`
   * **Username/Password:** Register your Node.js account credentials.
3. Save the record. This allows Apex code to call `req.setEndpoint('callout:AegisSentinelBackend/incidents')` securely without hardcoding domains.

---

## 🚀 Step-by-Step SFDX Deployment Commands

Navigate to the `salesforce/` directory before running the following terminal commands:

### 1. Authorize your target Salesforce Org
Log in securely to your developer hub or sandbox org:
```bash
# Using modern SF CLI (recommended)
sf org login web --alias aegis-sandbox --instance-url https://login.salesforce.com --set-default

# Using legacy SFDX commands
sfdx force:auth:web:login --setalias aegis-sandbox --instanceurl https://login.salesforce.com --setdefaultusername
```

### 2. Validate Code Metadata integrity
Perform a test-run validation build to confirm metadata matches Salesforce API expectations:
```bash
# Modern CLI validation
sf project deploy start --dry-run --target-org aegis-sandbox

# Legacy CLI validation
sfdx force:source:deploy --sourcepath force-app --check --targetusername aegis-sandbox
```

### 3. Deploy Metadata (Custom Objects, Trigger, Apex Class, Flow)
Initiate absolute metadata deployment pushes into your org:
```bash
# Modern CLI deploy
sf project deploy start --target-org aegis-sandbox

# Legacy CLI deploy
sfdx force:source:deploy --sourcepath force-app --targetusername aegis-sandbox
```

### 4. Assign Security Permissions and Profiles
Open the target Salesforce Org in a browser window to assign custom field access permissions to profiles:
```bash
# Open Org dashboard immediately
sf org open --target-org aegis-sandbox
```
*(Verify under **Setup &rarr; Object Manager &rarr; Cyber Incident &rarr; Fields &rarr; Set Field-Level Security** to make sure fields are Visible/Read-Write for your profiles)*.
