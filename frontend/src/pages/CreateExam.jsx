import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, Plus, Trash2, X } from 'lucide-react';

const CreateExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examInfo, setExamInfo] = useState({
    title: '',
    description: '',
    time_limit: 30,
    max_attempts: 1,
    start_time: '',
    end_time: ''
  });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchExam = async () => {
        try {
          const res = await api.get(`/admin/exams/${id}`);
          setExamInfo({
            title: res.data.title,
            description: res.data.description,
            time_limit: res.data.time_limit,
            max_attempts: res.data.max_attempts,
            start_time: res.data.start_time || '',
            end_time: res.data.end_time || ''
          });
          setQuestions(res.data.questions.map(q => ({
            ...q,
            options: JSON.parse(q.options || '[]'),
            test_cases: JSON.parse(q.test_cases || '[]')
          })));
        } catch (err) {
          console.error('Failed to fetch exam', err);
        }
      };
      fetchExam();
    }
  }, [id]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      type: 'mcq',
      text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      isNew: true
    }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let examId = id;
      if (id) {
        await api.put(`/admin/exams/${id}`, examInfo);
      } else {
        const res = await api.post('/admin/exams', examInfo);
        examId = res.data.id;
      }

      // Save questions
      for (const q of questions) {
        if (q.isNew) {
          await api.post(`/admin/exams/${examId}/questions`, q);
        }
      }

      navigate('/admin');
    } catch (err) {
      alert('Failed to save exam');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{id ? 'Edit Exam' : 'Create New Exam'}</h1>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={20} /> Save Exam
        </button>
      </header>

      <form className="space-y-8">
        <section className="p-8 glass-morphism space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Exam Title</label>
              <input 
                type="text" className="input-field" 
                value={examInfo.title} 
                onChange={(e) => setExamInfo({...examInfo, title: e.target.value})}
                placeholder="e.g., React Certification Exam"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                className="input-field h-24" 
                value={examInfo.description}
                onChange={(e) => setExamInfo({...examInfo, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (mins)</label>
              <input 
                type="number" className="input-field" 
                value={examInfo.time_limit}
                onChange={(e) => setExamInfo({...examInfo, time_limit: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Attempts</label>
              <input 
                type="number" className="input-field" 
                value={examInfo.max_attempts}
                onChange={(e) => setExamInfo({...examInfo, max_attempts: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-400">Questions ({questions.length})</h2>
            <button type="button" onClick={handleAddQuestion} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
              <Plus size={18} /> Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-8 glass-morphism relative group border-l-4 border-indigo-500">
              <button 
                type="button"
                onClick={() => handleRemoveQuestion(qIndex)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-2">Question Text</label>
                  <input 
                    type="text" className="input-field" 
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[qIndex].text = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select 
                    className="input-field"
                    value={q.type}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[qIndex].type = e.target.value;
                      setQuestions(newQs);
                    }}
                  >
                    <option value="mcq">MCQ</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
              </div>

              {q.type === 'mcq' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex gap-2">
                      <input 
                        type="text" className="input-field" 
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIndex].options[oIndex] = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newQs = [...questions];
                          newQs[qIndex].correct_answer = opt;
                          setQuestions(newQs);
                        }}
                        className={`px-3 rounded-lg border transition-colors ${q.correct_answer === opt ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-slate-500 hover:border-emerald-500'}`}
                        title="Mark as Correct"
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(q.type === 'short_answer' || q.type === 'coding') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Correct Answer / Solution</label>
                  <textarea 
                    className="input-field font-mono" 
                    value={q.correct_answer}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[qIndex].correct_answer = e.target.value;
                      setQuestions(newQs);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      </form>
    </div>
  );
};

export default CreateExam;
