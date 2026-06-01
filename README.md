# Arnifi Job Portal 🚀

A full-stack Job Application Portal built with **React** (Vite), **Redux Toolkit**, **React Router**, and **Node.js/Express/MongoDB**.

![Architecture](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)
![Architecture](https://img.shields.io/badge/Backend-Express-000000?style=flat&logo=express)
![Architecture](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)
![Architecture](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?style=flat&logo=redux)

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Employer / Candidate)
- Protected routes on frontend and backend

### For Employers
- Create, edit, and delete job postings
- View all applications for their jobs
- Update application status (Pending → Reviewed → Shortlisted → Accepted/Rejected)
- Dashboard with statistics

### For Candidates
- Browse and search jobs (by keyword, type)
- View detailed job descriptions
- Apply for jobs with cover letter
- Track application status

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| State Management | Redux Toolkit (createAsyncThunk) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Styling | Vanilla CSS (Dark Theme) |

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/signup` | ❌ | — | Register user |
| POST | `/api/auth/login` | ❌ | — | Login |
| GET | `/api/auth/me` | ✅ | — | Get profile |
| GET | `/api/jobs` | ❌ | — | List jobs |
| GET | `/api/jobs/:id` | ❌ | — | Get job |
| POST | `/api/jobs` | ✅ | Employer | Create job |
| PUT | `/api/jobs/:id` | ✅ | Employer | Update job |
| DELETE | `/api/jobs/:id` | ✅ | Employer | Delete job |
| POST | `/api/jobs/:id/apply` | ✅ | Candidate | Apply |
| GET | `/api/applications` | ✅ | Both | Get applications |
| PUT | `/api/applications/:id` | ✅ | Employer | Update status |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Configure environment
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/arnifi-jobs
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### 3. Seed the database (optional)
```bash
cd backend && node seed.js
```

### 4. Run the app
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000/api

### Test Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Employer | employer@arnifi.com | password123 |
| Employer | alex@techcorp.com | password123 |
| Candidate | candidate@arnifi.com | password123 |

## Project Structure
```
arinifi/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/auth.js     # JWT & role middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routes
│   ├── seed.js               # Database seeder
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/store.js      # Redux store
│   │   ├── features/         # Redux slices
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   └── index.css         # Design system
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## License
MIT
