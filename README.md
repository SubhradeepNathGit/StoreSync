<h1 align="center">
  StoreSync: Enterprise Multi-Tenant Inventory Ecosystem
</h1>

<h4 align="center">A production-grade, highly-secured SaaS boilerplate built on the bleeding-edge MERN stack for global inventory management, complex RBAC, real-time task delegation, and advanced data visualization.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-1CCB7E.svg?style=for-the-badge&logo=mongodb" alt="MERN Stack">
  <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Express-5.x-000000.svg?style=for-the-badge&logo=express" alt="Express 5">
  <img src="https://img.shields.io/badge/Security-Dual%20JWT%20%2B%20OTP-critical.svg?style=for-the-badge&logo=jsonwebtokens" alt="Security">
</p>

## 📖 Executive Summary for Recruiters & Engineering Managers

**StoreSync** is not a standard CRUD application; it is a meticulously architected **Multi-Tenant SaaS solution** built to demonstrate enterprise-level full-stack engineering. It handles isolated shop ecosystems (tenants) under a centralized platform overseen by Super Admins. 

This repository was purposefully designed to showcase advanced capabilities in **Backend Architecture**, **Frontend State Management**, and **System Security**. The codebase meticulously implements:
- **Dual-Token Authentication** (short-lived access + HTTP-only refresh).
- **Socket.io** for real-time bi-directional events (live task delegation).
- **Comprehensive RBAC** (Super Admin → Shop Owner → Manager → Employee).
- **Cloudinary Asset Pipelines** combined with robust background garbage collection.
- **Large Dataset Handling** via CSV parsing streams.

---

## 🏗️ Deep Dive: Codebase Architecture & File Level Analysis

To fully understand the scale of this project, here is a detailed breakdown of the exact engineering standards implemented across the Client and Server environments.

### 1. Database Schema & Data Modeling (`server/app/models`)
The data layer uses Mongoose with strict schema validations, virtual fields, and query middleware:
- **`User.js`**: Centralized identity model. Manages roles, hashed passwords (bcrypt), and account verification states (OTP).
- **`Shop.js`**: The core multi-tenant entity. Each user/product/task belongs to a specific Shop, ensuring logical data isolation.
- **`Product.js`**: Handles massive enterprise inventory. Incorporates smart "Soft Delete" logic (flagging items for trash bins rather than dropping them to retain referential integrity).
- **`Task.js`**: Powers the real-time project management aspect. Tracks task assignment between managers and employees. 
- **`Category.js` & `Subcategory.js`**: Hierarchical taxonomies for deep inventory sorting.
- **`AuditLog.js`**: Security compliance tracker. Automatically records sensitive data modifications and user actions historically.

### 2. Business Logic Controllers (`server/app/controllers`)
Using "Fat Models, Skinny Controllers" patterns to keep Express routing clean. Controller actions are heavily sanitized and strictly return unified JSON structures:
- **`AuthController.js`**: Orchestrates the multi-layered login. Handles sign-ins, SMTP Nodemailer OTP dispatching, password resets, and token refreshing flows.
- **`AdminController.js` & `ShopController.js`**: Exclusively restricted to `SuperAdmin` roles for overseeing overall platform health, approving shops, and assessing total SaaS analytics.
- **`ProductController.js`**: Beyond standard CRUD, this includes streaming `csv-parser` logic for bulk importing hundreds of products (`products_300.csv`), interacting with `Cloudinary` for media, and managing soft deletes.
- **`TaskController.js`**: RESTful endpoints coupled with Socket.io emitter integrations to instantly notify staff of new task assignments without page reloads.

### 3. Middleware & Security Enforcements (`server/app/middleware`)
The nervous system of the API's security:
- **`AuthGuard` (JWT Validation)**: Intercepts requests, validates Bearer tokens via `jsonwebtoken`, handles token expiration caching, and populates `req.user`.
- **RBAC Validator**: Verifies hierarchical clearance (e.g., ensuring an Employee cannot access Shop Owner analytical endpoints).
- **File Interceptors (`multer`)**: Strictly types incoming multipart/form-data, validating MIME types and routing image streams directly to Cloudinary or localized `/uploads` depending on environment configuration.
- **Error Boundaries**: A global centralized error catcher that intercepts MongoDB CastErrors, Duplication Keys, and raw Server exceptions without leaking stack traces.

### 4. Client-Side Engineering (`client/src`)
Built on React 19 and Vite for phenomenal hot-module replacement and rendering speeds:
- **State Orchestration (`src/store`)**: completely bypassed React Context rendering bottlenecks by utilizing **Zustand** for atomic, lightning-fast global state slices (User State, Auth State).
- **Network Pipeline (`src/api`)**: A sophisticated singleton Axios instance featuring automated request/response interceptors. Seamlessly catches 401 Unauthorized errors and attempts silent token refreshes via cookies before forcing a user logout.
- **Routing Engine (`src/routes`)**: Protected boundaries using `react-router-dom` v7. Routes like `<PrivateRoute>` dynamically assess Zustand auth state and user roles before rendering dashboards or kicking users back to `/login`.
- **Dynamic UI & Metrics (`src/components` & `src/pages`)**: 
  - Composed strictly typed components enhanced via `clsx` and `tailwind-merge` preventing layout specificity clashes.
  - Implemented `react-hook-form` for uncontrolled, re-render-free user inputs.
  - Integrated `chart.js`, `recharts`, & `react-chartjs-2` to map heavy aggregation pipelines into beautiful, interactive analytical dashboards for the Admin and Shop Owners.

---

## ✨ Standout Technical Features

### 🛡️ Unrelenting Security Ecosystem
- **XSS & CSRF Mitigation**: Refresh Tokens are explicitly denied JavaScript DOM access, existing purely in `Secure`, `SameSite=Strict`, `HTTP-Only` cookies.
- **Brute Force Protection**: API requests are throttled intelligently via `express-rate-limit`.
- **Data Protection**: HTTP headers are hardened using `helmet`, and NoSQL injection attempts are inherently sanitized through Mongoose strict schemas.

### 🚀 Asynchronous Task & Asset Management
- **Live Sockets**: The application utilizes `socket.io` for bi-directional communication, ensuring the `Task Management` interface is instantly reactive across multiple browser instances.
- **Cloudinary Asset Garbage Collection**: Unused, overwritten, or "deleted" product images trigger asynchronous teardown events to Cloudinary, ensuring zero storage bloat over time.

### 📊 Heavy Data Aggregation
The MongoDB backend isn't just performing `.find()`. It executes dense **Aggregation Pipelines** mapping complex data sets such as User Growth Trajectories, Daily Logins, Category Distributions, and comprehensive Platform Stock Valuations cleanly to the frontend charting software.

---

## 💻 Full Stack Technology Arsenal

### **Frontend layer**
* **Core:** React (v19.2), Vite (v7.2), React Router v7+
* **Data Flow:** Zustand (Global State), Axios (Robust interception pipelines)
* **Styling & UI:** Tailwind CSS (v4.1), clsx & tailwind-merge (Dynamic Class Utility)
* **Forms & Validation:** React Hook Form (Uncontrolled High-Performance Forms)
* **Data Visualization:** Chart.js, Recharts, react-chartjs-2
* **Feedback & Icons:** React Toastify, Lucide-React

### **Backend micro-layer**
* **Core:** Node.js (v18+), Express.js (v5.1 for native Promise handling)
* **Database & ORM:** MongoDB, Mongoose (v8.19)
* **Authentication:** jsonwebtoken (JWT), bcryptjs
* **File Handling:** Multer, Multer-Storage-Cloudinary, CSV-Parser (for streaming bulk imports framework)
* **Security & Utility:** Helmet, express-rate-limit, cors, compression, morgan (Logging)
* **Communications:** Nodemailer (SMTP OTP Delivery), Socket.io (Realtime)

---

## ⚙️ Installation & Setup

### Requirements
* Node.js `v18.x` or higher
* MongoDB server (Local instance or Atlas Cluster)
* Valid SMTP Provider (e.g., Gmail App Password) for system emails

### 1. Repository Instantiation
```bash
git clone https://github.com/SubhradeepNathGit/StoreSync.git
cd StoreSync
```

### 2. Backend Bootstrapping
```bash
cd server
npm install
```

Create a deeply secure `.env` file in the `/server` directory:
```env
PORT=3006
MONGO_URI=mongodb+srv://<auth>@cluster.mongodb.net/storesync
JWT_SECRET=your_ultra_secure_64byte_secret
JWT_REFRESH_SECRET=your_isolated_refresh_secret

# SMTP Server Configurations for automated OTP routing
EMAIL_USER=your_verified_service_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret

# Client CORS Routing
CLIENT_URL=http://localhost:5173
```
Start the localized development runtime:
```bash
npm run dev
```

### 3. Frontend Instantiation
Open a new terminal session securely anchored in the project root:
```bash
cd client
npm install
npm run dev
```

---

## 📈 Future Roadmaps / Extensibility
* Transitioning strictly towards Typescript architectures to fortify endpoint data-contracting.
* Integrating Redis logic layers to cache exhaustive analytical DB queries globally.
* Developing comprehensive Test-Driven parameters using Jest & Cypress.
* Containerization using Docker to standardize platform deployment methodologies utilizing Kubernetes auto-scaling infrastructures.

---

<p align="center">
  <b>Designed, engineered, and scaled by Subhradeep Nath.</b><br>
  <i>If you are a Recruiter, Engineering Manager, or Developer assessing my architectural standards, please feel free to explore the codebase and drop a ⭐ if you found the engineering insightful!</i>
</p>
