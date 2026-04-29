const express = require('express');
const router = express.Router();
const { dbGet, dbAll, dbRun } = require('../database');

// All routes here should be protected by authenticate and authorizeAdmin middleware
// See server.js for how this is mounted

// --- EXAMS ---

// Create an exam
router.post('/exams', async (req, res) => {
    try {
        const { title, description, time_limit, max_attempts, start_time, end_time } = req.body;
        const result = await dbRun(
            'INSERT INTO exams (title, description, time_limit, max_attempts, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, time_limit, max_attempts, start_time || null, end_time || null, req.user.id]
        );
        res.status(201).json({ id: result.lastID, message: 'Exam created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all exams
router.get('/exams', async (req, res) => {
    try {
        const exams = await dbAll('SELECT * FROM exams');
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific exam with questions
router.get('/exams/:id', async (req, res) => {
    try {
        const exam = await dbGet('SELECT * FROM exams WHERE id = ?', [req.params.id]);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        
        const questions = await dbAll('SELECT * FROM questions WHERE exam_id = ?', [req.params.id]);
        res.json({ ...exam, questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update an exam
router.put('/exams/:id', async (req, res) => {
    try {
        const { title, description, time_limit, max_attempts, start_time, end_time } = req.body;
        await dbRun(
            'UPDATE exams SET title = ?, description = ?, time_limit = ?, max_attempts = ?, start_time = ?, end_time = ? WHERE id = ?',
            [title, description, time_limit, max_attempts, start_time || null, end_time || null, req.params.id]
        );
        res.json({ message: 'Exam updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete an exam
router.delete('/exams/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM exams WHERE id = ?', [req.params.id]);
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- QUESTIONS ---

// Add a question to an exam
router.post('/exams/:examId/questions', async (req, res) => {
    try {
        const { type, text, options, correct_answer, test_cases, points } = req.body;
        const examId = req.params.examId;
        
        const result = await dbRun(
            'INSERT INTO questions (exam_id, type, text, options, correct_answer, test_cases, points) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [examId, type, text, JSON.stringify(options), correct_answer, JSON.stringify(test_cases), points || 1]
        );
        res.status(201).json({ id: result.lastID, message: 'Question added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a question
router.delete('/questions/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- ANALYTICS ---

// Get all attempts for an exam
router.get('/exams/:id/attempts', async (req, res) => {
    try {
        const attempts = await dbAll(`
            SELECT a.*, u.name as student_name, u.email as student_email 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.exam_id = ?
            ORDER BY a.score DESC, a.end_time ASC
        `, [req.params.id]);
        res.json(attempts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
