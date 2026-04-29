import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, CheckCircle, XCircle, Home } from 'lucide-react';

const ResultPage = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/student/attempts/${attemptId}/results`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch results', err);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Calculating Score...</div>;
  if (!data) return <div className="text-center p-12 text-white">Results not found.</div>;

  const { attempt, responses } = data;
  const totalQuestions = responses.length;
  const correctAnswers = responses.filter(r => r.is_correct).length;
  const percentage = (attempt.score / (totalQuestions || 1)) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-12 glass-morphism p-12">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-indigo-600/20 rounded-full text-indigo-500 animate-bounce">
            <Trophy size={64} />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Exam Completed!</h1>
        <p className="text-slate-400 text-lg mb-8">You've successfully submitted your attempt.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Score</p>
            <p className="text-3xl font-bold text-indigo-400">{attempt.score}</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-emerald-400">{percentage.toFixed(0)}%</p>
          </div>
          <div className="col-span-2 md:col-span-1 p-4 bg-slate-800 rounded-xl">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <p className="text-3xl font-bold text-slate-200">{attempt.score >= (totalQuestions/2) ? 'Passed' : 'Try Again'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold mb-6">Question Review</h2>
        {responses.map((resp, idx) => (
          <div key={idx} className={`p-6 glass-morphism border-l-4 ${resp.is_correct ? 'border-emerald-500' : 'border-rose-500'}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-lg font-medium">{resp.text}</p>
              {resp.is_correct ? (
                <CheckCircle className="text-emerald-500 shrink-0" size={24} />
              ) : (
                <XCircle className="text-rose-500 shrink-0" size={24} />
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-slate-400">Your Answer:</span>
                <span className={resp.is_correct ? 'text-emerald-400' : 'text-rose-400'}>{resp.answer || '(No answer)'}</span>
              </div>
              {!resp.is_correct && (
                <div className="flex gap-2">
                  <span className="text-slate-400">Correct Answer:</span>
                  <span className="text-emerald-400">{resp.correct_answer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Link to="/dashboard" className="btn-primary flex items-center gap-2">
          <Home size={20} /> Back to Dashboard
        </Link>
        <Link to={`/leaderboard/${attempt.exam_id}`} className="btn-secondary flex items-center gap-2">
          View Leaderboard
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;
