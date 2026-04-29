import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 glass-morphism">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-full">
            <LogIn size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-900/30 border border-red-900/50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary">Sign In</button>
        </form>
        
        <p className="mt-6 text-center text-slate-400">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
