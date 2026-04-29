import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Clock, Medal, ArrowLeft } from 'lucide-react';

const Leaderboard = () => {
  const { examId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Use the student-accessible endpoint which returns both attempts and exam info
        const res = await api.get(`/student/exams/${examId}/leaderboard`);
        setAttempts(res.data.attempts);
        setExamTitle(res.data.examTitle);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
        setError('Failed to load leaderboard data.');
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [examId]);

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading Leaderboard...</div>;
  if (error) return <div className="text-center p-12 text-white">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center gap-6 mb-12">
        <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-slate-400">{examTitle}</p>
        </div>
      </header>

      <div className="glass-morphism overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 font-semibold text-center w-20">Rank</th>
              <th className="px-6 py-4 font-semibold">Student Name</th>
              <th className="px-6 py-4 font-semibold text-center">Score</th>
              <th className="px-6 py-4 font-semibold text-right">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {attempts.length > 0 ? (
              attempts.map((attempt, index) => (
                <tr key={attempt.id} className={`hover:bg-slate-800/30 transition-colors ${index < 3 ? 'bg-indigo-900/10' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    {index === 0 && <Medal className="inline text-yellow-400" size={24} />}
                    {index === 1 && <Medal className="inline text-slate-300" size={24} />}
                    {index === 2 && <Medal className="inline text-amber-600" size={24} />}
                    {index > 2 && <span className="font-mono text-slate-500">#{index + 1}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{attempt.student_name}</span>
                      <span className="text-xs text-slate-500">{attempt.student_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-indigo-400">
                    {attempt.score}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-400">
                    {attempt.end_time ? (
                      <>
                        {new Date(attempt.end_time).toLocaleDateString()} <br />
                        {new Date(attempt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No attempts yet. Be the first!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
