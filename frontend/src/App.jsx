import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import TeacherCourses from './pages/TeacherCourses';
import StudentCourses from './pages/StudentCourses';
import TeacherAssignments from './pages/TeacherAssignments';
import StudentAssignments from './pages/StudentAssignments';
import ViewSubmissions from './pages/ViewSubmissions';
import StudentGrades from './pages/StudentGrades';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Analytics from './pages/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Home Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute role="teacher">
            <Layout>
              <TeacherDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher-courses" element={
          <ProtectedRoute role="teacher">
            <Layout>
              <TeacherCourses />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/teacher-assignments" element={
          <ProtectedRoute role="teacher">
            <Layout>
              <TeacherAssignments />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/view-submissions" element={
          <ProtectedRoute role="teacher">
            <Layout>
              <ViewSubmissions />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute role="teacher">
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute role="student">
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/my-courses" element={
          <ProtectedRoute role="student">
            <Layout>
              <StudentCourses />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/assignments" element={
          <ProtectedRoute role="student">
            <Layout>
              <StudentAssignments />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/grades" element={
          <ProtectedRoute role="student">
            <Layout>
              <StudentGrades />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

// Redirects user based on their role
const DashboardRedirect = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'teacher') return <Navigate to="/teacher-dashboard" />;
  return <Navigate to="/student-dashboard" />;
};

export default App;
