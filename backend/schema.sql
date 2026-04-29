CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK( role IN ('admin', 'student') )
);

CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER NOT NULL, -- in minutes
    max_attempts INTEGER DEFAULT 1,
    start_time DATETIME,
    end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    type TEXT CHECK( type IN ('mcq', 'short_answer', 'coding') ),
    text TEXT NOT NULL,
    options TEXT, -- JSON string for MCQ options
    correct_answer TEXT, -- for mcq or short answer
    test_cases TEXT, -- JSON string for coding test cases
    points INTEGER DEFAULT 1,
    FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exam_id INTEGER,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress', -- in_progress, submitted
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(exam_id) REFERENCES exams(id)
);

CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    question_id INTEGER,
    answer TEXT, -- user's selected option or typed text/code
    is_correct BOOLEAN,
    points_awarded INTEGER DEFAULT 0,
    FOREIGN KEY(attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);
