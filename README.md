# 🍽️ Stay & Dine — Reserve and Dine Experience

Stay & Dine is a full-stack, enterprise-grade restaurant reservation system designed to streamline the dining experience. Unlike traditional booking platforms, Stay & Dine operates on a **"Reserve-and-Dine"** model—allowing customers to secure their table and pre-order their meals simultaneously. This ensures that upon arrival, guests can be seated immediately and their food prepared without delay.

The platform boasts a highly visual 2D interactive seating map, real-time WebSocket notifications, and a fully secured JWT-authenticated administrative dashboard.

---

## ✨ Signature Features

### 🗺️ 2D Interactive Table Selection
- **Visual Floor Plan**: A fully custom CSS-driven 2D floor plan featuring rich textures (Golden wood tables, distinct leather chairs).
- **Accurate Geometries**: Supports specific table geometries including 2-seater, 4-seater, 8-seater, and VIP 10-seater layouts with flawless spatial alignment.
- **Real-Time Status Indicators**: Dynamic glowing indicators (Available/Booked) and highly visible "RESERVED" tags.

### 🛡️ Enterprise-Grade Security
- **JWT Authentication**: All sensitive API endpoints are protected via JSON Web Tokens. The frontend utilizes Axios interceptors to automatically attach Bearer tokens, completely locking down the backend from unauthorized manipulation.
- **Secure File Uploads**: `multer` middleware is strictly filtered to only accept valid image types (`.jpeg`, `.png`, `.jpg`, `.webp`), preventing malicious script uploads.
- **Role-Based Access Control**: Strict segregation between `user` and `admin` roles handled directly at the database and middleware levels.

### ⚡ Real-Time Operations
- **WebSocket Integration**: Bookings and cancellations trigger instant, real-time push notifications to the Admin Dashboard without requiring page refreshes.
- **Live Occupancy Tracking**: The administrative dashboard features a live grid reflecting the exact state of the restaurant floor.

### 🍱 Pre-Arrival Dining & Nutrition
- **Interactive Menu**: Customers can browse categorized menus (Starters, Main Course, Desserts) during the booking phase.
- **Nutritional Transparency**: Every menu item tracks calories, proteins, and fibers.
- **Targeted Coupons**: Admins can issue personalized discount codes to specific users based on their booking frequency.

---

## 🏗️ Technical Architecture & Cloud Deployment

This platform is engineered using a fully decoupled, production-grade architecture deployed across modern cloud services.

### 🌐 Live Deployment
- **Frontend Hosting:** Vercel (CI/CD Integrated)
- **Backend API Hosting:** Render (Node.js Web Service)
- **Cloud Database:** TiDB Serverless (MySQL-compatible, highly scalable)

### 💻 Tech Stack & Security Features
| Layer | Technologies Used | Key Implementation Details |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, React Router DOM | High-performance SPA with seamless client-side routing. |
| **API & Networking** | Axios, Axios Interceptors | Global middleware automatically injects JWT Bearer tokens into every HTTP request. |
| **Styling** | Vanilla CSS, React Bootstrap | Custom 2D layouts mixed with robust, responsive primitives. |
| **Backend Core** | Node.js, Express.js | Robust REST API server with decoupled service routing. |
| **File Management** | Multer Middleware | Secure multipart/form-data processing for binary image uploads with strict type filtering. |
| **Database Security**| TiDB, MySQL2, Parameterized Queries | Highly secure TLS 1.2 encrypted connections protecting against SQL Injection. |
| **Authentication** | `jsonwebtoken`, `bcrypt` | Hardened route protection and secure one-way password hashing. |
| **Real-Time Data** | `ws` (WebSockets) | Live bidirectional event broadcasting for occupancy tracking. |

---

## 🚀 Local Development Setup

### 1. Database Initialization
1. Ensure MySQL is running on your machine.
2. Create a new database: `CREATE DATABASE hotel_booking;`
3. Import the schema and seed data:
   ```bash
   mysql -u root -p hotel_booking < backend/setup.sql
   ```

### 2. Environment Configuration
**Backend:**
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_booking
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend (Optional / Production):**
Create a `.env` file in the `frontend/` directory if you deploy the backend somewhere else:
```env
VITE_API_URL=https://your-production-backend.com
```

### 3. Install Dependencies
Install packages for both the backend and frontend:
```bash
# Root directory (if configured) or run inside respective folders
npm install
cd backend && npm install
```

### 4. Bootstrapping the Application
Run the backend API and WebSocket server:
```bash
cd backend
node server.cjs
# REST API -> http://localhost:5000
# WebSockets -> ws://localhost:8080
```

Run the Vite frontend:
```bash
# From the root or frontend directory
npm run dev
# Frontend -> http://localhost:5173
```

---

## 🔑 Authentication Access

To manage the restaurant layout, approve coupons, and monitor live seating, use the master administrative account:

- **Admin Login URL:** `/login`
- **Username:** `admin`
- **Password:** `password123`

*(Regular users can create their own accounts via the `/register` portal).*

---

## 🛠️ Folder Structure

```text
Stay_and_Dine/
├── backend/
│   ├── server.cjs          # Express + JWT + WebSocket Core
│   ├── setup.sql           # MySQL Schema & Setup
│   ├── .env                # Secrets & DB Config
│   └── uploads/            # Secure Image Storage
├── frontend/
│   ├── components/
│   │   ├── admin/          # Live Dashboard, Table & Menu Management
│   │   ├── auth/           # JWT Login, Protected Routes
│   │   └── user/           # 2D Floor Plan, Pre-ordering, History
│   ├── src/
│   │   ├── App.jsx         # Route mapping
│   │   ├── index.css       # Global 2D UI System
│   │   └── config/api.js   # Axios Interceptors
└── README.md
```

---
*Stay & Dine is built to bridge the gap between digital reservations and immediate culinary satisfaction.*
