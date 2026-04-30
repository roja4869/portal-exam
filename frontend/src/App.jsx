import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RoleLogin from './pages/RoleLogin';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExamAttempt from './pages/ExamAttempt';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import CreateExam from './pages/CreateExam';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  
  if (!user) {
    // If not logged in, redirect to landing page
    return <Navigate to="/" />;
  }
  
  if (role && user.role !== role) {
    // If role mismatch, redirect to respective dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin/login" element={<RoleLogin expectedRole="admin" />} />
            <Route path="/student/login" element={<RoleLogin expectedRole="student" />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Student Protected Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/exam/:id" element={
              <ProtectedRoute role="student">
                <ExamAttempt />
              </ProtectedRoute>
            } />

            <Route path="/result/:attemptId" element={
              <ProtectedRoute role="student">
                <ResultPage />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/create-exam" element={
              <ProtectedRoute role="admin">
                <CreateExam />
              </ProtectedRoute>
            } />

            <Route path="/admin/edit-exam/:id" element={
              <ProtectedRoute role="admin">
                <CreateExam />
              </ProtectedRoute>
            } />

            {/* Mixed/Shared Protected Routes */}
            <Route path="/leaderboard/:examId" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/dashboard" element={<Navigate to="/student/dashboard" />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
