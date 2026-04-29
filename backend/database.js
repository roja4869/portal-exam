const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DATABASE_FILE || './database.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error initializing database schema:', err.message);
            } else {
                console.log('Database schema initialized.');
                seedAdmin();
            }
        });
    }
}

function seedAdmin() {
    const bcrypt = require('bcryptjs');
    db.get("SELECT id FROM users WHERE role = 'admin'", async (err, row) => {
        if (err) {
            console.error('Error checking for admin:', err);
            return;
        }
        if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ['Admin', 'admin@example.com', hashedPassword, 'admin'],
                (err) => {
                    if (err) console.error('Error creating default admin:', err);
                    else console.log('Default admin created: admin@example.com / admin123');
                }
            );
        }
    });
}

// Wrapper for promises
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this); // returns an object containing lastID and changes
    });
});

module.exports = { db, dbGet, dbAll, dbRun };
