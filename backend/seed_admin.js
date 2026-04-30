const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@portal.com';
        const adminPassword = 'adminpassword123';
        
        const existingAdmin = await dbGet('SELECT * FROM users WHERE email = ?', [adminEmail]);
        
        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        await dbRun(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['System Admin', adminEmail, hashedPassword, 'admin']
        );
        
        console.log('Admin user created successfully');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

seedAdmin();
