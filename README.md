# Digital Warranty and Service Tracker

A full-stack, enterprise-grade web application built to help households manage appliances, track warranty expiration timelines, schedule preventive and corrective maintenance, securely archive purchase invoices, and receive automated reminder alerts.

---

## 1. System Architecture & Features

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (Client)                    │
│      React 18 • Vite • Tailwind CSS • Recharts        │
│   Responsive Sidebar • Modals • Toast • Analytics      │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JWT Bearer Auth)
┌───────────────────────────▼────────────────────────────┐
│                   Backend (Server)                     │
│               Node.js 20+ • Express.js                │
│    Controllers • Routes • Middleware • Rate Limiting   │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
┌─────────────▼───────────────┐ ┌────────▼───────────────┐
│     Database & Storage      │ │   Background Engine    │
│  MongoDB • Mongoose Schemas │ │  node-cron Scheduler   │
│  Cloudinary / Local Uploads │ │  Idempotent Reminders  │
└─────────────────────────────┘ └────────────────────────┘
```

### Key Capabilities
- **Complete Authentication:** Secure registration, login, bcrypt password hashing (10 salt rounds), JWT token issuance, protected routes, and strict multi-tenant resource isolation.
- **Product Lifecycle Management:** Full CRUD for household assets across categories (`Electronics`, `Home Appliances`, `Furniture`, `Kitchen Appliances`, `Other`), model & serial tracking, and full search/filter/sort.
- **Accurate Warranty Math:** Automatic calculation of expiration dates from start date and duration. Handles month-end variances (e.g., leap-year Feb 29, Aug 31) and applies an **inclusive final day policy** (valid through 23:59:59).
- **Dynamic Status Classification:** Real-time computation of `Active`, `Expiring Soon` (≤ 30 days remaining), `Expired`, and `No Warranty` (duration 0).
- **Maintenance & Service Scheduler:** Book service visits, track estimated vs. actual costs, log technician notes, upload receipts, and manage statuses (`Scheduled`, `Completed`, `Cancelled`, `Overdue`).
- **Real-Time Analytics Dashboard:** Interactive KPI summary cards, Recharts pie and bar visualizations for warranty coverage breakdown and appliance category spending, plus expiring alert lists.
- **Automated Reminders:** Background cron job triggers notifications at 30, 7, and 1 day milestones before warranty expiration and for upcoming/overdue services. Includes idempotent deduplication keys preventing repeat notifications upon server restart.
- **Dual-Mode Document Archive:** Supports PDF, JPG, and PNG uploads (up to 5MB) for invoices and receipts. Automatically integrates with Cloudinary when credentials are configured, and gracefully falls back to secure local disk storage when offline.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide React, Day.js, Axios, React Router Dom v6
- **Backend:** Node.js, Express.js, Mongoose 8, jsonwebtoken, bcryptjs, multer, multer-storage-cloudinary, node-cron, nodemailer, express-rate-limit, cors, dotenv
- **Database:** MongoDB (Local instance or MongoDB Atlas)
- **Automated Testing:** Jest, Supertest

---

## 3. Project Directory Structure

```
SPM-project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection & pool config
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, me
│   │   ├── productController.js  # Product CRUD, filters, cascade delete
│   │   ├── serviceController.js  # Service scheduling, completion, cost logging
│   │   ├── dashboardController.js# Real MongoDB aggregations & chart metrics
│   │   ├── notificationController.js # Alerts, mark read, scan trigger
│   │   └── documentController.js # File uploads, previews, deletions
│   ├── jobs/
│   │   └── reminderCron.js       # Daily node-cron scheduler
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer verification
│   │   ├── errorHandler.js       # Centralized HTTP error handler
│   │   └── upload.js             # Multer with Cloudinary & local disk fallback
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   ├── Product.js            # Product schema with pre-save expiry hook
│   │   ├── ServiceRecord.js      # Service schema with overdue virtual
│   │   └── Notification.js       # Notification schema with deduplicationKey & TTL
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── documentRoutes.js
│   ├── services/
│   │   ├── notificationService.js# Idempotent reminder generation
│   │   └── emailService.js       # Nodemailer optional alert sender
│   ├── utils/
│   │   └── warrantyCalculator.js # Inclusive month-end date math
│   ├── tests/
│   │   ├── warrantyCalculator.test.js # Unit test suite
│   │   └── api.test.js           # Supertest API integration suite
│   ├── uploads/                  # Local storage directory (fallback)
│   ├── postman_collection.json   # Exported Postman API collection
│   ├── server.js                 # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI widgets & modals
│   │   ├── context/              # AuthContext & NotificationContext
│   │   ├── hooks/                # useAuth & useNotifications
│   │   ├── layouts/              # AppLayout (Sidebar + Navbar)
│   │   ├── pages/                # Dashboard, Products, Services, etc.
│   │   ├── services/             # Axios API service clients
│   │   ├── utils/                # Date formatting & currency utilities
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx              # React mount
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── package.json                  # Root monorepo orchestrator
├── README.md
└── .gitignore
```

---

## 4. Prerequisites

Make sure the following are installed on your machine:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Local MongoDB community edition running on `localhost:27017` OR a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## 5. Quick Start (Running Locally)

### Step 1: Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install separately inside `backend` and `frontend` folders via `npm install`)*.

### Step 2: Configure Backend Environment Variables
Inside the `backend/` folder, create `.env` based on `.env.example`:
```bash
cp backend/.env.example backend/.env
```
Default local `.env` values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/digital_warranty_tracker
JWT_SECRET=super_secret_jwt_key_for_digital_warranty_tracker_2026
JWT_EXPIRE=7d

# File Upload Configuration (Optional - falls back to local disk if blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Notifications (Optional - Nodemailer)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Digital Warranty Tracker" <notifications@warrantytracker.local>

# Cron Schedule (Default: Every day at 08:00 AM)
CRON_SCHEDULE=0 8 * * *
```

### Step 3: Start the Backend Server
```bash
npm run dev:backend
```
*The backend API will start on `http://localhost:5000`.*

### Step 4: Start the Frontend Application
In a separate terminal:
```bash
npm run dev:frontend
```
*The frontend will run at `http://localhost:5173` with automatic API proxying.*

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 6. Running Automated Tests

Run the backend test suite (32 unit & integration tests covering auth, warranty math, resource isolation, service tracking, notifications, and cascade deletions):

```bash
cd backend
npm test
```

Expected output:
```
PASS tests/api.test.js
PASS tests/warrantyCalculator.test.js

Test Suites: 2 passed, 2 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        5.72 s
```

---

## 7. Manual Testing Checklist

Use this checklist during evaluation to verify end-to-end functionality:

| # | Action | Expected Result | Verified |
|---|---|---|:---:|
| 1 | Register new account at `/register` | Form validates password length, hashes with bcrypt, issues JWT, and redirects to dashboard. | [x] |
| 2 | Register duplicate email | System returns HTTP 400 error: "An account with this email address already exists." | [x] |
| 3 | Add Product with 12 months warranty | Warranty expiration date auto-calculates to exactly 1 day before same calendar date 12 months later (inclusive policy). | [x] |
| 4 | Add Product with 0 duration | Status displays as `No Warranty` (never incorrectly labeled Expired). | [x] |
| 5 | Upload invoice attachment (PDF/PNG/JPG) | File appears under attached documents with download and in-app preview options. | [x] |
| 6 | Filter products by Category / Warranty Status | Grid updates dynamically based on dropdown selections. | [x] |
| 7 | Schedule Maintenance Service | Record appears in upcoming services list and links to product details. | [x] |
| 8 | Complete Service with Actual Cost | Status updates to `Completed`, timestamp recorded, and cost included in dashboard stats. | [x] |
| 9 | Check Notification Center | Click bell icon or navigate to `/notifications`. Click "Scan Reminders" to trigger instant background evaluation. | [x] |
| 10 | Delete Product | Confirmation modal warns user. Deleting product cascades and deletes its service records and uploaded files. | [x] |

---

## 8. Postman API Testing Instructions

An exportable Postman collection is included at:
[`backend/postman_collection.json`](file:///e:/SPM-project/backend/postman_collection.json)

### How to Import and Execute:
1. Open **Postman**.
2. Click **Import** (top left) and select `backend/postman_collection.json`.
3. The collection is pre-configured with the environment variable `{{baseUrl}}` set to `http://localhost:5000/api`.
4. Run the **Auth > Register User** or **Auth > Login User** request.
   - The test script will **automatically extract the JWT token** and store it into the `{{authToken}}` collection variable!
5. Now you can execute any protected endpoint in the `Products`, `Services`, `Dashboard`, and `Notifications` folders seamlessly.

---

## 9. Production Deployment Guide

### Option A: Monolithic or Split Cloud Hosting (e.g. Render / Railway)
1. **Backend Deployment (Node.js Web Service):**
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment Variables:
     - `PORT=5000`
     - `NODE_ENV=production`
     - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/warranty_tracker?retryWrites=true&w=majority`
     - `JWT_SECRET=<strong-random-64-char-string>`
     - `CLOUDINARY_CLOUD_NAME=<your-cloud-name>`
     - `CLOUDINARY_API_KEY=<your-api-key>`
     - `CLOUDINARY_API_SECRET=<your-api-secret>`

2. **Frontend Deployment (Vercel / Netlify / Render Static Site):**
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment Variables:
     - `VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api`

---

## 10. Troubleshooting & Common Errors

| Error | Root Cause | Solution |
|---|---|---|
| `[MongoDB Error] Connection failed` | Local MongoDB server is stopped or port 27017 is blocked. | Run `net start MongoDB` on Windows or check `MONGODB_URI` in `backend/.env`. |
| `Not authorized, invalid or expired token` | JWT token expired or missing from request headers. | Log out and log back in to refresh token. |
| `Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.` | Uploaded file has unsupported extension or mime type. | Only select valid image or PDF documents (max 5MB). |
| `Duplicate value entered for deduplicationKey` | Notification already exists for this event milestone. | This is by design: prevents duplicate alerts on server restarts. |
| `CORS error in browser console` | Frontend origin does not match backend CORS whitelist. | Add frontend origin to `app.use(cors(...))` in `backend/server.js`. |
