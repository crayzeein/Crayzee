<div align="center">

# CRAYZEE.IN 🔥

### Gen-Z Streetwear E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

A modern, full-stack streetwear e-commerce platform built for Gen-Z — featuring AI-powered virtual try-on, real-time analytics, and enterprise-grade security.

**[Live Demo](https://crayzee.in)** · **[Report Bug](https://github.com/crayzeein/Crayzee/issues)**

</div>

---

## ⚡ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose 9), JWT Auth, Bcrypt |
| **Payments** | Razorpay (UPI, Cards, Net Banking, COD) |
| **AI** | HuggingFace Spaces — Virtual Try-On (Garment Transfer) |
| **Email** | Resend — Transactional Emails (Order Confirmation, Shipped, Delivered) |
| **Media** | Cloudinary — Image Upload & CDN |
| **Security** | Helmet, CORS, Express Rate Limit, NoSQL Injection Defense, OTP Brute-Force Protection |

---

## ✨ Features

### 🛍️ Shopping Experience
- **Browse & Filter** — Shop by Men, Women, categories (Oversized, Anime, Graphic, Regular) with real-time filtering
- **Smart Search** — Full-text product search with instant results
- **Wishlist & Cart** — Persistent state via Zustand + localStorage, survives page refreshes
- **Product Details** — High-res image gallery, size selector, similar products, social sharing
- **AI Virtual Try-On** — Upload your photo and see how any garment looks on you (HuggingFace AI, 3 tries/day)

### 💳 Checkout & Payments
- **Razorpay Integration** — UPI, Debit/Credit Cards, Net Banking, Wallets
- **Cash on Delivery** — With mandatory 10-digit phone validation to prevent RTO
- **Server-Side Price Validation** — Total computed on backend from DB prices, preventing cart tampering
- **Atomic Stock Management** — MongoDB transactions for race-condition-free stock deduction

### 📦 Order Management
- **Order Status Flow** — `Processing → Shipped → Delivered` with visual timeline for customers
- **Tracking Integration** — Admin enters Tracking ID + Courier (Delhivery, Shiprocket, BlueDart, DTDC, India Post, Ecom Express) when shipping
- **Customer Order History** — Filter by status (Processing, Shipped, Delivered, Cancelled)
- **Admin Order Actions** — Ship (with tracking), Deliver, Cancel (auto-restores stock)

### 📧 Transactional Emails
- **Order Confirmed** — Itemized receipt with shipping address and payment method
- **Order Shipped** — Tracking ID, courier name, estimated delivery
- **Order Delivered** — Thank you email with order summary

### 🛡️ Admin Dashboard
- **Overview** — Revenue, orders, users, products at a glance
- **Live Visitor Analytics** — Real-time active visitors, unique visitors (today/7-day), pageviews
- **Retention Metrics** — Returning visitors %, loyal customers (4+ visits), new vs returning breakdown
- **Top Visited Pages** — See which products/pages are trending
- **Full CRUD** — Manage products, categories, users, orders, and reviews
- **Role-Based Access** — Admin-only routes with JWT + role verification

### 🔒 Security (Audit-Hardened)
- **NoSQL Injection Defense** — All 6 auth endpoints sanitize inputs, reject MongoDB operators
- **OTP Brute-Force Protection** — 5-attempt cap per OTP + rate limiting on auth routes
- **Token Type Enforcement** — Refresh tokens cannot be used as access tokens
- **Session Revocation** — Password reset invalidates all existing refresh tokens
- **AI Try-On Quota** — DB-backed daily limit (persists across server restarts)
- **Rate Limiting** — Per-route limits on login, registration, OTP, try-on, and analytics

### 👤 User Features
- **Email + Google Auth** — Signup with OTP verification or one-click Google login
- **Password Reset** — Secure OTP-based reset flow with rate limiting
- **Wishlist** — Save products for later, synced with your account
- **Order Tracking** — Visual status timeline with tracking details

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Razorpay Account** ([dashboard.razorpay.com](https://dashboard.razorpay.com))
- **Resend Account** ([resend.com](https://resend.com)) for transactional emails
- **Cloudinary Account** ([cloudinary.com](https://cloudinary.com)) for image uploads

### Installation

```bash
# Clone the repository
git clone https://github.com/crayzeein/Crayzee.git
cd Crayzee
```

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=orders@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run seed   # Seed initial categories
npm run dev    # Starts on http://localhost:5000
```

#### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev    # Starts on http://localhost:3000
```

---

## 📁 Project Structure

```
Crayzee/
├── backend/
│   ├── controllers/        # Route handlers (auth, orders, products, analytics, tryon)
│   ├── middleware/          # Auth middleware (JWT verify, admin check)
│   ├── models/             # Mongoose schemas (User, Product, Order, Visit, Review)
│   ├── routes/             # Express route definitions
│   ├── utils/              # Email service, category seeder
│   └── index.js            # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── admin/      # Admin dashboard + components
│   │   │   ├── checkout/   # Checkout with Razorpay integration
│   │   │   ├── men/        # Men's collection
│   │   │   ├── women/      # Women's collection
│   │   │   ├── orders/     # Customer order history
│   │   │   ├── product/    # Product detail + AI try-on
│   │   │   └── ...
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # API client, helpers
│   └── public/             # Static assets
```

---

## 🎨 Design Philosophy

- **Brand Color** — `#fb5607` (Vibrant Orange) across all touchpoints
- **Dark Mode** — Full dark mode support with zinc color palette
- **Mobile-First** — Responsive design built for the scrolling generation
- **Premium UI** — Rounded cards, smooth Framer Motion animations, glassmorphism effects
- **Typography** — Clean, bold typography with `Outfit` font family

---

## 📄 License

This project is proprietary. All rights reserved by [Crayzee.in](https://crayzee.in).

---

<div align="center">

**Built with ❤️ and lots of ☕ by [Harshit Chaturvedi](https://github.com/crayzeein)**

</div>
