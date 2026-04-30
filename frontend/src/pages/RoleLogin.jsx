import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, GraduationCap, ArrowLeft } from 'lucide-react';

const RoleLogin = ({ expectedRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isAdmin = expectedRole === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Role validation
      if (data.user.role !== expectedRole) {
        // If wrong role, logout and show error
        localStorage.removeItem('token');
        setError(`Access Denied: This portal is for ${expectedRole}s only.`);
        setLoading(false);
        return;
      }

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900 relative">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Portal selection</span>
      </button>

      <div className="w-full max-w-md p-8 glass-morphism relative overflow-hidden">
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isAdmin ? 'bg-purple-600' : 'bg-indigo-600'}`} />
        
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-2xl ${isAdmin ? 'bg-purple-600/20' : 'bg-indigo-600/20'}`}>
            {isAdmin ? (
              <ShieldCheck size={40} className="text-purple-400" />
            ) : (
              <GraduationCap size={40} className="text-indigo-400" />
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">
          {isAdmin ? 'Admin Portal' : 'Student Portal'}
        </h2>
        <p className="text-center text-slate-400 mb-8">
          Enter your credentials to continue
        </p>
        
        {error && (
          <div className="p-4 mb-6 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${
              isAdmin 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
            } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        {!isAdmin && (
          <p className="mt-8 text-center text-slate-400">
            New student? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">Create an account</Link>
          </p>
        )}

        {isAdmin && (
          <p className="mt-8 text-center text-slate-500 text-xs">
            Admin accounts are managed by the system administrator.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoleLogin;
