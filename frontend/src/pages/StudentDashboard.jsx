import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, PlayCircle, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/student/exams');
        setExams(res.data);
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = async (examId) => {
    try {
      const res = await api.post(`/student/exams/${examId}/start`);
      navigate(`/exam/${res.data.attemptId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start exam');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user?.name}</h1>
          <p className="text-slate-400">Ready for your exams?</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="text-indigo-500" /> Available Exams
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div key={exam.id} className="p-6 glass-morphism hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">{exam.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-6">
                    <span className="flex items-center gap-1">
                      <Clock size={16} className="text-indigo-400" /> {exam.time_limit} mins
                    </span>
                    <span className="px-2 py-1 bg-indigo-900/30 text-indigo-300 rounded text-xs">
                      Max Attempts: {exam.max_attempts}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleStartExam(exam.id)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} /> Take Exam
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center glass-morphism text-slate-400">
              No exams available at the moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
