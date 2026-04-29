import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
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
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={
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

            <Route path="/leaderboard/:examId" element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
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

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
