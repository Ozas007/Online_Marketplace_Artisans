# Handmade Haven - Artisan Marketplace (Full MERN-like Stack with MySQL)

## 🧵 Project Overview

**Handmade Haven** is a full-stack online marketplace for unique artisan products, built with a React frontend, Node/Express backend, and MySQL database. It enables artisans to list handmade products, and customers to browse, add to cart, checkout, and view order history.

This repository contains:
- `frontend/`: React app UI and client-side logic
- `backend/`: Node/Express server, APIs, MySQL DB integration, seeder, authentication
- `uploads/`: Storage for uploaded product files/images

## 🚀 Why this Project Exists

Many artisans in small towns need a user-friendly platform to sell handmade goods globally. Handmade Haven solves this by combining:
- responsive product discovery
- cart/checkout flow
- user auth (customers + admin)
- order management
- product creation/editing
- contact support and blog features

---

## 🧩 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router DOM, Redux, Bootstrap, Styled Components |
| Backend | Node.js, Express, MySQL (mysql2), JWT-based auth |
| Database | MySQL (SQL schema in `backend/config/database.sql`) |
| File Upload | Multer (for product images) |
| Email | Nodemailer (contact form) |
| Utilities | dotenv, express-async-handler, morgan |

---

## 📁 Project Structure (High Level)

```
backend/
  server.js
  seeder.js
  config/
    db.js
    database.sql
  controllers/
  models/
  routes/
  middleware/
  utils/
frontend/
  public/
  src/
    components/
    screens/
    actions/
    reducers/
    constants/
    store.js
uploads/
README.md
package.json
```

---

## ✅ Features

- User registration and login
- Protected profile and order pages
- Admin product management (create, edit, delete)
- Product listing, search, filters, and pagination
- Add to cart, update quantity, remove items
- Place order and view order details
- PayPal payment integration flow
- Contact form with email notification
- Blog listing and single blog view
- Seeder script for sample data
- Upload product images with `Multer`

---

## ⚙️ Setup (Local Development)

### 1) Prerequisites

- Node.js 18+ (or stable)
- npm 9+
- MySQL server running locally
- (Optional) Postman for testing API

### 2) Clone repository

```bash
git clone https://github.com/<your-user>/online-marketplace-for-unique-artisan-main.git
cd online-marketplace-for-unique-artisan-main
```

### 3) Install dependencies

```bash
npm install
cd frontend && npm install
cd ..
```

### 4) Configure the database

Run the SQL script in `backend/config/database.sql`.

```sql
CREATE DATABASE IF NOT EXISTS handmade_haven;
USE handmade_haven;
-- create tables shown in file
```

Create `.env` in project root:

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=handmade_haven
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 5) Seed sample data (optional)

```bash
npm run data:import
```

To clear seeded data:

```bash
npm run data:destroy
```

### 6) Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 🧪 Scripts

- `npm run server` — backend only
- `npm run client` — frontend only
- `npm run dev` — backend + frontend concurrently
- `npm run data:import` — import seed data
- `npm run data:destroy` — delete seeded data

---

## 🔐 Auth & Roles

- User registration/login
- Admin product/order management
- JWT authentication

---

## 📦 API Overview

### Users
- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/users/profile` (private)
- `PUT /api/users/profile` (private)

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/products/upload` (admin)

### Orders
- `POST /api/orders` (private)
- `GET /api/orders/:id` (private)
- `PUT /api/orders/:id/pay` (private)
- `GET /api/orders/myorders` (private)

### Contact
- `POST /api/contact`

---

## ✅ Deployment

1. `cd frontend && npm run build`
2. Ensure backend serves `frontend/build`
3. Set env vars
4. `npm start`

---

## 🤝 Contributing

1. Fork
2. Branch
3. PR

---

## 📄 License

MIT

