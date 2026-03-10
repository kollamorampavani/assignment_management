# Assignment Management System

A full-stack application for managing academic assignments, featuring a React frontend and a Node.js/Express backend.

## 🚀 Features

- **User Authentication**: Secure login and registration for students and teachers.
- **Assignment Tracking**: Create, view, and submit assignments.
- **Dashboard**: Real-time analytics and overview of pending tasks.
- **Backend API**: Robust RESTful API built with Express and connected to MySQL/Supabase.
- **Modern UI**: Responsive design built with React and Vite.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, React Router, Recharts, Axios
- **Backend**: Node.js, Express, MySQL2, JWT, Multer (File Uploads)
- **Email**: Nodemailer for notifications

## 📂 Project Structure

- `frontend/`: React application (Vite)
- `backend/`: Express server and database logic

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL or Supabase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kollamorampavani/assignment_management.git
   cd assignment_management
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Configure your .env file based on .env.example
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📝 License

This project is licensed under the MIT License.
