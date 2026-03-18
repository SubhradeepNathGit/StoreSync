<h1 align="center">
  <br>
  <img src="https://img.icons8.com/color/96/000000/shop.png" alt="StoreSync" width="80">
  <br>
  StoreSync: Enterprise Multi-Tenant Inventory Ecosystem
  <br>
</h1>

<h4 align="center">A production-grade, highly-secured SaaS boilerplate built on the bleeding-edge MERN stack for global inventory management, complex RBAC, and advanced data visualization.</h4>

<p align="center">
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Stack-MERN-1CCB7E.svg?style=for-the-badge&logo=mongodb" alt="MERN Stack"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react" alt="React 19"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Express-5.x-000000.svg?style=for-the-badge&logo=express" alt="Express 5"></a>
  <a href="#-security--authentication"><img src="https://img.shields.io/badge/Security-Dual%20JWT%20%2B%20OTP-critical.svg?style=for-the-badge&logo=jsonwebtokens" alt="Security"></a>
  <a href="#-ui--ux"><img src="https://img.shields.io/badge/Tailwind-v4.0-06B6D4.svg?style=for-the-badge&logo=tailwindcss" alt="Tailwind 4"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge" alt="License: ISC"></a>
</p>

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-technical-highlights">Highlights</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture--patterns">Architecture</a> •
  <a href="#%EF%B8%8F-installation--setup">Setup</a>
</p>

---

## 📖 About The Project

**StoreSync** is not just another CRUD app; it's a meticulously crafted **Multi-Tenant SaaS solution**. Designed to showcase advanced full-stack capabilities, it handles isolated shop ecosystems (tenants) under a single centralized platform managed by Super Admins. 

Whether it's the complex **Role-Based Access Control (RBAC)** governing what a *Shop Owner* versus an *Employee* can do, or the **intelligent automated asset pipeline** ensuring absolute zero storage bloat during image replacements and soft-asset purges, this project demonstrates real-world software engineering practices.

> **💡 Recruiter Note:** This project demonstrates advanced architectural decisions including dual-token authentication patterns (Access + HTTP-Only Refresh cookies), React 19 concurrent features, Vite optimization, robust Mongoose schema designs with virtuals and pre/post hooks, comprehensive error handling mechanisms, and scalable UI component design using Tailwind v4.

---

## ✨ Technical Highlights

### 🛡️ Unrelenting Security & Authentication
* **Dual-Token Architecture:** Implementation of short-lived JWT Access Tokens paired securely with long-lived Refresh Tokens stored exclusively in HTTP-Only, Secure, SameSite cookies to mitigate XSS and CSRF attacks.
* **MFA/OTP Onboarding:** Integrated Nodemailer to dispatch 6-digit Secure OTPs over SMTP for critical identity verification.
* **API Hardening:** Fortified with `helmet` for HTTP header security, algorithmic password hashing via `bcryptjs`, and robust brute-force protection using `express-rate-limit`.
* **State-of-the-Art RBAC:** Middleware strictly segregating route access across 4 distinct tier levels: `Super Admin`, `Shop Owner`, `Manager`, and `Employee`.

### 🏢 Intelligent Multi-Tenant Architecture
* **Tenant Isolation:** Rigorous Mongoose query filtering ensures seamless logical segregation of shop data, products, categories, and analytics per tenant environment.
* **Advanced "Soft Delete" Infrastructure:** Implementation of a sophisticated internal Trash Bin system. Deleted items are flagged rather than dropped, allowing surgical recovery or secure background purging.
* **Asynchronous Asset GC (Garbage Collection):** Fully localized `multer` based static file streaming. Automated disk space clean-up algorithms wipe unreferenced images upon product updates or permanent entity deletion.

### 📊 Big Data Analytics & Visualization
* **Chart.js Engineering:** Deep integration with `chart.js` and `react-chartjs-2` projecting dynamic, interactive, responsive charts showcasing real-time organizational KPIs across sleek 3-column architectural grid structures.
* **Complex Data Aggregation:** Backend leveraging demanding MongoDB Aggregation Pipelines to process platform metrics like User Growth Trajectories, Daily Logins, Category Distribution, and Global Stock Evaluations.

### 🏎️ Flawless Client-Side Performance
* **Zustand State Orchestration:** Bypassed heavy context re-renders by executing lightning-fast UI and business logic state management via `zustand`.
* **Vite + React 19:** Phenomenal developer experience and blazing HMR speeds via Vite, coupled with the latest optimizations in React 19.
* **Component Modularity:** A strictly typed (via prop-types/structure), infinitely reusable UI component library utilizing `tailwind-merge` and `clsx` for dynamic Tailwind utility compilation without specificity clashes.

---

## 💻 Tech Stack

The application leverages a comprehensively modernized ecosystem, explicitly engineered for speed, scale, and maintainability:

### **Frontend layer**
* **Core:** React (v19.2), Vite (v7.2), React Router v7+
* **Data Flow:** Zustand (Global State), Axios (Robust interception pipelines)
* **Styling & UI:** Tailwind CSS (v4.1), clsx & tailwind-merge (Dynamic Class Utility)
* **Forms & Validation:** React Hook Form (Uncontrolled High-Performance Forms)
* **Data Visualization:** Chart.js, react-chartjs-2
* **Feedback & Icons:** React Toastify, Lucide-React

### **Backend micro-layer**
* **Core:** Node.js (v18+), Express.js (v5.1 for native Promise handling)
* **Database & ORM:** MongoDB, Mongoose (v8.19)
* **Authentication:** jsonwebtoken (JWT), bcryptjs
* **File Handling:** Multer, CSV-Parser (for streaming bulk imports framework)
* **Security & Utility:** Helmet, express-rate-limit, cors, compression, morgan (Logging)
* **Communications:** Nodemailer (SMTP OTP Delivery)

---

## 🏗️ Architecture & Patterns

* **Separation of Concerns (SoC):** Distinct separation between logic (Controllers), data (Models), requests (Routes), and validation/security (Middleware).
* **Fat Models, Skinny Controllers:** Utilizing Mongoose static/instance methods and virtuals to handle database logic, keeping Express controllers exclusively for request orchestration.
* **Data Sanitization Strategies:** Prohibiting NoSQL injection patterns at the middleware layer.
* **Centralized Error Handling:** Global Express error-handling middleware (`error.js`) parsing duplicate keys, validation errors, bad ObjectIDs, and unexpected server faults into clean standard JSON responses safely obscuring stack traces in production.

```text
📦 Architecture Overview
├── 📂 client (Vite + React 19)
│   ├── 📁 src
│   │   ├── 📁 api         # Singleton Axios instance + Access/Refresh Token Interceptors
│   │   ├── 📁 components  # Reusable Atoms/Molecules (Modals, Forms, Premium Chart Wrappers)
│   │   ├── 📁 context     # Context Providers for Auth verification boundaries
│   │   ├── 📁 pages       # Fully composed Route Views
│   │   ├── 📁 store       # Zustand atomic state slices
│   │   └── 📁 utils       # Formatting, Validation, Pre-loader functions
├── 📂 server (Node + Express 5)
│   ├── 📁 app
│   │   ├── 📁 controllers # Isolated Route Logic (Auth, Product, Admin, Category)
│   │   ├── 📁 middleware  # AuthGuard, RBAC Validation, Multer Interceptor, Error Catcher
│   │   ├── 📁 models      # Mongoose Schemas (Shop, User, Product, Token, etc.)
│   │   ├── 📁 routes      # Express v5 Routers
│   │   └── 📁 uploads     # Active localized static media directory
```

---

## ⚙️ Installation & Setup

### Requirements
* Node.js `v18.x` or higher
* MongoDB server (Local instance or Atlas Cluster)
* Valid SMTP Provider (e.g., Gmail App Password) for system emails

### 1. Repository Instantiation
```bash
git clone https://github.com/SubhradeepNathGit/Product-CRUD.git
cd Product-CRUD
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

### Author
Designed, engineered, and scaled by **Subhradeep Nath**.
* **GitHub:** [@SubhradeepNathGit](https://github.com/SubhradeepNathGit)

*If this code is insightful, or you happen to be a recruiter exploring my engineering standards, feel free to drop a ⭐ on the repository!*
