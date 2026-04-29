# PragatiDesk

PragatiDesk is a role-based employee productivity and task management app with separate workflows for Admins, Team Leaders, and Employees. It combines ticket management, task assignment, performance tracking, notifications, and a modern dashboard UI built with React and Vite.

## Overview

The app is split into two parts:

- `frontend/`: React + Vite dashboard application
- `backend/`: Express + MongoDB API

Current core capabilities include:

- Admin dashboard for employee, ticket, and performance visibility
- Team member creation with role assignment
- Ticket creation and assignment to team leaders
- Task creation and assignment to employees
- Employee task board with status updates, timers, and delay requests
- Performance insights and leaderboard views
- Real-time notifications using Pusher
- Avatar upload support through Cloudinary

## User Roles

### Admin

- View organization-wide metrics
- Create employees and team leaders
- Create and assign tickets
- Review employee performance and leaderboard data

### Team Leader

- View assigned work
- Break tickets into tasks
- Assign tasks to employees
- Review delay requests

### Employee

- View assigned tasks in a board layout
- Start and stop task timers
- Mark tasks as completed
- Submit delay requests for blocked work

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Recharts
- Pusher JS
- Lucide React

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Nodemailer
- Pusher

## Project Structure

```text
learning-projects/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
├── backend/
│   ├── api/
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
```

## Getting Started

### 1. Clone the project

```bash
git clone <your-repository-url>
cd learning-projects
```

### 2. Install dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

ADMIN_NAME=Asha Verma
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_DEPARTMENT=Engineering
ADMIN_AVATAR=AV

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM=no-reply@example.com

PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Backend default URL:

```text
http://localhost:5000
```

Health check endpoint:

```text
GET http://localhost:5000/api/health
```

## Important Notes

- The backend requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` to be set. On startup, it ensures there is exactly one active admin account in the system.
- SMTP configuration is required if you want automatic credential emails for newly created users.
- Pusher configuration is optional for local development, but required for real-time notifications.
- Cloudinary configuration is required if you want avatar uploads from the frontend.

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev
npm start
```

## Current Feature Modules

- Authentication and session handling
- Admin dashboard
- Employee and team leader management
- Ticket management
- Task assignment and progress tracking
- Delay request workflow
- Notifications
- Performance analytics
- Leaderboard

## Planned Enhancements

- In-app communication module for direct chat and task-level discussion
- Meeting scheduling and meeting-link integration
- External communication integrations such as Slack, Microsoft Teams, Google Meet, or Zoom
- Richer reporting and audit history

## API Summary

The backend exposes grouped routes under `/api`, including:

- `/api/auth`
- `/api/admin`
- `/api/leader`
- `/api/notifications`
- `/api/performance`
- `/api/tickets`

## Deployment Notes

- The frontend is ready to be deployed as a static Vite app.
- The backend includes `backend/vercel.json`, which suggests it can be adapted for Vercel-style deployment.
- Make sure environment variables are configured in your hosting platform before deployment.

## Status

This project is currently focused on employee productivity, task operations, and performance visibility. Communication features such as chat and meetings are a natural next step and can be added either directly inside the app or through integrations with external collaboration tools.
