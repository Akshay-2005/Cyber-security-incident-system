# AegisSentinel REST API Documentation

The AegisSentinel system exposes a secure, high-performance RESTful API endpoints structure to manage cyber security incidents, record raw network intrusions, track security analyst leaderboard speeds, and coordinate Salesforce CRM database syncs.

Base Path: `http://localhost:5001/api`

---

## 🔑 Authentication System

### 1. Register Analyst Account
* **Endpoint:** `POST /api/auth/register`
* **Headers:** `Content-Type: application/json`
* **JSON Body Parameters:**
  ```json
  {
    "name": "Anjali Singh",
    "email": "anjali@aegis.com",
    "password": "password123",
    "role": "Analyst"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664e10ab6df2a42bb95f50f1",
      "name": "Anjali Singh",
      "email": "anjali@aegis.com",
      "role": "Analyst"
    }
  }
  ```

### 2. Login Analyst
* **Endpoint:** `POST /api/auth/login`
* **JSON Body Parameters:**
  ```json
  {
    "email": "admin@aegis.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664e10ab6df2a42bb95f50f3",
      "name": "Administrator",
      "email": "admin@aegis.com",
      "role": "Admin"
    }
  }
  ```

---

## 🚨 Cyber Incident Module
*All routes below require `Authorization: Bearer <JWT_TOKEN>`*

### 1. File Cyber Incident
* **Endpoint:** `POST /api/incidents`
* **JSON Body Parameters:**
  ```json
  {
    "incidentName": "Endpoint Wannacry Probe Triggered",
    "threatType": "Ransomware Payload",
    "severity": "High",
    "priority": "High",
    "sourceIp": "91.240.118.82",
    "destinationIp": "192.168.4.88",
    "assignedAnalyst": "Rahul Sharma",
    "status": "New",
    "resolutionNotes": ""
  }
  ```
* **Behavior Details:**
  * If `severity` is `High`, an automatic HTML-styled Nodemailer email is dispatched in the background to the SOC operations list.
  * Synchronizes dynamically with Salesforce custom object `Cyber_Incident__c` REST endpoints. Mapped `salesforceId` is updated in local MongoDB collection.

### 2. Query Incidents (with filters & search)
* **Endpoint:** `GET /api/incidents`
* **Query Parameters:**
  * `search` (Optional) - Fuzzy string filter checking name, IPs, and assigned analyst.
  * `status` (Optional) - `New`, `In Progress`, `Resolved`, `Closed`
  * `severity` (Optional) - `Low`, `Medium`, `High`
  * `page` (Optional, Default: `1`)
  * `limit` (Optional, Default: `10`)

### 3. Update Incident details
* **Endpoint:** `PUT /api/incidents/:id`
* **JSON Body Parameters:** Similar to Create body.
* **Behavior Details:**
  * Synchronizes modified properties to matched record on Salesforce custom object.

### 4. Delete Incident Record
* **Endpoint:** `DELETE /api/incidents/:id`
* **Security Rules:** Requires `Admin` or `Security Engineer` authorization roles.
* **Behavior Details:**
  * Purges local MongoDB record and dispatches a REST `DELETE` request to Salesforce.

---

## 📊 Threat Intelligence Logs

### 1. Log Intrusion Event
* **Endpoint:** `POST /api/threats`
* **JSON Body Parameters:**
  ```json
  {
    "threatLogName": "Port Intrusion Activity TL-044",
    "threatType": "Suspicious Login Attempt",
    "threatLevel": "Medium",
    "sourceIp": "185.220.101.44",
    "destinationIp": "10.0.4.15",
    "linkedIncident": "664e10ab6df2a42bb95f50f8"
  }
  ```

### 2. Fetch Integrated Threat Analytics
* **Endpoint:** `GET /api/threats/analytics`
* **Returns:** Aggregated summaries of type, level distributions, and trend metrics for Recharts rendering.

---

## 📈 Analyst Performance Leaderboard

### 1. Query SOC Leaderboard
* **Endpoint:** `GET /api/analysts/leaderboard`
* **Returns:** List of SOC analysts sorted by cases resolved and SLA adherence percentages.
