# SellIt – Verified Marketplace

A managed marketplace platform where every item is physically verified by an admin before going live.

## Project Structure

```
Sellit/
├── backend/        # Node.js + Express API
└── frontend/       # Next.js 15 app
```

## Quick Start

### 1. Environment Setup

**Backend** – copy `backend/.env.example` to `backend/.env` and fill in:
- `MONGODB_URI` – your MongoDB connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` – strong random strings
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – from cloudinary.com
- `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` – from paystack.com
- `ADMIN_REGISTRATION_CODE` – secret code for admin sign-up

**Frontend** – copy `frontend/.env.local.example` to `frontend/.env.local` and fill in:
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` – your Paystack public key

### 2. Install & Run

```bash
# Backend
cd backend
npm install --legacy-peer-deps
npm run dev          # runs on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev          # runs on port 3000
```

## Business Flow

1. **Seller** registers (role: seller) → uploads item with photos
2. **Admin** receives pending listing → contacts seller → visits physically → approves and sets price
3. **Buyer** browses verified items → clicks "Buy Now" → Paystack payment modal opens
4. Buyer pays `item price + 10% platform fee`
5. **Admin** marks item as delivered → releases 90% to seller

## User Roles

| Role | Access |
|------|--------|
| Buyer | Browse, purchase, view history |
| Seller | All buyer access + list items, seller dashboard |
| Admin | Full admin panel + item review + transaction management |

## Pages

- `/` – Browse verified items
- `/register` – Create account (buyer/seller)
- `/login` – Sign in
- `/items/[id]` – Item detail + buy button
- `/dashboard` – Seller listings dashboard
- `/dashboard/upload` – Upload new item
- `/history` – Purchase history
- `/admin` – Admin dashboard
- `/admin/items` – Review/approve/reject items
- `/admin/items/[id]` – Detailed item review
- `/admin/transactions` – Manage payments and deliveries
- `/payment/verify` – Payment confirmation page

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Refresh Tokens |
| Storage | Cloudinary |
| Payments | Paystack |
