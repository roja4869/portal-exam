const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');

// All routes here should be protected by authenticate middleware

// Get all available exams
router.get('/exams', async (req, res) => {
    try {
        const now = new Date().toISOString();
        const exams = await dbAll(`
            SELECT id, title, description, time_limit, start_time, end_time, max_attempts 
            FROM exams 
            WHERE (start_time IS NULL OR start_time <= ?) 
              AND (end_time IS NULL OR end_time >= ?)
        `, [now, now]);
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start an exam attempt
router.post('/exams/:id/start', async (req, res) => {
    try {
        const examId = req.params.id;
        const userId = req.user.id;

        const exam = await dbGet('SELECT * FROM exams WHERE id = ?', [examId]);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        // Check attempts
        const attemptsCountInfo = await dbGet('SELECT COUNT(*) as count FROM attempts WHERE user_id = ? AND exam_id = ?', [userId, examId]);
        if (exam.max_attempts && attemptsCountInfo.count >= exam.max_attempts) {
            return res.status(403).json({ error: 'Maximum attempts reached' });
        }

        // Check if an attempt is already in progress
        const inProgress = await dbGet('SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = ?', [userId, examId, 'in_progress']);
        if (inProgress) {
            return res.status(400).json({ error: 'Attempt already in progress', attemptId: inProgress.id });
        }

        const result = await dbRun(
            'INSERT INTO attempts (user_id, exam_id, status) VALUES (?, ?, ?)',
            [userId, examId, 'in_progress']
        );

        res.status(201).json({ attemptId: result.lastID, message: 'Exam started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get exam questions for an attempt
router.get('/attempts/:attemptId/questions', async (req, res) => {
    try {
        const attempt = await dbGet('SELECT * FROM attempts WHERE id = ? AND user_id = ?', [req.params.attemptId, req.user.id]);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
        if (attempt.status === 'submitted') return res.status(400).json({ error: 'Attempt already submitted' });

        // Don't send correct answers to the student
        const questions = await dbAll('SELECT id, type, text, options, points FROM questions WHERE exam_id = ?', [attempt.exam_id]);
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit an exam attempt
router.post('/attempts/:attemptId/submit', async (req, res) => {
    try {
        const { responses } = req.body; // Array of { questionId, answer }
        const attemptId = req.params.attemptId;

        const attempt = await dbGet('SELECT * FROM attempts WHERE id = ? AND user_id = ?', [attemptId, req.user.id]);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
        if (attempt.status === 'submitted') return res.status(400).json({ error: 'Attempt already submitted' });

        const questions = await dbAll('SELECT * FROM questions WHERE exam_id = ?', [attempt.exam_id]);
        
        let totalScore = 0;

        for (let resp of responses) {
            const question = questions.find(q => q.id === resp.questionId);
            if (!question) continue;

            let isCorrect = false;
            let pointsAwarded = 0;

            if (question.type === 'mcq' || question.type === 'short_answer') {
                if (resp.answer && resp.answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()) {
                    isCorrect = true;
                    pointsAwarded = question.points;
                    totalScore += question.points;
                }
            } else if (question.type === 'coding') {
                pointsAwarded = 0;
            }

            await dbRun(
                'INSERT INTO responses (attempt_id, question_id, answer, is_correct, points_awarded) VALUES (?, ?, ?, ?, ?)',
                [attemptId, resp.questionId, resp.answer, isCorrect, pointsAwarded]
            );
        }

        const endTime = new Date().toISOString();
        await dbRun(
            'UPDATE attempts SET status = ?, end_time = ?, score = ? WHERE id = ?',
            ['submitted', endTime, totalScore, attemptId]
        );

        res.json({ message: 'Exam submitted successfully', score: totalScore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get results of an attempt
router.get('/attempts/:attemptId/results', async (req, res) => {
    try {
        const attempt = await dbGet('SELECT * FROM attempts WHERE id = ? AND user_id = ?', [req.params.attemptId, req.user.id]);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

        const responses = await dbAll(`
            SELECT r.*, q.text, q.type, q.correct_answer, q.points 
            FROM responses r
            JOIN questions q ON r.question_id = q.id
            WHERE r.attempt_id = ?
        `, [req.params.attemptId]);

        res.json({ attempt, responses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leaderboard for an exam (accessible by students)
router.get('/exams/:id/leaderboard', async (req, res) => {
    try {
        const attempts = await dbAll(`
            SELECT a.id, a.score, a.end_time, u.name as student_name, u.email as student_email 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.exam_id = ? AND a.status = 'submitted'
            ORDER BY a.score DESC, a.end_time ASC
        `, [req.params.id]);
        
        const exam = await dbGet('SELECT title FROM exams WHERE id = ?', [req.params.id]);
        
        res.json({ attempts, examTitle: exam?.title || 'Exam' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
