import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const ExamAttempt = () => {
  const { id: attemptId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const res = await api.get(`/student/attempts/${attemptId}/questions`);
        setQuestions(res.data);
        setTimeLeft(30 * 60); // 30 minutes default
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch exam', err);
        navigate('/dashboard');
      }
    };
    fetchExamData();
  }, [attemptId, navigate]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const responseArray = Object.entries(responses).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));
      await api.post(`/student/attempts/${attemptId}/submit`, { responses: responseArray });
      navigate(`/result/${attemptId}`);
    } catch (err) {
      alert('Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading Questions...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900 py-4 z-10 border-b border-slate-800">
        <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {questions.length}</h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg ${timeLeft < 60 ? 'bg-rose-900/40 text-rose-400' : 'bg-slate-800 text-indigo-400'}`}>
          <Clock size={20} /> {formatTime(timeLeft)}
        </div>
      </header>

      <main className="flex-grow glass-morphism p-8 mb-8">
        <div className="mb-8">
          <p className="text-xl leading-relaxed">{currentQuestion.text}</p>
        </div>

        <div className="space-y-4">
          {currentQuestion.type === 'mcq' && (
            JSON.parse(currentQuestion.options).map((option, idx) => (
              <label key={idx} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${responses[currentQuestion.id] === option ? 'bg-indigo-900/30 border-indigo-500 text-indigo-100' : 'border-slate-700 hover:bg-slate-800/50'}`}>
                <input 
                  type="radio" 
                  name={`q-${currentQuestion.id}`} 
                  className="hidden" 
                  onChange={() => handleResponseChange(currentQuestion.id, option)}
                  checked={responses[currentQuestion.id] === option}
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${responses[currentQuestion.id] === option ? 'border-indigo-500' : 'border-slate-500'}`}>
                  {responses[currentQuestion.id] === option && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>}
                </div>
                {option}
              </label>
            ))
          )}

          {currentQuestion.type === 'short_answer' && (
            <input 
              type="text" 
              className="input-field py-4" 
              placeholder="Type your answer here..."
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === 'coding' && (
            <textarea 
              className="input-field font-mono min-h-[300px] py-4" 
              placeholder="// Write your code here..."
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
            />
          )}
        </div>
      </main>

      <footer className="flex justify-between items-center py-6">
        <button 
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={20} /> Previous
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button onClick={handleSubmit} className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={20} /> Finish & Submit
          </button>
        ) : (
          <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="btn-primary flex items-center gap-2">
            Next <ChevronRight size={20} />
          </button>
        )}
      </footer>
    </div>
  );
};

export default ExamAttempt;
