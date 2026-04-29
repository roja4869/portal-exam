const { dbRun } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Seeding sample exam...');
        
        // 1. Ensure Admin exists
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await dbRun(
            "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Admin', 'admin@example.com', hashedPassword, 'admin']
        );

        // 2. Create Sample Exam
        const examResult = await dbRun(
            "INSERT INTO exams (title, description, time_limit, max_attempts) VALUES (?, ?, ?, ?)",
            ['General Knowledge Exam', 'A sample exam to test the platform connectivity.', 10, 5]
        );
        const examId = examResult.lastID;

        // 3. Add Questions
        const questions = [
            {
                type: 'mcq',
                text: 'What is the capital of France?',
                options: JSON.stringify(['Paris', 'London', 'Berlin', 'Madrid']),
                correct_answer: 'Paris',
                points: 1
            },
            {
                type: 'short_answer',
                text: 'What is 5 + 7?',
                correct_answer: '12',
                points: 1
            },
            {
                type: 'coding',
                text: 'Write a function that returns "Hello World"',
                correct_answer: 'function hello() { return "Hello World"; }',
                points: 5
            }
        ];

        for (const q of questions) {
            await dbRun(
                "INSERT INTO questions (exam_id, type, text, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)",
                [examId, q.type, q.text, q.options || null, q.correct_answer, q.points]
            );
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
