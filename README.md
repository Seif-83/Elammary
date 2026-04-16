# 🛋️ Maison CRM — Furniture Management System

A full-stack CRM system built for furniture companies. Manage customers, orders, and products with a beautiful dark-themed interface.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Recharts, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | SQLite (via sql.js — zero native dependencies) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Pure CSS with CSS Variables |

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm

### 1. Install Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Install Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### 3. Default Login
```
Username: admin
Password: admin123
```

---

## Project Structure

```
furniture-crm/
├── backend/
│   ├── config/
│   │   └── database.js        # sql.js SQLite setup + seeding
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/login
│   │   ├── customers.js       # CRUD /api/customers
│   │   ├── orders.js          # CRUD /api/orders
│   │   ├── products.js        # CRUD /api/products
│   │   └── dashboard.js       # GET  /api/dashboard/stats
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment config
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js       # Axios client + interceptors
│   │   ├── context/
│   │   │   └── AuthContext.js # Auth state management
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Layout.js  # Sidebar + topbar shell
│   │   │       └── Layout.css
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── CustomersPage.js
│   │   │   ├── CustomerDetailPage.js
│   │   │   ├── OrdersPage.js
│   │   │   └── ProductsPage.js
│   │   ├── App.js             # Router + protected routes
│   │   ├── index.js           # React DOM entry
│   │   └── index.css          # Global design system
│   └── package.json
│
├── start.sh                   # One-command launcher
└── README.md
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/change-password` | Change admin password |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all (supports `?search=&tier=`) |
| GET | `/api/customers/:id` | Get + linked orders |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer + orders |
| PATCH | `/api/customers/:id/recalculate` | Recalculate tier from orders |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all (supports `?status=&customer_id=`) |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create order (auto-updates customer tier) |
| PUT | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all (supports `?search=&category=`) |
| GET | `/api/products/categories` | Get distinct categories |
| POST | `/api/products` | Add product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | All stats + charts data |

---

## Customer Tier Logic

Tiers are automatically calculated based on **delivered orders only**:

| Tier | Threshold |
|------|-----------|
| 🥇 VIP | Total ≥ $10,000 |
| 💙 Loyal | Total ≥ $4,000 |
| 👤 Regular | Total < $4,000 |

Tier is recalculated every time an order is created, updated, or deleted.

---

## Features

- **Dashboard** — Revenue charts, order status pies, top customers, recent activity
- **Customers** — Full CRUD, search, tier filter, VIP tagging
- **Customer Detail** — Dedicated profile with linked orders
- **Orders** — Full CRUD with customer link and status workflow
- **Products** — Furniture catalog with categories and stock tracking
- **Auth** — JWT login, token refresh, auto-logout on expiry
- **Responsive** — Works on desktop and mobile

---

## Customization

### Change admin password
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"newPass456"}'
```

### Scale to PostgreSQL
Replace `sql.js` in `backend/config/database.js` with `pg` (node-postgres) and update the query helpers. The route files use a simple `get/all/run` abstraction that maps cleanly to pg's `query()`.

---

*Built with ❤️ for furniture businesses*
