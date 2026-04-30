const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const client = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initTurso() {
    console.log("🚀 Initializing Turso connection...");
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').filter(s => s.trim() !== '');
        
        for (const statement of statements) {
            await client.execute(statement);
        }
        console.log("✅ Tables created on Turso.");

        // Seed admin
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await client.execute({
            sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            args: ['Admin', 'admin@example.com', hashedPassword, 'admin']
        }).catch(e => console.log("Admin might already exist, skipping..."));
        
        console.log("✅ Admin seeded on Turso: admin@example.com / admin123");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
    process.exit();
}

initTurso();
