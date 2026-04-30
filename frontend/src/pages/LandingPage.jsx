import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Exam Portal
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Secure, efficient, and professional examination management system. 
            Choose your portal to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Login Card */}
          <div 
            onClick={() => navigate('/student/login')}
            className="group relative p-8 glass-morphism cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-6 bg-indigo-500/20 rounded-2xl group-hover:bg-indigo-500/30 transition-colors">
                <GraduationCap size={48} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Student Login</h2>
              <p className="text-slate-400 mb-8">
                Access your exams, view results, and track your performance in real-time.
              </p>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
                Login as Student
              </button>
            </div>
          </div>

          {/* Admin Login Card */}
          <div 
            onClick={() => navigate('/admin/login')}
            className="group relative p-8 glass-morphism cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-6 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors">
                <ShieldCheck size={48} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
              <p className="text-slate-400 mb-8">
                Manage exams, monitor student activities, and analyze results across the platform.
              </p>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/20 group-hover:bg-purple-500 transition-colors">
                Login as Admin
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-slate-500 text-sm">
          &copy; 2026 Exam Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
