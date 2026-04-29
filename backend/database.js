const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const client = createClient({
    url: process.env.TURSO_URL || 'file:database.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            // Split schema into individual statements as executeMultiple is better for this
            const statements = schema.split(';').filter(s => s.trim() !== '');
            for (const statement of statements) {
                await client.execute(statement);
            }
            console.log('Database schema initialized on Turso.');
            await seedAdmin();
        }
    } catch (err) {
        console.error('Error initializing Turso database:', err.message);
    }
}

async function seedAdmin() {
    const bcrypt = require('bcryptjs');
    try {
        const res = await client.execute("SELECT id FROM users WHERE role = 'admin'");
        if (res.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.execute({
                sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                args: ['Admin', 'admin@example.com', hashedPassword, 'admin']
            });
            console.log('Default admin created on Turso: admin@example.com / admin123');
        }
    } catch (err) {
        console.error('Error seeding admin on Turso:', err);
    }
}

// Start initialization
initDb();

// Wrapper for compatibility with existing code
const dbGet = async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows[0] || null;
};

const dbAll = async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows;
};

const dbRun = async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    // Convert BigInt to String to prevent JSON serialization errors
    return { 
        lastID: res.lastInsertRowid ? res.lastInsertRowid.toString() : null, 
        changes: res.rowsAffected 
    };
};

module.exports = { client, dbGet, dbAll, dbRun };
