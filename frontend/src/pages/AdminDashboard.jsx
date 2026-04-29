import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, BarChart2, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await api.get('/admin/exams');
      setExams(res.data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/admin/exams/${id}`);
        fetchExams();
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-slate-400">Manage your exams and track performance</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/create-exam" className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Create Exam
          </Link>
          <button onClick={logout} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto glass-morphism">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 font-semibold">Exam Title</th>
              <th className="px-6 py-4 font-semibold text-center">Time Limit</th>
              <th className="px-6 py-4 font-semibold text-center">Attempts</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{exam.title}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{exam.time_limit} mins</td>
                  <td className="px-6 py-4 text-center text-slate-400">{exam.max_attempts}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <Link to={`/leaderboard/${exam.id}`} className="p-2 text-indigo-400 hover:bg-indigo-900/20 rounded" title="Analytics">
                        <BarChart2 size={20} />
                      </Link>
                      <Link to={`/admin/edit-exam/${exam.id}`} className="p-2 text-emerald-400 hover:bg-emerald-900/20 rounded" title="Edit">
                        <Edit size={20} />
                      </Link>
                      <button onClick={() => handleDelete(exam.id)} className="p-2 text-rose-400 hover:bg-rose-900/20 rounded" title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No exams created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
