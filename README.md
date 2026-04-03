# Crayzee.in - Gen-Z Streetwear E-commerce 🚀

Crayzee.in is a modern, full-stack e-commerce platform designed for the Gen-Z audience. It features a vibrant, high-energy UI inspired by streetwear brands like Bewakoof, but with a unique twist of neon accents, glassmorphism, and playful animations.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Zustand, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.
- **Security**: Helmet, Express Rate Limit, CORS, Input Validation.

## ✨ Core Features

### 🛍 Shopping Experience
- **Dynamic Browsing**: Filter T-shirts by categories (Oversized, Anime, Graphic, Trendy, Plain).
- **Search**: Fast search for products.
- **Wishlist & Cart**: Persistent state management using Zustand and local storage.
- **Product Details**: View high-quality images and detailed descriptions.
- **Social Sharing**: Share your favorite styles with social buttons.

### 👤 User Features
- **Authentication**: Secure Signup/Login using JWT and Bcrypt.
- **User Profile**: Manage your account and view order history.
- **Interactions**: Like products and add comments.

### 🛡 Admin Panel
- **Dashboard**: View high-level stats (Products, Users, Orders).
- **Inventory Management**: Full CRUD operations for products.
- **Security**: Role-based access control (Admin only).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd blazing-kepler
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Create .env file based on the provided values
    npm run seed # Populate initial data
    npm run dev  # Run on http://localhost:5000
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../frontend
    npm install
    npm run dev  # Run on http://localhost:3000
    ```

## 🎨 Design Philosophy
- **Gen-Z Aesthetic**: Use of vibrant gradients, soft shadows (`box-shadow`), and glassmorphism (`backdrop-filter`).
- **Responsive**: Mobile-first design for the scrolling generation.
- **Premium Feel**: Heavy use of professional typography (`Outfit`) and smooth transitions (`framer-motion`).

## 🛡 Security & Optimization
- **Secure API**: Helmet headers, Rate limiting, CORS configuration.
- **Performance**: Image optimization, Lazy loading components.
- **SEO**: Meta tags and semantic HTML.

---

